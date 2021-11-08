const axios = require('axios');
const qs = require('qs');
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

const getSensorStatus = async deviceId => {
  const url = `${coreManager.get(
    SERVER_URL,
  )}/devices/${deviceId}/status?api_key=${coreManager.get(API_KEY)}`;
  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return res;
};

const updateSensorStatus = async (deviceId, status) => {
  const url = `${coreManager.get(SERVER_URL)}/devices/${deviceId}/status`;
  const params = {
    'params[switch_control]': status,
    api_key: coreManager.get(API_KEY),
    device_id: deviceId,
  };
  const res = await axios.post(url, qs.stringify(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return res;
};

const getPasscodeList = async deviceId => {
  const url = `${coreManager.get(
    SERVER_URL,
  )}/devices/${deviceId}/passcode?type=all_wo_removed&api_key=${coreManager.get(
    API_KEY,
  )}`;
  const res = await axios.get(url, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return res;
};

const createSchudlePasscde = async (
  deviceId,
  name,
  email = '',
  passcode,
  startTime,
  endTime,
) => {
  const url = `${coreManager.get(SERVER_URL)}/devices/${deviceId}/passcode`;
  const scheduleTime = `${startTime}-${endTime}`;

  const userCode = {};
  userCode.alias = name;
  userCode.code = passcode;
  userCode.schedule = scheduleTime;

  let params = {
    user_code: JSON.stringify(userCode),
    multi_code: 1,
    api_key: coreManager.get(API_KEY),
    method_type: 'POST',
  };

  if (email !== '') params.email_address = email;

  const res = await axios.post(url, qs.stringify(params), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Access-Control-Allow-Origin': '*',
    },
  });

  return res;
};

module.exports = {
  getArchives,
  getFlvStream,
  getArchivesByRange,
  getCacheTime,
  getSensorStatus,
  updateSensorStatus,
  getPasscodeList,
  createSchudlePasscde,
};
