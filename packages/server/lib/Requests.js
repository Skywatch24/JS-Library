"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlvStream = exports.getArchives = void 0;

require("core-js/modules/es.promise.js");

var _axios = _interopRequireDefault(require("axios"));

var _api = require("@skywatch/api");

var _Config = _interopRequireDefault(require("./Config"));

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  REGION,
  SCOPE
} = _api.Constants;
const default_lang = 'en';

const getArchives = async function getArchives(deviceId, archiveId, smartff) {
  let lang = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : default_lang;
  let apiKey = arguments.length > 4 ? arguments[4] : undefined;
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await _axios.default.get("".concat(_Config.default.apiURL, "/cameras/").concat(deviceId, "/archives/link?lang=").concat(lang, "&archive_id=").concat(archiveId, "&smart_ff=").concat(smartff, "&\n    scope=").concat(_CoreManager.default.get(SCOPE), "&region=").concat(_CoreManager.default.get(REGION), "\n    &api_key=").concat(apiKey, "&_=").concat(timestamp), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res;
};

exports.getArchives = getArchives;

const getFlvStream = async function getFlvStream(deviceId) {
  let lang = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : default_lang;
  let apiKey = arguments.length > 2 ? arguments[2] : undefined;
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await _axios.default.get("".concat(_Config.default.apiURL, "/cameras/").concat(deviceId, "/flvstream?lang=").concat(lang, "&warmup=1\n    &api_key=").concat(apiKey, "&_=").concat(timestamp), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  return res;
};

exports.getFlvStream = getFlvStream;