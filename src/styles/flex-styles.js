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
    max-width: 100vw;
    box-sizing: border-box;
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
    top: 5rem;
    align-self: flex-start;
    min-height: calc(100vh - 5rem);
    overflow-y: auto;
  }
  .row-api-right-box {
    text-align: left;
    direction: ltr;
    margin-top: 24px;
    padding-left: 12px;
    padding-right: 12px;
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
      max-width: 100%;
      border: none;
      padding: 10px;
      position: static;
      max-height: none;
      overflow: visible;
    }
  }
`;
