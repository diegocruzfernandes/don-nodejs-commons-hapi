'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {'default': obj};
}

var _klawSync = require('klaw-sync');

var _klawSync2 = _interopRequireDefault(_klawSync);

var _utilsPackage = require('../utils/package');

var register = function register(server, options, next) {
  var routes = [];
  var filterFn = function filterFn(item) {
    return item.path.endsWith('-routes.js');
  };

  (0, _klawSync2['default'])(options.config.routesBaseDir, {filter: filterFn}).forEach(function (route) {
    var routeObject = {
      register: require(route.path),
      options: {
        config: options.config
      },
      routes: {
        prefix: options.config.routesPath
      }
    };
    routes.push(routeObject);
  });
  server.register(routes, function (err) {
    next(err);
  });
};

register.attributes = {
  name: 'routes',
  version: (0, _utilsPackage.version)()
};

exports['default'] = register;
module.exports = exports['default'];
