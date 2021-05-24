import {CoreManager, Constants} from '@skywatch/api';
const {SERVER_URL} = Constants;

const Skywatch = {
  initialize: serverUrl => {
    CoreManager.set(SERVER_URL, serverUrl);
  },
};

Skywatch.ArchivesPlayer = require('./ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./FlvPlayer').default;

window.Skywatch = Skywatch;

export default Skywatch;
