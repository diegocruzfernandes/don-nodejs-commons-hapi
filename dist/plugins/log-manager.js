'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _utilsPackage = require('../utils/package');

var _bunyan = require('bunyan');

var _bunyan2 = _interopRequireDefault(_bunyan);

var _bunyanLogstashTcp = require('bunyan-logstash-tcp');

var _bunyanLogstashTcp2 = _interopRequireDefault(_bunyanLogstashTcp);

var _raven = require('raven');

var _raven2 = _interopRequireDefault(_raven);

var levels = ['trace', 'debug', 'info', 'warn', 'error'];
var levelTags = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error'
};

var register = function register(server, options, next) {
  options.logEvents = options.logEvents || ['onPostStart', 'onPostStop', 'response', 'request-error'];
  options.serializers = options.serializers || {};
  options.serializers.err = options.serializers.err || _bunyan2['default'].stdSerializers.err;
  options.serializers.req = options.serializers.req || _bunyan2['default'].stdSerializers.req;
  options.serializers.res = options.serializers.res || _bunyan2['default'].stdSerializers.res;
  options.sentryActive = options.sentryActive || process.env.NODE_ENV === 'production';

  if (options.sentryDSN && options.sentryActive) {
    _raven2['default'].config(options.sentryDSN, {
      autoBreadcrumbs: true,
      logger: options.loggerName,
      release: options.apiVersion,
      environment: process.env.NODE_ENV
    }).install();
  }

  if (process.env.NODE_ENV !== 'test') {
    options.streams = options.streams || [{
      level: 'info',
      stream: process.stdout
    }, {
      level: 'debug',
      type: 'raw',
      stream: _bunyanLogstashTcp2['default'].createStream({
        host: options.burzum.host,
        port: options.burzum.port,
        appName: options.appName
      })
    }];
  } else {
    options.level = 'fatal';
  }

  var logger = _bunyan2['default'].createLogger({
    name: options.loggerName,
    app: options.loggerName,
    env: process.env.NODE_ENV,
    serializers: options.serializers,
    level: options.level,
    streams: options.streams,
    bztoken: options.burzum.token,
    type: 'json',
    version: options.apiVersion
  });

  var tagToLevels = Object.assign({}, levelTags, options.tags);
  var allTags = options.allTags || 'info';

  var validTags = Object.keys(tagToLevels).filter(function (key) {
    return levels.indexOf(tagToLevels[key]) < 0;
  }).length === 0;
  if (!validTags || allTags && levels.indexOf(allTags) < 0) {
    return next(new Error('invalid tag levels'));
  }

  var mergeHapiLogData = options.mergeHapiLogData;

  // expose logger as 'server.logger()'
  server.decorate('server', 'logger', function () {
    return logger;
  });

  // set a logger for each request
  server.ext('onRequest', function (request, reply) {
    request.logger = logger.child(logChild(request, options));
    reply['continue']();
  });

  server.on('log', function (event) {
    logEvent(logger, event);
  });

  server.on('request', function (request, event) {
    request.logger = request.logger || logger.child(logChild(request, options));
    logEvent(request.logger, event);
  });

  // log when a request completes with an error
  tryAddEvent(server, options, 'on', 'request-error', function (request, err) {
    if (options.sentryDSN && options.sentryActive) {
      _raven2['default'].captureException(err);
    }

    request.logger.warn(logPattern(request, err), 'request error');
  });

  // log when a request completes
  tryAddEvent(server, options, 'on', 'response', function (request) {
    request.logger.info(logPattern(request), 'request completed');
  });

  tryAddEvent(server, options, 'ext', 'onPostStart', function (s, cb) {
    logger.info(server.info, 'server started');
    cb();
  });

  tryAddEvent(server, options, 'ext', 'onPostStop', function (s, cb) {
    logger.info(server.info, 'server stopped');
    cb();
  });

  next();

  function tryAddEvent(server, options, type, event, cb) {
    if (options.logEvents && options.logEvents.indexOf(event) !== -1) {
      server[type](event, cb);
    }
  }

  function logEvent(current, event) {
    var tags = event.tags;
    var data = event.data;
    var level = undefined;
    var found = false;

    var logObject = undefined;
    if (mergeHapiLogData) {
      if (typeof data === 'string') {
        data = {
          msg: data
        };
      }

      logObject = Object.assign({
        tags: tags
      }, data);
    } else {
      logObject = {
        tags: tags,
        data: data
      };
    }

    for (var i = 0; i < tags.length; i++) {
      level = tagToLevels[tags[i]];
      if (level) {
        current[level](logObject);
        found = true;
        break;
      }
    }

    if (!found && allTags) {
      current[allTags](logObject);
    }
  }

  function logChild(request, options) {
    return {
      trace: {
        id: request.headers['messageid'] || request.id
      },
      http: {
        uri: request.url['pathname'],
        path: request.url['path'],
        url: '' + request.headers['host'] + request.url['path'],
        protocol: request.url['protocol'],
        host: request.headers['host'],
        user_agent: request.headers['user-agent'],
        request_body: JSON.stringify(request.payload),
        request_header: JSON.stringify(request.headers),
        request_method: request['method']
      },
      peer: {
        service: options.loggerName
      }
    };
  }

  function logPattern(request, err) {
    var info = request.info;
    var http = request.logger.fields.http || {};
    var peer = request.logger.fields.peer || {};
    var response = request.response || {};
    response._payload = response._payload || {};

    http['latency_seconds'] = (info.responded - info.received) / 1000.0;
    http['response_body'] = response._payload._data;
    http['response_header'] = JSON.stringify(request.response.headers);
    http['status_code'] = Number(request.raw.res.statusCode);
    http['request_body'] = JSON.stringify(request.payload);
    peer['hostname'] = request.logger.fields['hostname'];

    return {
      kind: 'request',
      http: http,
      peer: peer,
      err: err
    };
  }
};

register.attributes = {
  name: 'log-manager',
  version: (0, _utilsPackage.version)()
};

exports['default'] = register;
module.exports = exports['default'];
