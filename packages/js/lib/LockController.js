import { Requests, Constants } from '@skywatch/api';
const {
  ALWAYS_CODE,
  ONETIME_CODE,
  SCHEDULE_CODE,
  RECURRING_CODE
} = Constants;

const updateStatus = async (deviceId, status) => {
  const res = await Requests.updateSensorStatus(deviceId, status);

  if (res.data) {
    return res.data;
  }

  return '';
};

const getInfo = async deviceId => {
  const res = await Requests.getSensorStatus(deviceId);

  if (res.data) {
    return res.data;
  }

  return '';
};

const getPasscodeList = async deviceId => {
  const res = await Requests.getPasscodeList(deviceId);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createAlwaysPasscode = async (deviceId, name, passcode, email = '') => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, ALWAYS_CODE);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createOnetimePasscode = async (deviceId, name, passcode, email = '') => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, ONETIME_CODE);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createSchudlePasscode = async (deviceId, name, passcode, startTime, endTime, email = '') => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, SCHEDULE_CODE, startTime, endTime);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createRecurringPasscode = async (deviceId, name, passcode, startDate, endDate, startTime, endTime, week, timezone, email = '') => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, RECURRING_CODE, startTime, endTime, startDate, endDate, week, timezone);

  if (res.data) {
    return res.data;
  }

  return '';
};

const deletePasscode = async (deviceId, passcodeId, passcode) => {
  const res = await Requests.deletePasscode(deviceId, passcodeId, passcode);

  if (res.data) {
    return res.data;
  }

  return '';
};

const getLockHistory = async (deviceId, startTime, endTime) => {
  const res = await Requests.getDeviceHistory(deviceId, startTime, endTime);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createAlwaysQRcode = async (deviceIds, name, passcode, email = '') => {
  const res = await Requests.addQRcodeAccess(passcode, name, email, deviceIds, ALWAYS_CODE);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createOnetimeQRcode = async (deviceIds, name, passcode, email = '') => {
  const res = await Requests.addQRcodeAccess(passcode, name, email, deviceIds, ONETIME_CODE);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createSchudleQRcode = async (deviceIds, name, passcode, startTime, endTime, email = '') => {
  const res = await Requests.addQRcodeAccess(passcode, name, email, deviceIds, SCHEDULE_CODE, startTime, endTime);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createRecurringQRcode = async (deviceIds, name, passcode, startDate, endDate, startTime, endTime, week, timezone, email = '') => {
  const res = await Requests.addQRcodeAccess(passcode, name, email, deviceIds, RECURRING_CODE, startTime, endTime, startDate, endDate, week, timezone);

  if (res.data) {
    return res.data;
  }

  return '';
};

const deleteQRcode = async sharingUid => {
  const res = await Requests.deleteQRcodeAccess(sharingUid);

  if (res.data) {
    return res.data;
  }

  return '';
};

export default {
  updateStatus,
  getInfo,
  getPasscodeList,
  createAlwaysPasscode,
  createSchudlePasscode,
  createOnetimePasscode,
  createRecurringPasscode,
  deletePasscode,
  getLockHistory,
  createAlwaysQRcode,
  createOnetimeQRcode,
  createSchudleQRcode,
  createRecurringQRcode,
  deleteQRcode
};