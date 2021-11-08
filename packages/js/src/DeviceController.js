import {Requests} from '@skywatch/api';

const getInfo = async () => {
  const res = await Requests.getDeviceList();
  if (res.data) {
    return res.data;
  }

  return '';
};

export default {
  getInfo,
};
