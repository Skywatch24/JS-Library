import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import ArchivesPlayer from './react/ArchivesPlayer';
import FlvPlayer from './react/FlvPlayer';
import {CoreManager} from './util';

const {API_KEY} = CoreManager;

CoreManager.set(API_KEY, 'c367498bf8adcb4b403d8b92b09fa948');

const APP = () => {
  const [player, setPlayer] = useState(null);

  return (
    // <FlvPlayer
    //   deviceId={'47436'}
    //   onPlayerInit={setPlayer}
    //   onPlayerDispose={setPlayer}
    //   style={{width: '768px', height: '432px'}}
    // />
    <ArchivesPlayer
      onPlayerInit={setPlayer}
      onPlayerDispose={setPlayer}
      deviceId={'47436'}
      archiveId={'124114069'}
      smart_ff={0}
      seek={0}
    />
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
