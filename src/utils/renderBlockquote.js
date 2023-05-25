export default function renderBlockquote(text) {
  const infoMarker = 'ℹ️';
  const bookMarker = '📘';
  const warningMarker = '⚠️';

  if (text.startsWith(`<p>${infoMarker}`)) {
    // Apply custom styling for the info blockquote
    return `<blockquote class="info-blockquote">${text.replace(infoMarker, '').trim()}</blockquote>`;
  } if (text.startsWith(`<p>${bookMarker}`)) {
    // Apply custom styling for the info blockquote
    return `<blockquote class="info-blockquote">${text.replace(bookMarker, '').trim()}</blockquote>`;
  } if (text.startsWith(`<p>${warningMarker} `)) {
    // Apply custom styling for the warning blockquote
    return `<blockquote class="warning-blockquote">${text.replace(warningMarker, '').trim()}</blockquote>`;
  }

  // Default rendering for regular blockquotes
  return `<blockquote class="info-blockquote">${text}</blockquote>`;
}
