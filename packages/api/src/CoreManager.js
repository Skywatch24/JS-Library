import Constants from './Constants';

const {API_KEY, SERVER_URL, LANG_SELECTOR} = Constants;

const config = {
  [API_KEY]: '',
  [SERVER_URL]: '',
  [LANG_SELECTOR]: 'en',
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
