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

const AddAlwaysPasscode = ({
  deviceId,
  passcodeName,
  passcode,
  email,
  addAlwaysCodeResult,
  disabled,
  setPasscodeName,
  setPasscode,
  setEmail,
  createAlwaysPasscode,
}) => {
  return (
    <StepContainer>
      <Subtitle>Add Always Passcode</Subtitle>
      <Code>
        Skywatch.Lock.createAlwaysPasscde(deviceId, name, email, passcode);
      </Code>
      <MuiTextField
        id="device-id"
        label="Device id"
        value={deviceId}
        disabled={true}
      />
      <MuiTextField
        id="always-code-name"
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
      <MuiButton disabled={disabled} onClick={createAlwaysPasscode}>
        Create Passcode
      </MuiButton>
      <Result>
        <JSONPretty data={addAlwaysCodeResult}></JSONPretty>
      </Result>
    </StepContainer>
  );
};

AddAlwaysPasscode.defaultProps = {
  deviceId: '',
  passcodeName: '',
  passcode: '',
  email: '',
  addAlwaysCodeResult: [],
  disabled: false,
  setPasscodeName: () => {},
  setPasscode: () => {},
  setEmail: () => {},
  createAlwaysPasscode: () => {},
};

AddAlwaysPasscode.propTypes = {
  deviceId: PropTypes.string.isRequired,
  passcodeName: PropTypes.string.isRequired,
  passcode: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  addAlwaysCodeResult: PropTypes.oneOfType([PropTypes.array, PropTypes.string])
    .isRequired,
  disabled: PropTypes.bool,
  setPasscodeName: PropTypes.func.isRequired,
  setPasscode: PropTypes.func.isRequired,
  setEmail: PropTypes.func.isRequired,
  createAlwaysPasscode: PropTypes.func.isRequired,
};

export {AddAlwaysPasscode};
