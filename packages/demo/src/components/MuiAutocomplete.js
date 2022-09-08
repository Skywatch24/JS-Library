import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';
import {TextField} from '@material-ui/core';
import {Autocomplete} from '@material-ui/lab';

let StyledAutocomplete = styled(Autocomplete)`
  width: 300px;
  margin-bottom: 10px;
`;

const MuiAutocomplete = ({
  id,
  label,
  options,
  getOptionLabel,
  disableClearable,
  disabled,
  onChange,
}) => {
  return (
    <StyledAutocomplete
      id={id}
      label={label}
      options={options}
      getOptionLabel={getOptionLabel}
      size="small"
      disableClearable={disableClearable}
      disabled={disabled}
      renderInput={params => (
        <TextField {...params} label={label} variant="outlined" />
      )}
      onChange={onChange}
    />
  );
};

MuiAutocomplete.defaultProps = {
  id: 'auto-complete',
  label: '',
  options: [],
  disableClearable: true,
  disabled: false,
  getOptionLabel: () => {},
  onChange: () => {},
};

MuiAutocomplete.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  disableClearable: PropTypes.bool,
  disabled: PropTypes.bool,
  getOptionLabel: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

export {MuiAutocomplete};
