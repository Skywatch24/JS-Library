import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {
  StepContainer,
  Subtitle,
  MuiButton,
  Code,
  Result,
  MuiAutocomplete,
} from '../components';

const DeviceInfo = ({
  deviceList,
  deviceId,
  statusInfo,
  disabled,
  setDeviceId,
  getLockInfo,
}) => {
  const getOptionLabel = device => {
    return 'id:' + device.id + ', name:' + device.name;
  };

  return (
    <StepContainer>
      <Subtitle>Get Door Lock Info</Subtitle>
      <Code>Skywatch.Lock.getInfo(deviceId);</Code>
      <MuiAutocomplete
        id="device-list"
        label="Slect a lock device"
        options={deviceList}
        value={deviceId}
        getOptionLabel={getOptionLabel}
        onChange={(evevnt, value, reason) => setDeviceId(value.id)}
      />
      <MuiButton disabled={disabled} onClick={() => getLockInfo(deviceId)}>
        Get Lock Info
      </MuiButton>
      <Result>
        <JSONPretty data={statusInfo}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

DeviceInfo.defaultProps = {
  deviceList: [],
  deviceId: '',
  statusInfo: {},
  disabled: false,
  setDeviceId: () => {},
  getLockInfo: () => {},
};

DeviceInfo.propTypes = {
  deviceList: PropTypes.array.isRequired,
  deviceId: PropTypes.string.isRequired,
  statusInfo: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  setDeviceId: PropTypes.func.isRequired,
  getLockInfo: PropTypes.func.isRequired,
};

export {DeviceInfo};
