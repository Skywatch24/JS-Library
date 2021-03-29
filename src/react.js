import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import ArchivesPlayer from './react/ArchivesPlayer';
import FlvPlayer from './react/FlvPlayer';
import {CoreManager} from './util';

const {API_KEY} = CoreManager;

CoreManager.set(API_KEY, '9d80986b0d6d4101ec4679e7bb8ff13a');

const APP = () => {
  const [player, setPlayer] = useState(null);

  return (
    <FlvPlayer
      deviceId={'47436'}
      onPlayerInit={setPlayer}
      onPlayerDispose={setPlayer}
      style={{width: '768px', height: '432px'}}
    />
    // <ArchivesPlayer
    //   onPlayerInit={setPlayer}
    //   onPlayerDispose={setPlayer}
    //   deviceId={'46355'}
    //   archiveId={'157755080-1616734157'}
    //   smart_ff={0}
    //   seek={0}
    // />
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
