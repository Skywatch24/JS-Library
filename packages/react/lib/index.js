"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
Object.defineProperty(exports, "ArchivesPlayer", {
  enumerable: true,
  get: function get() {
    return _ArchivesPlayer.default;
  }
});
Object.defineProperty(exports, "FlvPlayer", {
  enumerable: true,
  get: function get() {
    return _FlvPlayer.default;
  }
});
exports.initialize = void 0;

var _ArchivesPlayer = _interopRequireDefault(require("./ArchivesPlayer"));

var _FlvPlayer = _interopRequireDefault(require("./FlvPlayer"));

var _api = require("@skywatch/api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  SERVER_URL
} = _api.Constants;

const initialize = serverUrl => {
  _api.CoreManager.set(SERVER_URL, serverUrl);
};

exports.initialize = initialize;