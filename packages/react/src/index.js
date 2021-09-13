import React from 'react';
import ReactDOM from 'react-dom';
import ArchivesPlayer from './ArchivesPlayer';
import FlvPlayer from './FlvPlayer';
import CameraView from './CameraView';
import {CoreManager, Constants} from '@skywatch/api';

const {SERVER_URL, API_KEY} = Constants;

const initialize = (serverUrl, apiKey) => {
  CoreManager.set(SERVER_URL, serverUrl);
  CoreManager.set(API_KEY, apiKey);
};

class CameraViewWebComponent extends HTMLElement {
  constructor() {
    super();
    initialize(
      'https://service.skywatch24.com/api/v2',
      'af91fb71f874702f5a3b416bce92b6b2',
    );
    this.cameraViewRef = React.createRef();
  }

  play() {
    this.cameraViewRef.current.play();
  }
  pause() {
    this.cameraViewRef.current.pause();
  }
  fastForward() {
    this.cameraViewRef.current.fastForward();
  }
  toggleMute() {
    this.cameraViewRef.current.toggleMute();
  }
  goLive() {
    this.cameraViewRef.current.goLive();
  }
  seek(timestamp) {
    this.cameraViewRef.current.seek(timestamp);
  }
  getAllArchives() {
    return this.cameraViewRef.current.getAllArchives();
  }

  connectedCallback() {
    ReactDOM.render(
      <CameraView
        deviceId={this.getAttribute('deviceId')}
        controls={this.getAttribute('controls')}
        ref={this.cameraViewRef}
      />,
      document.getElementById('camera-view-web-component'),
    );
  }
}

export {
  initialize,
  ArchivesPlayer,
  FlvPlayer,
  CameraView,
  CameraViewWebComponent,
};
