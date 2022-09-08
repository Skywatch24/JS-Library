import React from 'react';
import PropTypes from 'prop-types';
import {StepContainer, Subtitle, MuiButton, Code, Result} from '../components';

const GetToken = ({getTokenResult, disabled, onGetAccessTokenClick}) => {
  return (
    <StepContainer>
      <Subtitle>Exchange Access Token with Authorization code</Subtitle>
      <Code>
        curl -X "POST"
        "https://service.skywatch24.com/api/general/oauth_access_token.php" \
        <br /> -H 'Content-Type:application/x-www-form-urlencoded;' \
        <br /> --data-urlencode "app_id=xxxx" \
        <br /> --data-urlencode "app_secret=xxxx" \
        <br /> --data-urlencode "code=xxxx" \
        <br /> --data-urlencode "method_type=POST"
      </Code>
      <MuiButton disabled={disabled} onClick={onGetAccessTokenClick}>
        Get Access Token
      </MuiButton>
      <Result title="Result: Access Token">{getTokenResult}</Result>
    </StepContainer>
  );
};

GetToken.defaultProps = {
  getTokenResult: '',
  disabled: false,
  onGetAccessTokenClick: () => {},
};

GetToken.propTypes = {
  getTokenResult: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onGetAccessTokenClick: PropTypes.func.isRequired,
};

export {GetToken};
