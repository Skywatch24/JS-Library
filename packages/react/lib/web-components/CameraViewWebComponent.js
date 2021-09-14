"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CameraViewWebComponent = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactDom = _interopRequireDefault(require("react-dom"));

var _CameraView = _interopRequireDefault(require("../CameraView"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class CameraViewWebComponent extends HTMLElement {
  constructor() {
    super();
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
      controls: this.getAttribute('controls') === 'true',
      ref: this.cameraViewRef
    }), document.getElementById('camera-view-web-component'));
  }

}

exports.CameraViewWebComponent = CameraViewWebComponent;