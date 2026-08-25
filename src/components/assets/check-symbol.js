/* eslint-disable max-len */
import { html } from 'lit';

/* eslint-disable indent */
export default function checkSymbol(dimensions) {
  const width = dimensions?.width ?? 24;
  const height = dimensions?.height ?? 24;
  return html`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7 12L9.89075 14.8907V14.8907C9.95114 14.951 10.049 14.9511 10.1094 14.8907V14.8907L17 8"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}
