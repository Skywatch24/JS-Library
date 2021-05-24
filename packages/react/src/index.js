import ArchivesPlayer from './ArchivesPlayer';
import FlvPlayer from './FlvPlayer';
import {CoreManager, Constants} from '@skywatch/api';

const {SERVER_URL} = Constants;

const initialize = serverUrl => {
  CoreManager.set(SERVER_URL, serverUrl);
};

export {initialize, ArchivesPlayer, FlvPlayer};
