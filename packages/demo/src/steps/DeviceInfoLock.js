import React, {useState, useEffect} from 'react';
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
import {DEVICE_TYPE, MODEL_IDS_LOCK} from '../utils/constants';

const DeviceInfoLock = ({
  deviceList,
  deviceId,
  statusInfo,
  disabled,
  setDeviceId,
  getLockInfo,
}) => {
  const [lockList, setLockList] = useState([]);

  useEffect(() => {
    setLockList(
      deviceList.filter(
        device =>
          device.device_type === DEVICE_TYPE.sensor &&
          MODEL_IDS_LOCK[device.model_id],
      ),
    );
  }, [deviceList]);

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
        options={lockList}
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

DeviceInfoLock.defaultProps = {
  deviceList: [],
  deviceId: '',
  statusInfo: {},
  disabled: false,
  setDeviceId: () => {},
  getLockInfo: () => {},
};

DeviceInfoLock.propTypes = {
  deviceList: PropTypes.array.isRequired,
  deviceId: PropTypes.string.isRequired,
  statusInfo: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  setDeviceId: PropTypes.func.isRequired,
  getLockInfo: PropTypes.func.isRequired,
};

export {DeviceInfoLock};
