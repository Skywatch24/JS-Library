import {CoreManager} from './util';
const {API_KEY} = CoreManager;

const Skywatch = {
  initialize: apiKey => {
    CoreManager.set(API_KEY, apiKey);
  },
};

Skywatch.ArchivesPlayer = require('./js/ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./js/FlvPlayer').default;

window.Skywatch = Skywatch;

export default Skywatch;
