import ArchivesPlayer from './ArchivesPlayer';
import FlvPlayer from './FlvPlayer';
import {CoreManager} from '@skywatch/api';

const {API_KEY} = CoreManager;

const initialize = apiKey => {
  CoreManager.set(API_KEY, apiKey);
};

export {initialize, ArchivesPlayer, FlvPlayer};
