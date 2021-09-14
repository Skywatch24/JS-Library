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
Object.defineProperty(exports, "CameraView", {
  enumerable: true,
  get: function get() {
    return _CameraView.default;
  }
});
exports.initialize = void 0;

var _ArchivesPlayer = _interopRequireDefault(require("./ArchivesPlayer"));

var _FlvPlayer = _interopRequireDefault(require("./FlvPlayer"));

var _CameraView = _interopRequireDefault(require("./CameraView"));

var _api = require("@skywatch/api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  SERVER_URL,
  API_KEY
} = _api.Constants;

const initialize = (serverUrl, apiKey) => {
  _api.CoreManager.set(SERVER_URL, serverUrl);

  _api.CoreManager.set(API_KEY, apiKey);
};

exports.initialize = initialize;