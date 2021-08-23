import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ArchivesPlayer, FlvPlayer, initialize} from '../src';
import CameraView from '../src/CameraView';

initialize(
  'https://service.skywatch24.com/api/v2',
  '98c0fda1cd2c875a4379e9b8e7eea7fa',
);

const APP = () => {
  const [player, setPlayer] = useState(null);
  return (
    <>
      <div style={{width: '768px'}}>
        <CameraView deviceId={'47436'} />
      </div>
      <div style={{width: '768px', height: '432px'}}>
        {/* <FlvPlayer
          deviceId={'47436'}
          onPlayerInit={setPlayer}
          onPlayerDispose={setPlayer}
          style={{width: '768px', height: '432px'}}
        /> */}
        {/* <ArchivesPlayer
          onPlayerInit={setPlayer}
          onPlayerDispose={setPlayer}
          deviceId={'47436'}
          archiveId={'124114069'}
          smart_ff={0}
          seek={0}
        /> */}
      </div>
    </>
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
