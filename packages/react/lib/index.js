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
exports.CameraViewWebComponent = exports.initialize = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

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

class CameraViewWebComponent extends HTMLElement {
  constructor() {
    super();
    initialize('https://service.skywatch24.com/api/v2', 'af91fb71f874702f5a3b416bce92b6b2');
    this.cameraViewRef = /*#__PURE__*/_react.default.createRef();
  }

  play() {
    this.cameraViewRef.current.play();
  }

  pause() {
    this.cameraViewRef.current.pause();
  }

  fastForward() {
    this.cameraViewRef.current.fastForward();
  }

  toggleMute() {
    this.cameraViewRef.current.toggleMute();
  }

  goLive() {
    this.cameraViewRef.current.goLive();
  }

  seek(timestamp) {
    this.cameraViewRef.current.seek(timestamp);
  }

  getAllArchives() {
    return this.cameraViewRef.current.getAllArchives();
  }

  connectedCallback() {
    _reactDom.default.render( /*#__PURE__*/_react.default.createElement(_CameraView.default, {
      deviceId: this.getAttribute('deviceId'),
      controls: this.getAttribute('controls'),
      ref: this.cameraViewRef
    }), document.getElementById('camera-view-web-component'));
  }

}

exports.CameraViewWebComponent = CameraViewWebComponent;