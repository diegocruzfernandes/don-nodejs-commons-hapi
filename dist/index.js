#!/usr/bin/env node --use_strict
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _pluginsAuth = require('./plugins/auth');

var _pluginsAuth2 = _interopRequireDefault(_pluginsAuth);

var _pluginsDocumentation = require('./plugins/documentation');

var _pluginsDocumentation2 = _interopRequireDefault(_pluginsDocumentation);

var _pluginsLogManager = require('./plugins/log-manager');

var _pluginsLogManager2 = _interopRequireDefault(_pluginsLogManager);

var _pluginsRoutes = require('./plugins/routes');

var _pluginsRoutes2 = _interopRequireDefault(_pluginsRoutes);

exports['default'] = {
  Auth: _pluginsAuth2['default'],
  Documentation: _pluginsDocumentation2['default'],
  LogManager: _pluginsLogManager2['default'],
  Routes: _pluginsRoutes2['default']
};
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
