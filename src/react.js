import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import ArchivesPlayer from './react/ArchivesPlayer';
import {CoreManager} from './util';

const {API_KEY} = CoreManager;

CoreManager.set(API_KEY, '0901abd4094de632ea0cb116922c1038');

const APP = () => {
  const [player, setPlayer] = useState(null);

  return (
    <ArchivesPlayer
      onPlayerInit={setPlayer}
      onPlayerDispose={setPlayer}
      deviceId={'2'}
      archiveId={'202-1615967723'}
      smart_ff={0}
      seek={43}
    />
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
