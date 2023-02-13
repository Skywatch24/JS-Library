import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {CameraView} from '@skywatch/react';
import {StepContainer, Subtitle, Description} from '../components';
import '@skywatch/react/lib/style/camera-view.css';

const ReactCameraView = ({cameraId, disabled}) => {
  const cameraViewRef = useRef();
  return (
    <StepContainer>
      <Subtitle>Camera View</Subtitle>
      <Description>Select a camera to show the player</Description>
      {!disabled && (
        <div style={{width: '768px'}}>
          <p>{cameraId}</p>
          <CameraView deviceId={cameraId} controls={true} ref={cameraViewRef} />
        </div>
      )}
    </StepContainer>
  );
};

ReactCameraView.defaultProps = {
  cameraId: '',
  disabled: true,
};

ReactCameraView.propTypes = {
  cameraId: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export {ReactCameraView};
