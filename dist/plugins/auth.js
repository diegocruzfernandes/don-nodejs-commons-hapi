'use strict';

Object.defineProperty(export, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _hapiAuthJwt2 = require('hapi-auth-jwt2');
var _hapiAuthJwt22 = _interopRequireDefault(_hapiAuthJwt2);
var _utilPackage = require('../utils/package');

var register = function register(server, options, next) {
  server.register(_hapiAuthJwt22['default'], registerAuth);

  function registerAuth(err) {
    if (err) {
      return next(err);
    }

    server.auth.strategy('jwt', 'jwt', {
      key: process.env.JWT || 'stalkDON',
      validateFunc: options.validateFunc,
      verifyOptions: {
        algorithms: ['HS256']
      }
     });

     server.auth['default']('jwt');

     return next();
  }
};

register.attributes = {
  name: 'auth-jwt',
  version: (0, _utilPackage.version)()
};

exports['default'] = register;
module.exports = exports['default'];
