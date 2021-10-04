import {Requests} from '@skywatch/api';

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

export default {
  updateStatus,
  getInfo,
};
