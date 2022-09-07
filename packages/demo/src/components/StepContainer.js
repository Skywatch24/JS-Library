import styled from '@emotion/styled';

let StepContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 12px 12px;
  padding: 0 12px;
  box-shadow: 2px 2px 8px rgb(51 51 102 / 20%);
  border-radius: 5px;
  :hover {
    background-color: #f9f9f9;
  }
  img {
    margin-bottom: 32px;
    padding: 5px;
    border-radius: 5px;
    border: 1px solid #506a774a;
  }
`;

export {StepContainer};
