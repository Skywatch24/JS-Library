import React from 'react';
import PropTypes from 'prop-types';
import {
  StepContainer,
  Subtitle,
  Description,
  MuiButton,
  Code,
  Result,
} from '../components';
import oauthImg from '../images/oauth.png';

const Login = ({oauthCode, disabled, onLoginClick}) => {
  return (
    <StepContainer>
      <Subtitle>Flow Chart</Subtitle>
      <img src={oauthImg} alt="flow" width="609" height="374" />
      <Subtitle>Authorization URL</Subtitle>
      <Code>
        service.skywatch24.com/oauth2?app_id='app_ip'&redirect_uri='redirect_uri'
      </Code>
      <Description>
        When user grants authorization, the page will redirect to the
        `redirect_url` and contain `code` in the url.
      </Description>
      <MuiButton disabled={disabled} onClick={onLoginClick}>
        Login
      </MuiButton>
      <Result title="Result: Authorization Code">{oauthCode}</Result>
    </StepContainer>
  );
};

Login.defaultProps = {
  oauthCode: '',
  disabled: false,
  onLoginClick: () => {},
};

Login.propTypes = {
  oauthCode: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onLoginClick: PropTypes.func.isRequired,
};

export {Login};
