/* eslint-disable max-len */
import { html } from 'lit';

/* eslint-disable indent */
export default function iconCaret(dimensions) {
  const width = dimensions?.width ?? 24;
  const height = dimensions?.height ?? 24;
  return html`
    <svg
      width=${width}
      height=${height}
      viewBox="0 0 24 24"
      fill="none"
      class="css-1afboe"
    >
      <path
        d="M8 10L12 14L16 10"
        stroke="#4a596b"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  `;
}
