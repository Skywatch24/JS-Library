import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ArchivesPlayer, FlvPlayer, initialize} from '../src';
import CameraView from '../src/CameraView';

initialize('c367498bf8adcb4b403d8b92b09fa948');

const APP = () => {
  const [player, setPlayer] = useState(null);
  return (
    <div style={{width: '768px', height: '432px'}}>
      <CameraView />
      {/* <FlvPlayer
        deviceId={'47436'}
        onPlayerInit={setPlayer}
        onPlayerDispose={setPlayer}
        style={{width: '768px', height: '432px'}}
      />
      <ArchivesPlayer
        onPlayerInit={setPlayer}
        onPlayerDispose={setPlayer}
        deviceId={'47436'}
        archiveId={'124114069'}
        smart_ff={0}
        seek={0}
      /> */}
    </div>
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
