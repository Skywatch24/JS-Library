"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es.promise.js");

var _api = require("@skywatch/api");

var _Requests = require("./Requests");

const {
  GET_ARCHIVES,
  GET_FLV_STREAM
} = _api.Constants;

const Server = async (feature, params) => {
  switch (feature) {
    case GET_ARCHIVES:
      {
        const {
          device_id,
          archive_id,
          smartff,
          lang,
          api_key
        } = params;
        const res = await (0, _Requests.getArchives)(device_id, archive_id, smartff, lang, api_key);
        return res;
      }

    case GET_FLV_STREAM:
      {
        const {
          device_id,
          lang,
          api_key
        } = params;
        const res = await (0, _Requests.getFlvStream)(device_id, lang, api_key);
        return res;
      }

    default:
      {
        return '';
      }
  }
};

var _default = Server;
exports.default = _default;