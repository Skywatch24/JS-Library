import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {
  StepContainer,
  Subtitle,
  MuiTextField,
  MuiButton,
  Code,
  Result,
} from '../components';

const DeletePasscode = ({
  deviceId,
  passcodeId,
  passcode,
  deleteScheduleCodeResult,
  disabled,
  setPasscodeId,
  setPasscode,
  deletePasscode,
}) => {
  return (
    <StepContainer>
      <Subtitle>Delete Passcode</Subtitle>
      <Code>
        Skywatch.Lock.deletePasscode = (deviceId, passcodeId, passcode);
      </Code>
      <MuiTextField
        id="device-id"
        label="Device id"
        value={deviceId}
        disabled={true}
      />
      <MuiTextField
        id="delete-code-id"
        label="Passcode id"
        value={passcodeId}
        onChange={setPasscodeId}
      />
      <MuiTextField
        id="delete-code"
        label="Passcode"
        value={passcode}
        onChange={setPasscode}
      />
      <MuiButton disabled={disabled} onClick={deletePasscode}>
        Delete Passcode
      </MuiButton>
      <Result>
        <JSONPretty data={deleteScheduleCodeResult}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

DeletePasscode.defaultProps = {
  deviceId: '',
  passcodeId: '',
  passcode: '',
  deleteScheduleCodeResult: [],
  disabled: false,
  setPasscodeId: () => {},
  setPasscode: () => {},
  deletePasscode: () => {},
};

DeletePasscode.propTypes = {
  deviceId: PropTypes.string.isRequired,
  passcodeId: PropTypes.string.isRequired,
  passcode: PropTypes.string.isRequired,
  deleteScheduleCodeResult: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]).isRequired,
  disabled: PropTypes.bool,
  setPasscodeId: PropTypes.func.isRequired,
  setPasscode: PropTypes.func.isRequired,
  deletePasscode: PropTypes.func.isRequired,
};

export {DeletePasscode};
