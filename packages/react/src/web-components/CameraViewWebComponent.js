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

export {CameraViewWebComponent}