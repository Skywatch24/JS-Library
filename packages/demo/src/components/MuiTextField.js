import React from 'react';
import PropTypes from 'prop-types';
import {TextField} from '@material-ui/core';

const MuiTextField = ({id, label, value, disabled, onChange}) => {
  return (
    <TextField
      id={id}
      label={label}
      variant="outlined"
      size="small"
      margin="normal"
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
    />
  );
};

MuiTextField.defaultProps = {
  id: 'text-field',
  label: '',
  value: '',
  disabled: false,
  onChange: () => {},
};

MuiTextField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
};

export {MuiTextField};
