"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _util = require("./util");

const {
  API_KEY
} = _util.CoreManager;
const Skywatch = {
  initialize: apiKey => {
    _util.CoreManager.set(API_KEY, apiKey);
  }
};
Skywatch.ArchivesPlayer = require('./js/ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./js/FlvPlayer').default;
window.Skywatch = Skywatch;
var _default = Skywatch;
exports.default = _default;