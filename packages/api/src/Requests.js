import axios from 'axios';
import CoreManager from './CoreManager';
import Constants from './Constants';

const {SERVER_URL, LANG_SELECTOR, GET_ARCHIVES, GET_FLV_STREAM} = Constants;

const getArchives = async (deviceId, archiveId, smartff) => {
  const params = {
    device_id: deviceId,
    archive_id: archiveId,
    smartff: smartff,
    lang: CoreManager.get(LANG_SELECTOR),
    feature: GET_ARCHIVES,
  };
  const res = await axios.post(
    CoreManager.get(SERVER_URL),
    qs.stringify(params),
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  );

  return res;
};

const getFlvStream = async deviceId => {
  const params = {
    device_id: deviceId,
    lang: CoreManager.get(LANG_SELECTOR),
    feature: GET_FLV_STREAM,
  };
  const res = await axios.post(
    CoreManager.get(SERVER_URL),
    qs.stringify(params),
    {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
  );

  return res;
};

export default {
  getArchives,
  getFlvStream,
};
