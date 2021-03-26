const API_KEY = 'api_key';
const LANG_SELECTOR = 'lang';
const SITE_URL = 'site_url';
const REGION = 'region';
const SCOPE = 'scope';

const config = {
  [API_KEY]: '',
  [LANG_SELECTOR]: 'en',
  [SITE_URL]: 'service.skywatch24.com',
  [REGION]: 's3-ap-northeast-1.amazonaws.com',
  [SCOPE]: 'CloudArchives',
};

const get = key => {
  if (config.hasOwnProperty(key)) {
    return config[key];
  }
  throw new Error('Configuration key not found: ' + key);
};

const set = (key, value) => {
  config[key] = value;
};

export default {API_KEY, LANG_SELECTOR, SITE_URL, REGION, SCOPE, get, set};
