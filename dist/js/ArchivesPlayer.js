"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

require("core-js/modules/es.regexp.to-string.js");

var _video = _interopRequireDefault(require("video.js"));

var _util = require("../util");

require("video.js/dist/video-js.min.css");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const defaultPlayerOptions = {
  autoplay: true,
  muted: true,
  aspectRatio: '16:9',
  mobileView: false
};

const ArchivesPlayer = async function ArchivesPlayer(tagEl, deviceId, archiveId) {
  let smart_ff = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
  let seek = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
  let options = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

  if (!tagEl || !deviceId || !archiveId) {
    throw 'Invalid Parameter';
  } // Get source url


  const res = await _util.Requests.getArchives(deviceId, archiveId, smart_ff.toString());

  if (res.data) {
    // Create Video tag
    const videoEl = document.createElement('video');
    videoEl.controls = true;
    videoEl.className = 'video-js';
    tagEl.appendChild(videoEl); // Initiate video

    const player = (0, _video.default)(videoEl, _objectSpread(_objectSpread(_objectSpread({}, defaultPlayerOptions), options), {}, {
      sources: [{
        src: res.data
      }]
    }));
    player.currentTime(seek);
    return player;
  }
};

var _default = ArchivesPlayer;
exports.default = _default;