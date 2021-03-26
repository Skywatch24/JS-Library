import axios from 'axios';
import Config from './Config';
import CoreManager from './CoreManager';

const {API_KEY, REGION, SCOPE} = CoreManager;

const getArchives = async (deviceId, archiveId, smartff) => {
  const res = await axios.get(
    `${
      Config.apiURL
    }/cameras/${deviceId}/archives/link?archive_id=${archiveId}&smart_ff=${smartff}&
    scope=${CoreManager.get(SCOPE)}&region=${CoreManager.get(REGION)}
    &api_key=${CoreManager.get(API_KEY)}`,
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
