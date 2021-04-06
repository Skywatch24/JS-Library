"use strict";

require("core-js/modules/web.dom-collections.iterator.js");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _flv = _interopRequireDefault(require("flv.js"));

var _util = require("@skywatch/util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const FlvPlayer = (_ref) => {
  let {
    deviceId,
    onPlayerInit,
    onPlayerDispose,
    style
  } = _ref;
  const containerRef = (0, _react.useRef)(null);
  (0, _react.useEffect)(() => {
    const initPlayer = async () => {
      const res = await _util.Requests.getFlvStream(deviceId);

      if (res.data && _flv.default.isSupported() && containerRef.current) {
        const videoEl = containerRef.current.querySelector('video');

        const flvPlayer = _flv.default.createPlayer({
          type: 'flv',
          url: res.data,
          config: {
            enableWorker: true,
            enableStashBuffer: false,
            stashInitialSize: 128
          }
        });

        flvPlayer.attachMediaElement(videoEl);
        flvPlayer.load();
        flvPlayer.play();
        flvPlayer.on(_flv.default.Events.ERROR, (errType, errDetail) => {
          console.log(errType, errDetail);
        });
        onPlayerInit && onPlayerInit(flvPlayer);
      }

      return () => {
        onPlayerDispose && onPlayerDispose(null);
        flvPlayer.destroy();
      };
    };

    initPlayer();
  }, []);
  return /*#__PURE__*/_react.default.createElement("div", {
    className: "player",
    ref: containerRef
  }, /*#__PURE__*/_react.default.createElement("video", {
    id: "videoElement",
    controls: true,
    muted: true,
    style: style
  }));
};

FlvPlayer.defaultProps = {};
FlvPlayer.propTypes = {
  deviceId: _propTypes.default.string.isRequired,
  onPlayerInit: _propTypes.default.func.isRequired,
  onPlayerDispose: _propTypes.default.func.isRequired,
  style: _propTypes.default.object
};
var _default = FlvPlayer;
exports.default = _default;