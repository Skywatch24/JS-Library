import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {StepContainer, Subtitle, MuiButton, Code, Result} from '../components';

const DeviceList = ({deviceList, disabled, getDeviceList}) => {
  return (
    <StepContainer>
      <Subtitle>Get Device List</Subtitle>
      <Code>Skywatch.Device.getInfo();</Code>
      <MuiButton disabled={disabled} onClick={() => getDeviceList()}>
        Get Device List
      </MuiButton>
      <Result>
        <JSONPretty data={deviceList}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

DeviceList.defaultProps = {
  deviceList: [],
  disabled: false,
  getDeviceList: () => {},
};

DeviceList.propTypes = {
  deviceList: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  getDeviceList: PropTypes.func.isRequired,
};

export {DeviceList};
