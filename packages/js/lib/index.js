import { CoreManager, Constants } from '@skywatch/api';
import { CameraViewWebComponent } from '@skywatch/react';
const {
  SERVER_URL,
  API_KEY
} = Constants;
customElements.get('camera-view-web-component') || customElements.define('camera-view-web-component', CameraViewWebComponent);
const Skywatch = {
  initialize: (serverUrl, apiKey) => {
    CoreManager.set(SERVER_URL, serverUrl);
    CoreManager.set(API_KEY, apiKey);
  }
};
Skywatch.ArchivesPlayer = require('./ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./FlvPlayer').default;
Skywatch.Lock = require('./LockController').default;
Skywatch.Device = require('./DeviceController').default;
window.Skywatch = Skywatch;
export default Skywatch;