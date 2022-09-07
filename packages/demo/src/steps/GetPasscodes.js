import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {
  StepContainer,
  Subtitle,
  Description,
  MuiTextField,
  MuiButton,
  Code,
  Result,
} from '../components';

const GetPasscodes = ({deviceId, passcodeList, disabled, getPasscodeList}) => {
  return (
    <StepContainer>
      <Subtitle>Passcode List</Subtitle>
      <Code>Skywatch.Lock.getPasscodeList(deviceId);</Code>
      <Description>Select a lock in 'Devices' tab</Description>
      <MuiTextField
        id="device-id"
        label="Device id"
        value={deviceId}
        disabled={true}
      />
      <MuiButton disabled={disabled} onClick={getPasscodeList}>
        Get Passcode List
      </MuiButton>
      <Result>
        <JSONPretty data={passcodeList}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

GetPasscodes.defaultProps = {
  deviceId: '',
  passcodeList: [],
  disabled: false,
  getPasscodeList: () => {},
};

GetPasscodes.propTypes = {
  deviceId: PropTypes.string.isRequired,
  passcodeList: PropTypes.array.isRequired,
  disabled: PropTypes.bool,
  getPasscodeList: PropTypes.func.isRequired,
};

export {GetPasscodes};
