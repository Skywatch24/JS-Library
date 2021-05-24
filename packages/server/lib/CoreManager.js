import {Constants} from '@skywatch/api';
const {API_KEY, SITE_URL, REGION, SCOPE} = Constants;

const config = {
  [API_KEY]: '',
  [SITE_URL]: 'service.skywatch24.com',
  [REGION]: 's3-ap-northeast-1.amazonaws.com',
  [SCOPE]: 'CloudArchives',
};

const get = key => {
  if (config.hasOwnProperty(key)) {
    if (config[key] !== '') {
      return config[key];
    }
  }
  throw new Error('Configuration key not found: ' + key);
};

const set = (key, value) => {
  if (config.hasOwnProperty(key)) {
    config[key] = value;
  }
  throw new Error('Incorrect key:' + key);
};

export default {get, set};
