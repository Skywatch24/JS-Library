import { CoreManager } from '@skywatch/api';
const {
  API_KEY
} = CoreManager;
const Skywatch = {
  initialize: apiKey => {
    CoreManager.set(API_KEY, apiKey);
  }
};
Skywatch.ArchivesPlayer = require('./ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./FlvPlayer').default;
window.Skywatch = Skywatch;
export default Skywatch;