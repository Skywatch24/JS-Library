import { Requests } from '@skywatch/api';

const getInfo = async () => {
  const res = await Requests.getDeviceList();

  if (res.data) {
    return res.data;
  }

  return '';
};

const updateDeviceName = async (deviceId, name) => {
  const res = await Requests.updateDeviceName(deviceId, name);

  if (res.data) {
    return res.data;
  }

  return '';
};

export default {
  getInfo,
  updateDeviceName
};