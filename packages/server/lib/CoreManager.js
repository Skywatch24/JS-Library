"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _api = require("@skywatch/api");

const {
  SITE_URL,
  REGION,
  SCOPE
} = _api.Constants;
const config = {
  [SITE_URL]: 'service.skywatch24.com',
  [REGION]: 's3-ap-northeast-1.amazonaws.com',
  [SCOPE]: 'CloudArchives'
};

const get = key => {
  if (config.hasOwnProperty(key)) {
    if (config[key] !== '') {
      return config[key];
    }
  }

  throw new Error('Configuration key not found: ' + key);
};

const set = (key, value) => {
  if (config.hasOwnProperty(key)) {
    config[key] = value;
  } else {
    throw new Error('Incorrect key:' + key);
  }
};

var _default = {
  get,
  set
};
exports.default = _default;