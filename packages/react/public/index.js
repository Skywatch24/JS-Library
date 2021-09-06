import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import {ArchivesPlayer, FlvPlayer, CameraView, initialize} from '../src';
import '../style/camera-view.less';

initialize(
  'https://service.skywatch24.com/api/v2',
  'af91fb71f874702f5a3b416bce92b6b2',
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
