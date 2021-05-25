"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _api = require("@skywatch/api");

var _CoreManager = _interopRequireDefault(require("./CoreManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const {
  SITE_URL
} = _api.Constants;

const config = () => ({
  apiURL: process.env.NODE_ENV === 'development' ? "/api/v2" : "https://".concat(_CoreManager.default.get(SITE_URL), "/api/v2")
});

var _default = config();

exports.default = _default;