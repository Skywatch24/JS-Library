import React from 'react';
import PropTypes from 'prop-types';
import JSONPretty from 'react-json-pretty';
import {
  StepContainer,
  Subtitle,
  MuiTextField,
  DateAndTimePickers,
  MuiButton,
  Code,
  Result,
} from '../components';

const AddSchedulePasscode = ({
  deviceId,
  passcodeName,
  passcode,
  email,
  addScheduleCodeResult,
  disabled,
  setPasscodeName,
  setPasscode,
  setEmail,
  onStartTimeChange,
  onEndTimeChange,
  createSchudlePasscode,
}) => {
  return (
    <StepContainer>
      <Subtitle>Add Schedule Passcode</Subtitle>
      <Code>
        Skywatch.Lock.createSchudlePasscode(deviceId, name, email, passcode,
        startTime, endTime);
      </Code>
      <MuiTextField
        id="device-id"
        label="Device id"
        value={deviceId}
        disabled={true}
      />
      <MuiTextField
        id="schedule-code-name"
        label="Passcode name"
        value={passcodeName}
        onChange={setPasscodeName}
      />
      <MuiTextField
        id="always-code-email"
        label="Email"
        value={email}
        onChange={setEmail}
      />
      <MuiTextField
        id="always-code"
        label="Passcode (4 - 8 digits)"
        value={passcode}
        onChange={setPasscode}
      />
      <DateAndTimePickers
        id="start-time"
        label="Choose a start time"
        onChange={onStartTimeChange}
      />
      <DateAndTimePickers
        id="end-time"
        label="Choose a end time"
        onChange={onEndTimeChange}
      />
      <MuiButton disabled={disabled} onClick={createSchudlePasscode}>
        Create Passcode
      </MuiButton>
      <Result>
        <JSONPretty data={addScheduleCodeResult}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

AddSchedulePasscode.defaultProps = {
  deviceId: '',
  passcodeName: '',
  passcode: '',
  email: '',
  addScheduleCodeResult: [],
  disabled: false,
  setPasscodeName: () => {},
  setPasscode: () => {},
  setEmail: () => {},
  onStartTimeChange: () => {},
  onEndTimeChange: () => {},
  createSchudlePasscode: () => {},
};

AddSchedulePasscode.propTypes = {
  deviceId: PropTypes.string.isRequired,
  passcodeName: PropTypes.string.isRequired,
  passcode: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  addScheduleCodeResult: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.string,
  ]).isRequired,
  disabled: PropTypes.bool,
  setPasscodeName: PropTypes.func.isRequired,
  setPasscode: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  onStartTimeChange: PropTypes.func.isRequired,
  onEndTimeChange: PropTypes.func.isRequired,
  createSchudlePasscode: PropTypes.func.isRequired,
};

export {AddSchedulePasscode};
