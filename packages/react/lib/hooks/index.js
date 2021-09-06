"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _useInterval = require("./useInterval");

Object.keys(_useInterval).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _useInterval[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _useInterval[key];
    }
  });
});

var _usePageVisibility = require("./usePageVisibility");

Object.keys(_usePageVisibility).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _usePageVisibility[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _usePageVisibility[key];
    }
  });
});