import {CoreManager, Constants} from '@skywatch/api';
const {SERVER_URL, API_KEY} = Constants;

import {CameraViewWebComponent} from '../../react/lib/index';
console.log(CameraViewWebComponent);
customElements.get('camera-view-web-component') ||
  customElements.define('camera-view-web-component', CameraViewWebComponent);

import '../../react/lib/style/camera-view.css';

const Skywatch = {
  initialize: (serverUrl, apiKey) => {
    CoreManager.set(SERVER_URL, serverUrl);
    CoreManager.set(API_KEY, apiKey);
  },
};

Skywatch.ArchivesPlayer = require('./ArchivesPlayer').default;
Skywatch.FlvPlayer = require('./FlvPlayer').default;

window.Skywatch = Skywatch;

export default Skywatch;
