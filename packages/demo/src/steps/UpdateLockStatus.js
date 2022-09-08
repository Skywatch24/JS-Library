import React from 'react';
import PropTypes from 'prop-types';
import {
  StepContainer,
  RowContainer,
  Subtitle,
  Description,
  MuiTextField,
  MuiButton,
  Code,
  Result,
} from '../components';
const LOCK_STATUE = {lock: '1', unlock: '0'};

const UpdateLockStatus = ({
  deviceId,
  isUpdatedStatus,
  disabled,
  updateStatus,
}) => {
  return (
    <StepContainer>
      <Subtitle>Update Lock Status</Subtitle>
      <Code>Skywatch.Lock.updateStatus(deviceId, status);</Code>
      <Description>Select a lock in 'Devices' tab</Description>
      <MuiTextField
        id="device-id"
        label="Device id"
        value={deviceId}
        disabled={true}
      />
      <RowContainer>
        <MuiButton
          disabled={disabled}
          onClick={() => updateStatus(deviceId, LOCK_STATUE.lock)}>
          Lock
        </MuiButton>
        <MuiButton
          disabled={disabled}
          onClick={() => updateStatus(deviceId, LOCK_STATUE.unlock)}>
          Unlock
        </MuiButton>
      </RowContainer>
      <Result>{isUpdatedStatus}</Result>
    </StepContainer>
  );
};

UpdateLockStatus.defaultProps = {
  deviceId: '',
  isUpdatedStatus: '',
  disabled: false,
  updateStatus: () => {},
};

UpdateLockStatus.propTypes = {
  deviceId: PropTypes.string.isRequired,
  isUpdatedStatus: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  updateStatus: PropTypes.func.isRequired,
};

export {UpdateLockStatus};
