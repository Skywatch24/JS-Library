import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    width: 250,
  },
}));

const DateAndTimePickers = ({id, label, value, disabled, onChange}) => {
  const classes = useStyles();

  return (
    <form className={classes.container} noValidate>
      <TextField
        id={id}
        label={label}
        type="datetime-local"
        variant="outlined"
        size="small"
        margin="normal"
        className={classes.textField}
        InputLabelProps={{
          shrink: true,
        }}
        disabled={disabled}
        onChange={onChange}
      />
    </form>
  );
};

DateAndTimePickers.defaultProps = {
  id: 'date-time-picker',
  label: '',
  value: '',
  disabled: false,
  onChange: () => {},
};

DateAndTimePickers.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

export {DateAndTimePickers};
