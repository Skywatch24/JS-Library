import axios from 'axios';
import Config from './Config';
import CoreManager from './CoreManager';

const {API_KEY, REGION} = CoreManager;

const getArchives = async (deviceId, scope, archiveId, smartff) => {
  const res = await axios.get(
    `${
      Config.apiURL
    }/cameras/${deviceId}/archives/link?scope=${scope}&archive_id=${archiveId}&smart_ff=${smartff}&
      region=${CoreManager.get(REGION)}&api_key=${CoreManager.get(API_KEY)}`,
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
};
