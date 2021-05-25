import {Constants} from '@skywatch/api';
import {getArchives, getFlvStream} from './Requests';

const {GET_ARCHIVES, GET_FLV_STREAM} = Constants;

const Server = async (feature, params) => {
  switch (feature) {
    case GET_ARCHIVES: {
      const {device_id, archive_id, smartff, lang, api_key} = params;
      const res = await getArchives(
        device_id,
        archive_id,
        smartff,
        lang,
        api_key,
      );
      return res;
    }
    case GET_FLV_STREAM: {
      const {device_id, lang, api_key} = params;
      const res = await getFlvStream(device_id, lang, api_key);
      return res;
    }
    default: {
      return '';
    }
  }
};

export default Server;
