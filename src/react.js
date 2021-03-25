import React, {useState} from 'react';
import ReactDOM from 'react-dom';
import Player from './react/Player';
import {CoreManager} from './util';

const {API_KEY} = CoreManager;

CoreManager.set(API_KEY, 'de433ee3895aa144aea4ab27cf9a6332');

const APP = () => {
  const [player, setPlayer] = useState(null);

  return (
    <Player
      onPlayerInit={setPlayer}
      onPlayerDispose={setPlayer}
      deviceId={'2'}
      scope={'CloudArchives'}
      archiveId={'202-1615967723'}
      smart_ff={'0'}
    />
  );
};

ReactDOM.render(<APP />, document.getElementById('root'));
