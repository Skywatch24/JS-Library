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

const createAlwaysPasscode = async (deviceId, name, email = '', passcode) => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, ALWAYS_CODE);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createSchudlePasscode = async (deviceId, name, email = '', passcode, startTime, endTime) => {
  const res = await Requests.createPasscode(deviceId, name, email, passcode, SCHEDULE_CODE, startTime, endTime);

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

export default {
  updateStatus,
  getInfo,
  getPasscodeList,
  createAlwaysPasscode,
  createSchudlePasscode,
  deletePasscode
};