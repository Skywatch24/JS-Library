import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {
  StepContainer,
  Subtitle,
  Description,
  MuiButton,
  Code,
  Result,
  MuiAutocomplete,
} from '../components';
import {DEVICE_TYPE} from '../utils/constants';

const DeviceInfoCamera = ({
  deviceList,
  cameraId,
  statusInfo,
  disabled,
  setCameraId,
  getCameraInfo,
}) => {
  const [lockList, setLockList] = useState([]);

  useEffect(() => {
    setLockList(
      deviceList.filter(device => device.device_type === DEVICE_TYPE.camera),
    );
  }, [deviceList]);

  const getOptionLabel = device => {
    return 'id:' + device.id + ', name:' + device.name;
  };

  return (
    <StepContainer>
      <Subtitle>Get Camera Info</Subtitle>
      <Description>Get device list in 'Devices' tab</Description>
      <Code>Skywatch.Lock.getInfo(cameraId);</Code>
      <MuiAutocomplete
        id="device-list"
        label="Slect a camera device"
        options={lockList}
        value={cameraId}
        getOptionLabel={getOptionLabel}
        onChange={(evevnt, value, reason) => setCameraId(value.id)}
      />
      <MuiButton disabled={disabled} onClick={() => getCameraInfo(cameraId)}>
        Get Camera Info
      </MuiButton>
      <Result>
        <JSONPretty data={statusInfo}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

DeviceInfoCamera.defaultProps = {
  deviceList: [],
  cameraId: '',
  statusInfo: {},
  disabled: false,
  setCameraId: () => {},
  getCameraInfo: () => {},
};

DeviceInfoCamera.propTypes = {
  deviceList: PropTypes.array.isRequired,
  cameraId: PropTypes.string.isRequired,
  statusInfo: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  setCameraId: PropTypes.func.isRequired,
  getCameraInfo: PropTypes.func.isRequired,
};

export {DeviceInfoCamera};
