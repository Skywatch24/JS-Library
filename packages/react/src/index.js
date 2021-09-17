import ArchivesPlayer from './ArchivesPlayer';
import FlvPlayer from './FlvPlayer';
import CameraView from './CameraView';
import {CameraViewWebComponent} from './web-components'
import {CoreManager, Constants} from '@skywatch/api';

const {SERVER_URL, API_KEY} = Constants;

const initialize = (serverUrl, apiKey) => {
  CoreManager.set(SERVER_URL, serverUrl);
  CoreManager.set(API_KEY, apiKey);
};

export {
  initialize,
  ArchivesPlayer,
  FlvPlayer,
  CameraView,
  CameraViewWebComponent
};
