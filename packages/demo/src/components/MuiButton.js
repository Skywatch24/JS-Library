import styled from '@emotion/styled';
import React from 'react';
import PropTypes from 'prop-types';
import {Button} from '@material-ui/core';

let StyledButton = styled(Button)`
  width: 160px;
`;

const MuiButton = ({children, disabled, onClick}) => {
  return (
    <StyledButton
      variant="contained"
      color="primary"
      size="medium"
      disabled={disabled}
      onClick={onClick}>
      {children}
    </StyledButton>
  );
};

MuiButton.defaultProps = {
  disabled: false,
  onClick: () => {},
};

MuiButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
};

export {MuiButton};
