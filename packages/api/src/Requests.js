const axios = require('axios');
const qs = require('qs');
const coreManager = require('./CoreManager');
const constants = require('./Constants');

const {
  API_KEY,
  SERVER_URL,
  LANG_SELECTOR,
  ALWAYS_CODE,
  ONETIME_CODE,
  SCHEDULE_CODE,
  RECURRING_CODE,
} = constants;

const getAuthStrings = () => {
  const token = coreManager.get(API_KEY);
  if (token.indexOf('OAUTH2-') !== -1) {
    return `access_token=${coreManager.get(API_KEY)}`;
  } else {
    return `api_key=${coreManager.get(API_KEY)}`;
  }
};

const getAuthParams = params => {
  const token = coreManager.get(API_KEY);
  if (token.indexOf('OAUTH2-') !== -1) {
    params['access_token'] = coreManager.get(API_KEY);
  } else {
    params['api_key'] = coreManager.get(API_KEY);
  }
  return params;
};

const getArchives = async (deviceId, archiveId, smartff) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const params = {
    scope: 'CloudArchives',
    lang: coreManager.get(LANG_SELECTOR),
    region: 's3-ap-northeast-1.amazonaws.com',
    archive_id: archiveId,
    smart_ff: smartff,
    _: timestamp,
  };
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/archives/link`,
    {
      params: getAuthParams(params),
    },
  );

  return res;
};

const getFlvStream = async deviceId => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const params = {
    lang: coreManager.get(LANG_SELECTOR),
    warnup: 1,
    _: timestamp,
  };
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/flvstream`,
    {
      params: getAuthParams(params),
    },
  );

  return res;
};

const getArchivesByRange = async (deviceId, scope, start_time, end_time) => {
  const params = {
    scope,
    start_time,
    end_time,
  };
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}/archives`,
    {
      params: getAuthParams(params),
    },
  );
  return res;
};

const getCacheTime = async (timestamp, deviceId) => {
  const params = {
    timestamp,
  };
  const res = await axios.get(
    `${coreManager.get(SERVER_URL)}/cameras/${deviceId}`,
    {
      params: getAuthParams(params),
    },
  );
  return res;
};

const getSensorStatus = async deviceId => {
  const url = `${coreManager.get(
    SERVER_URL,
  )}/devices/${deviceId}/status?${getAuthStrings()}`;
  const res = await axios.get(url, {});

  return res;
};

const updateSensorStatus = async (deviceId, status) => {
  const url = `${coreManager.get(SERVER_URL)}/devices/${deviceId}/status`;
  const params = {
    'params[switch_control]': status,
    device_id: deviceId,
  };
  const res = await axios.post(url, qs.stringify(getAuthParams(params)), {});

  return res;
};

const getPasscodeList = async deviceId => {
  const url = `${coreManager.get(
    SERVER_URL,
  )}/devices/${deviceId}/passcode?type=all_wo_removed&${getAuthStrings()}`;
  const res = await axios.get(url, {});

  return res;
};

const createPasscode = async (
  deviceId,
  name,
  email = '',
  passcode,
  type,
  startTime = '',
  endTime = '',
  startDate = '',
  endDate = '',
  week = '',
  timezone = '',
) => {
  const url = `${coreManager.get(SERVER_URL)}/devices/${deviceId}/passcode`;

  const userCode = {};
  userCode.alias = name;
  userCode.code = passcode;

  if (type === SCHEDULE_CODE) {
    userCode.schedule = `${startTime}-${endTime}`;
  } else if (type === ONETIME_CODE) {
    userCode.onetime = true;
  } else if (type === RECURRING_CODE) {
    userCode.recurring =
      startDate + '-' + endDate + ':' + startTime + '-' + endTime + ':' + week;
    userCode.timezone = timezone;
  }

  let params = {
    user_code: JSON.stringify(userCode),
    multi_code: 1,
    method_type: 'POST',
  };

  if (email !== '') params.email_address = email;

  const res = await axios.post(url, qs.stringify(getAuthParams(params)), {});

  return res;
};

const deletePasscode = async (deviceId, passcodeId, passcode) => {
  const url = `${coreManager.get(SERVER_URL)}/devices/${deviceId}/passcode`;
  const userCode = {};
  userCode.code = passcode;
  userCode.id = passcodeId;

  const params = {
    user_code: JSON.stringify(userCode),
    multi_code: 1,
    method_type: 'DELETE',
  };

  const res = await axios.post(url, qs.stringify(getAuthParams(params)), {});

  return res;
};

const getDeviceList = async () => {
  const url = `${coreManager.get(SERVER_URL)}/devices?${getAuthStrings()}`;
  const res = await axios.get(url, {});

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
  createPasscode,
  deletePasscode,
  getDeviceList,
};
