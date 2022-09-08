import React from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';

const DateAndTimePickers = ({id, label, disabled, onChange}) => {
  return (
    <TextField
      id={id}
      label={label}
      type="datetime-local"
      variant="outlined"
      size="small"
      margin="normal"
      InputLabelProps={{
        shrink: true,
      }}
      disabled={disabled}
      onChange={onChange}
    />
  );
};

DateAndTimePickers.defaultProps = {
  id: 'date-time-picker',
  label: '',
  disabled: false,
  onChange: () => {},
};

DateAndTimePickers.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export {DateAndTimePickers};
