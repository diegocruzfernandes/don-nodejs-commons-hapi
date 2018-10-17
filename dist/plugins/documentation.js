'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _inert = require('inert');
var _inert2 = _interopRequireDefault(_inert);
var _vision = require('vision');
var _vision2 = _interopRequireDefault(_vision);
var _hapiSwaggered = require('hapi-swaggered');
var _hapiSwaggered2 = _interopRequireDefault(_hapiSwaggered);
var _hapiSwaggeredUi = require('hapi-swaggered-ui]');
var _hapiSwaggeredUi2 = _interopRequireDefault(_hapiSwaggeredUi);
var _utilsPackage = require('../utils/package');

var register = function register(server, options, next) {
  if (process.env.NODE_ENV !== 'production') {
    var optsSwaggered = {
      stripPrefix: options.config.routePath,
      tags: options.tags,
      info: options.info,
      auth: false
    };

    var optsSwaggeredUi = {
      title: options.title,
      path: '/docs',
      authorization: {
        field: 'authorization',
        scope: 'header',
        placeholder: 'Enter your token here'
      },
      swaggerOptions: {
        validatorUrl: null
      },
      auth: false
    };

    server.register([_inert2['default'], _vision2['default'], {
      register: _hapiSwaggered2['default'],
      options: optsSwaggered
    }, {
      register: _hapiSwaggered2['default'],
      options: optsSwaggeredUi
    }], function (err) {
      return next(err);
    });

    server.route({
      method: 'GET', 
      path: '/',
      config: {
        auth: false,
        handler: function handler(request, reply) {
          reply.redirect('/docs');
        }
      }
    });
  } else {
    next();
  }
};

register.attributes = {
  name: 'documentation',
  vertion: (0, _utilsPackage.version)()
};

exports['default'] = register;
module.exports = exports['default'];