"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/web.dom-collections.iterator.js");

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.to-string.js");

var _react = _interopRequireWildcard(require("react"));

var _video = _interopRequireDefault(require("video.js"));

var _propTypes = _interopRequireDefault(require("prop-types"));

require("video.js/dist/video-js.min.css");

var _api = require("@skywatch/api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const defaultPlayerOptions = {
  autoplay: true,
  muted: true,
  aspectRatio: '16:9',
  mobileView: false
};

const ArchivesPlayer = (_ref) => {
  let {
    playerOptions,
    onPlayerInit,
    onPlayerDispose,
    deviceId,
    archiveId,
    smart_ff,
    seek,
    style,
    controls,
    onTimeUpdate,
    onEnded,
    onReady
  } = _ref;
  const containerRef = (0, _react.useRef)(null);
  const [player, setPlayer] = (0, _react.useState)(null);
  const [lastArchiveId, setLastArchiveId] = (0, _react.useState)('');
  (0, _react.useEffect)(() => {
    if (deviceId !== '' && archiveId !== lastArchiveId) {
      initPlayer();
      setLastArchiveId(archiveId);
    }
  }, [deviceId, onPlayerInit, onPlayerDispose, playerOptions, archiveId, seek]);

  const initPlayer = async () => {
    if (player) {
      onPlayerDispose && onPlayerDispose(null);
      player.dispose();
      setPlayer(null);
    }

    const res = await _api.Requests.getArchives(deviceId, archiveId, smart_ff.toString());

    if (res.data && containerRef.current) {
      const videoEl = containerRef.current.querySelector('video');
      const videojsPlayer = (0, _video.default)(videoEl, _objectSpread(_objectSpread(_objectSpread({}, defaultPlayerOptions), playerOptions), {}, {
        sources: [{
          src: res.data
        }]
      }));
      videojsPlayer.currentTime(seek);
      onPlayerInit && onPlayerInit(videojsPlayer);
      setPlayer(videojsPlayer); // // for debug purpose
      // window.player = videojsPlayer;

      return () => {
        onPlayerDispose && onPlayerDispose(null);
        videojsPlayer.dispose();
        setPlayer(null);
      };
    }
  };

  return /*#__PURE__*/_react.default.createElement("div", {
    className: "player",
    ref: containerRef
  }, /*#__PURE__*/_react.default.createElement("video", {
    className: "video-js",
    controls: controls,
    style: style,
    id: "archive-video",
    onTimeUpdate: onTimeUpdate,
    onEnded: onEnded,
    onSeeked: () => onReady()
  }));
};

ArchivesPlayer.defaultProps = {
  seek: 0,
  smart_ff: 0,
  controls: true,
  onTimeUpdate: () => {},
  onEnded: () => {},
  onReady: () => {}
};
ArchivesPlayer.propTypes = {
  deviceId: _propTypes.default.string.isRequired,
  archiveId: _propTypes.default.string.isRequired,
  smart_ff: _propTypes.default.number.isRequired,
  onPlayerInit: _propTypes.default.func.isRequired,
  onPlayerDispose: _propTypes.default.func.isRequired,
  seek: _propTypes.default.number,
  playerOptions: _propTypes.default.object,
  style: _propTypes.default.object,
  controls: _propTypes.default.bool,
  onTimeUpdate: _propTypes.default.func,
  onEnded: _propTypes.default.func,
  onReady: _propTypes.default.func
};
var _default = ArchivesPlayer;
exports.default = _default;