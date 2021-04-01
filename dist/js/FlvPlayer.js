"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _flv = _interopRequireDefault(require("flv.js"));

var _util = require("../util");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FlvPlayer = async (videoEl, deviceId) => {
  if (!videoEl || !deviceId) {
    throw 'Invalid Parameter';
  }

  const res = await _util.Requests.getFlvStream(deviceId);

  if (res.data && _flv.default.isSupported()) {
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
    return flvPlayer;
  }
};

var _default = FlvPlayer;
exports.default = _default;