"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _axios = _interopRequireDefault(require("axios"));

var _Config = _interopRequireDefault(require("./Config"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  API_KEY,
  REGION,
  SCOPE
} = _CoreManager.default;

const getArchives = async (deviceId, archiveId, smartff) => {
  if (_CoreManager.default.get(API_KEY) === '') {
    throw 'Please initiate token';
  }

  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await _axios.default.get("".concat(_Config.default.apiURL, "/cameras/").concat(deviceId, "/archives/link?archive_id=").concat(archiveId, "&smart_ff=").concat(smartff, "&\n    scope=").concat(_CoreManager.default.get(SCOPE), "&region=").concat(_CoreManager.default.get(REGION), "\n    &api_key=").concat(_CoreManager.default.get(API_KEY), "&_=").concat(timestamp), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res;
};

const getFlvStream = async deviceId => {
  if (_CoreManager.default.get(API_KEY) === '') {
    throw 'Please initiate token';
  }

  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await _axios.default.get("".concat(_Config.default.apiURL, "/cameras/").concat(deviceId, "/flvstream?warmup=1\n    &api_key=").concat(_CoreManager.default.get(API_KEY), "&_=").concat(timestamp), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res;
};

var _default = {
  getArchives,
  getFlvStream
};
exports.default = _default;