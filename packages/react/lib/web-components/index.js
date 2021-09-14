"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _CameraViewWebComponent = require("./CameraViewWebComponent");

Object.keys(_CameraViewWebComponent).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (key in exports && exports[key] === _CameraViewWebComponent[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function get() {
      return _CameraViewWebComponent[key];
    }
  });
});