const axios = require('axios');
const skywatchAPI = require('@skywatch/api');
const config = require('./Config');
const coreManager = require('./CoreManager');

const {REGION, SCOPE} = skywatchAPI.Constants;

const default_lang = 'en';

const getArchives = async (
  deviceId,
  archiveId,
  smartff,
  lang = default_lang,
  apiKey,
) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const url = `${
    config.apiURL
  }/cameras/${deviceId}/archives/link?lang=${lang}&archive_id=${archiveId}&smart_ff=${smartff}&scope=${coreManager.get(
    SCOPE,
  )}&region=${coreManager.get(REGION)}&api_key=${apiKey}&_=${timestamp}`;

  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res;
};

const getFlvStream = async (deviceId, lang = default_lang, apiKey) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const url = `${config.apiURL}/cameras/${deviceId}/flvstream?lang=${lang}&warmup=1&api_key=${apiKey}&_=${timestamp}`;
  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return res;
};

module.exports = {getArchives, getFlvStream};
