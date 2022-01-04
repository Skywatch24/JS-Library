import { Requests } from '@skywatch/api';

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
  const res = await Requests.createAlwaysPasscode(deviceId, name, email, passcode);

  if (res.data) {
    return res.data;
  }

  return '';
};

const createSchudlePasscode = async (deviceId, name, email = '', passcode, startTime, endTime) => {
  const res = await Requests.createSchudlePasscode(deviceId, name, email, passcode, startTime, endTime);

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