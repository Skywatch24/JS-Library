const qs = require('qs');
const axios = require('axios');
const config = require('./Config');

const Server = async req => {
  const API_URL = config.apiURL + req.originalUrl;
  switch (req.method) {
    case 'GET': {
      const res = await axios.get(API_URL, {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
      return res;
    }
    case 'POST': {
      const res = await axios.post(API_URL, qs.stringify(req.body), {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
      return res;
    }
    default: {
      return '';
    }
  }
};

module.exports = Server;
