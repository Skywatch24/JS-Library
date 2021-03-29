import axios from 'axios';
import Config from './Config';
import CoreManager from './CoreManager';

const {API_KEY, REGION, SCOPE} = CoreManager;

const getArchives = async (deviceId, archiveId, smartff) => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await axios.get(
    `${
      Config.apiURL
    }/cameras/${deviceId}/archives/link?archive_id=${archiveId}&smart_ff=${smartff}&
    scope=${CoreManager.get(SCOPE)}&region=${CoreManager.get(REGION)}
    &api_key=${CoreManager.get(API_KEY)}&_=${timestamp}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return res;
};

const getFlvStream = async deviceId => {
  const dateTime = Date.now();
  const timestamp = Math.floor(dateTime / 1000);
  const res = await axios.get(
    `${Config.apiURL}/cameras/${deviceId}/flvstream?warmup=1
    &api_key=${CoreManager.get(API_KEY)}&_=${timestamp}`,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return res;
};

export default {
  getArchives,
  getFlvStream,
};
