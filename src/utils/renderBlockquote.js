const calloutColors = {
  info: '#8C929D',
  warning: '#FFB100',
  danger: '#DC5A41',
};

function calloutIcon(type) {
  const fill = calloutColors[type] || calloutColors.info;
  const glyph = type === 'info'
    ? '<rect x="9.1" y="5" width="1.8" height="1.8" rx="0.9" fill="white"/><rect x="9.1" y="8.2" width="1.8" height="6.8" rx="0.9" fill="white"/>'
    : '<rect x="9.1" y="5" width="1.8" height="7" rx="0.9" fill="white"/><rect x="9.1" y="13.5" width="1.8" height="1.8" rx="0.9" fill="white"/>';

  return `<svg class="callout-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="${fill}"/>${glyph}</svg>`;
}

export default function renderBlockquote(text) {
  const infoMarker = 'ℹ️';
  const bookMarker = '📘';
  const warningMarker = '⚠️';
  const dangerMarker = '❗';

  if (text.startsWith(`<p>${infoMarker}`)) {
    // Apply custom styling for the info blockquote
    return `<blockquote class="info-blockquote">${calloutIcon('info')}${text.replace(infoMarker, '').trim()}</blockquote>`;
  } if (text.startsWith(`<p>${bookMarker}`)) {
    // Apply custom styling for the info blockquote
    return `<blockquote class="info-blockquote">${calloutIcon('info')}${text.replace(bookMarker, '').trim()}</blockquote>`;
  } if (text.startsWith(`<p>${warningMarker} `)) {
    // Apply custom styling for the warning blockquote
    return `<blockquote class="warning-blockquote">${calloutIcon('warning')}${text.replace(warningMarker, '').trim()}</blockquote>`;
  } if (text.startsWith(`<p>${dangerMarker} `)) {
    // Apply custom styling for the danger blockquote
    return `<blockquote class="danger-blockquote">${calloutIcon('danger')}${text.replace(dangerMarker, '').trim()}</blockquote>`;
  }

  // Default rendering for regular blockquotes
  return `<blockquote class="info-blockquote">${calloutIcon('info')}${text}</blockquote>`;
}
