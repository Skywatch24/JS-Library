import ArchivesPlayer from './react/ArchivesPlayer';
import FlvPlayer from './react/FlvPlayer';
import {CoreManager} from './util';

const {API_KEY} = CoreManager;

const initialize = apiKey => {
  CoreManager.set(API_KEY, apiKey);
};

export {initialize, ArchivesPlayer, FlvPlayer};
