import { css } from 'lit';

export default css`
  .flex,
  .row,
  .col,
  .row-api {
    display: flex;
  }
  .row-api {
    flex: 1fr 1fr;
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-evenly;
  }
  .row {
    align-items: center;
  }
  .col {
    align-items: stretch;
    flex-direction: column;
  }
  .row-api-left {
    min-width: 288px;
    flex: 2 1 0%;
    justify-content: flex-end;
    padding-right: 32px;
    border-right: 1px solid #e7e9ee;
  }
  .row-api-right {
    min-width: 288px;
    flex: 1;
    justify-content: flex-start;
    position: sticky;
    top: 0;
    align-self: flex-start;
  }
  .row-api-right-box {
    text-align: left;
    direction: ltr;
    margin-top: 24px;
    padding-left: 32px;
    padding-right: 32px;
  }
  .row-api-right-box:first-child {
    margin-top: 12px;
  }
  @media (max-width: 1280px) {
    .row-api {
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
    }
    .row-api-right-box {
      padding-left: 0px;
    }
    .clear-btn {
      margin-left: 0px;
    }

    .row-api-left,
    .row-api-right {
      max-width: unset;
      width: 100%;
      border: none;
      padding: 10px;
    }
  }
`;
