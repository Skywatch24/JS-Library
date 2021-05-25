import { CoreManager, Constants } from '@skywatch/api';
const {
  SERVER_URL,
  API_KEY
} = Constants;
const Skywatch = {
  initialize: (serverUrl, apiKey) => {
    CoreManager.set(SERVER_URL, serverUrl);
    CoreManager.set(API_KEY, apiKey);
  }
};
Skywatch.ArchivesPlayer = require('./ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./FlvPlayer').default;
window.Skywatch = Skywatch;
export default Skywatch;