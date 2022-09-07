import React from 'react';
import PropTypes from 'prop-types';
import {
  StepContainer,
  Subtitle,
  MuiButton,
  Code,
  Result,
  MuiTextField,
} from '../components';

const InitToken = ({apiToken, disabled, isInitStatus, initToken}) => {
  return (
    <StepContainer>
      <Subtitle>Initialize Token</Subtitle>
      <Code>
        import Skywatch from '@skywatch/js';
        <br />
        Skywatch.initialize('https://service.skywatch24.com/api/v2', 'token');
      </Code>
      <MuiTextField
        id="token"
        label="Access token"
        disabled={true}
        value={apiToken}
      />
      <MuiButton disabled={disabled} onClick={initToken}>
        Initialize
      </MuiButton>
      <Result>{isInitStatus}</Result>
    </StepContainer>
  );
};

InitToken.defaultProps = {
  apiToken: '',
  isInitStatus: '',
  disabled: false,
  initToken: () => {},
};

InitToken.propTypes = {
  apiToken: PropTypes.string.isRequired,
  isInitStatus: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  initToken: PropTypes.func.isRequired,
};

export {InitToken};
