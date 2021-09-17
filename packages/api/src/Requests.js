const axios = require('axios');
const coreManager = require('./CoreManager');
const constants = require('./Constants');

const {API_KEY, SERVER_URL, LANG_SELECTOR} = constants;

const getArchives = async (deviceId, archiveId, smartff) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/archives/link`,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      params: {
        scope: 'CloudArchives',
        lang: coreManager.get(LANG_SELECTOR),
        region: 's3-ap-northeast-1.amazonaws.com',
        archive_id: archiveId,
        smart_ff: smartff,
        api_key: coreManager.get(API_KEY),
        _: timestamp,
      },
    },
  );

  return res;
};

const getFlvStream = async deviceId => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/flvstream`,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      params: {
        lang: coreManager.get(LANG_SELECTOR),
        warnup: 1,
        api_key: coreManager.get(API_KEY),
        _: timestamp,
      },
    },
  );

  return res;
};

const getArchivesByRange = async (deviceId, scope, start_time, end_time) => {
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/archives`,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      params: {
        api_key: coreManager.get(API_KEY),
        scope,
        start_time,
        end_time,
      },
    },
  );
  return res;
};

const getCacheTime = async (timestamp, deviceId) => {
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}`,
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      params: {
        api_key: coreManager.get(API_KEY),
        timestamp,
      },
    },
  );
  return res;
};

module.exports = {
  getArchives,
  getFlvStream,
  getArchivesByRange,
  getCacheTime,
};
