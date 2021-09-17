import React, {useState, useRef} from 'react';
import ReactDOM from 'react-dom';
import {ArchivesPlayer, FlvPlayer, CameraView, initialize} from '../src';
import '../src/style/camera-view.less';

initialize(
  'https://service.skywatch24.com/api/v2',
  'af91fb71f874702f5a3b416bce92b6b2',
);

const CONTROLS = true;

const APP = () => {
  const [player, setPlayer] = useState(null);
  const cameraViewRef = useRef();
  return (
    <>
      <div style={{width: '768px'}}>
        <CameraView
          deviceId={'47436'}
          controls={CONTROLS}
          ref={cameraViewRef}
        />
      </div>
      {!CONTROLS && (
        <div>
          <button onClick={() => cameraViewRef.current.play()}>play</button>
          <button onClick={() => cameraViewRef.current.pause()}>pause</button>
          <button onClick={() => cameraViewRef.current.fastForward()}>
            fastforward
          </button>
          <button onClick={() => cameraViewRef.current.toggleMute()}>
            mute
          </button>
          <button onClick={() => cameraViewRef.current.goLive()}>live</button>
          <button onClick={() => cameraViewRef.current.seek(1630310400)}>
            8/30 16:00
          </button>
          <button
            onClick={() => {
              const archives = cameraViewRef.current.getAllArchives();
              console.log(archives);
            }}>
            Get All Archives
          </button>
          <button onClick={() => console.log(cameraViewRef.current.isLive())}>
            isLive
          </button>
        </div>
      )}

      {/* <div style={{width: '768px', height: '432px'}}>
        <FlvPlayer
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
        />
      </div> */}
    </>
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
