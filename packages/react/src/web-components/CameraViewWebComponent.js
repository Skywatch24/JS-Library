import React from 'react';
import ReactDOM from 'react-dom';
import CameraView from '../CameraView';

class CameraViewWebComponent extends HTMLElement {
  constructor() {
    super();
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
  isLive() {
    return this.cameraViewRef.current.isLive();
  }

  connectedCallback() {
    ReactDOM.render(
      <CameraView
        deviceId={this.getAttribute('deviceId')}
        controls={this.hasAttribute('controls')}
        ref={this.cameraViewRef}
      />,
      this,
    );
  }
}

export {CameraViewWebComponent};
