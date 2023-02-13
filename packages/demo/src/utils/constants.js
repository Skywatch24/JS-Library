export const server_url =
  process.env.NODE_ENV === 'development'
    ? '/api/v2'
    : 'https://service.skywatch24.com/api/v2';
export const redirect_uri =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000/'
    : 'https://skywatch24.github.io/JS-Library/';
export const general_url =
  process.env.NODE_ENV === 'development'
    ? '/api/general'
    : 'https://service.skywatch24.com/api/general';

export const APP_ID = '123456';
export const APP_SECRET = 'DB419E28FC3BD38C7F577291A576E8E2';

export const oauth_url = `https://service.skywatch24.com/oauth2?app_id=${APP_ID}&redirect_uri=${redirect_uri}`;

export const DEVICE_TYPE = {
  gateway: 'gateway',
  sensor: 'sensor',
  camera: 'camera',
};
export const MODEL_IDS_LOCK = {
  63: 'door_lock',
  83: 'power_lock_up_to_lock',
  84: 'power_lock_up_to_unlock',
  97: 'card_reader',
  99: 'card_reader_with_sensor',
};

export const EMPTY_STRING = '';

export const STATUS_CODE = {
  STATUS_CODE_200_SUCCESS: 200,
};
export const API_RESULT = {
  success: {value: '1', msg: 'Success!'},
  fail: {value: '0', msg: 'Fail!'},
};

export const STEPS = {
  login: {key: 'login'},
  getToken: {key: 'getToken'},
  initToken: {key: 'initToken'},
  deviceList: {key: 'deviceList'},
  lockInfo: {key: 'lockInfo'},
  passcodeList: {key: 'passcodeList'},
  addAlwaysCode: {key: 'addAlwaysCode'},
  addScheduleCode: {key: 'addScheduleCode'},
  deletePasscode: {key: 'deletePasscode'},
  updateStatus: {key: 'updateStatus'},
  cameraInfo: {key: 'cameraInfo'},
  reactCameraView: {key: 'reactCameraView'},
};

export const TABS = {
  oAuth: {
    index: 0,
    name: 'OAuth',
    title: 'Use Oauth 2.0 to get access token',
  },
  devices: {
    index: 1,
    name: 'Devices',
    title: 'Get device list and device info',
  },
  lockPasscode: {
    index: 2,
    name: 'Lock Passcode',
    title: "Manage lock's passcode",
  },
  lockStatus: {
    index: 3,
    name: 'Lock Status',
    title: "Update lock's status",
  },
  camera: {
    index: 4,
    name: 'Camera',
    title: 'Camera stream',
  },
};
