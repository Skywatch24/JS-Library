const skywatchAPI = require('@skywatch/api');
const coreManager = require('./CoreManager');

const {SITE_URL} = skywatchAPI.Constants;

const config = () => ({
  apiURL: `https://${coreManager.get(SITE_URL)}/api/v2`,
});

module.exports = config();
