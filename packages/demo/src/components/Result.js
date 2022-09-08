import React from 'react';
import PropTypes from 'prop-types';
import styled from '@emotion/styled';

let Container = styled.div``;

let Title = styled.h4`
  margin-bottom: 5px;
`;

let Content = styled.div`
  color: #515f65;
  border-radius: 5px;
  border: 1px solid #506a774a;
  background: #f9f9f959;
  page-break-inside: avoid;
  font-family: monospace;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 1.6em;
  max-width: 100%;
  max-height: 20vh;
  overflow: auto;
  display: block;
  word-wrap: break-word;
  margin-bottom: 32px;
  padding: 1em 1.5em;
`;

const Result = ({title, children}) => {
  return (
    <Container>
      <Title>{title}</Title>
      <Content>{children}</Content>
    </Container>
  );
};

Result.defaultProps = {title: 'Result'};

Result.propTypes = {title: PropTypes.string.isRequired};

export {Result};
