/* eslint-disable max-len */
import { html } from 'lit';

export default function kotlinIcon(dimensions) {
  const width = dimensions?.width ?? 20;
  const height = dimensions?.height ?? 20;
  return html`
    <svg width=${width} height=${height} viewBox="0 0 128 128">
        <linearGradient id="kotlin-original-a" gradientUnits="userSpaceOnUse" x1="-11.899" y1="48.694" x2="40.299" y2="-8.322"><stop offset="0" stop-color="#1c93c1"></stop><stop offset=".163" stop-color="#2391c0"></stop><stop offset=".404" stop-color="#378bbe"></stop><stop offset=".696" stop-color="#587eb9"></stop><stop offset=".995" stop-color="#7f6cb1"></stop></linearGradient><path fill="url(#kotlin-original-a)" d="M0 0h65.4L0 64.4z"></path><linearGradient id="kotlin-original-b" gradientUnits="userSpaceOnUse" x1="43.553" y1="149.174" x2="95.988" y2="94.876"><stop offset="0" stop-color="#1c93c1"></stop><stop offset=".216" stop-color="#2d8ebf"></stop><stop offset=".64" stop-color="#587eb9"></stop><stop offset=".995" stop-color="#7f6cb1"></stop></linearGradient><path fill="url(#kotlin-original-b)" d="M128 128L64.6 62.6 0 128z"></path><linearGradient id="kotlin-original-c" gradientUnits="userSpaceOnUse" x1="3.24" y1="95.249" x2="92.481" y2="2.116"><stop offset="0" stop-color="#c757a7"></stop><stop offset=".046" stop-color="#ca5a9e"></stop><stop offset=".241" stop-color="#d66779"></stop><stop offset=".428" stop-color="#e17357"></stop><stop offset=".6" stop-color="#e97c3a"></stop><stop offset=".756" stop-color="#ef8324"></stop><stop offset=".888" stop-color="#f28817"></stop><stop offset=".982" stop-color="#f48912"></stop></linearGradient><path fill="url(#kotlin-original-c)" d="M0 128L128 0H64.6L0 63.7z"></path>
    </svg>       
  `;
}
