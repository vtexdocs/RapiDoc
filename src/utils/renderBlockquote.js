import { marked } from 'marked';

const calloutColors = {
  info: '#8C929D',
  warning: '#FFB100',
  danger: '#DC5A41',
};

export function calloutIcon(type) {
  const fill = calloutColors[type] || calloutColors.info;
  const glyph = type === 'info'
    ? '<rect x="9.1" y="5" width="1.8" height="1.8" rx="0.9" fill="white"/><rect x="9.1" y="8.2" width="1.8" height="6.8" rx="0.9" fill="white"/>'
    : '<rect x="9.1" y="5" width="1.8" height="7" rx="0.9" fill="white"/><rect x="9.1" y="13.5" width="1.8" height="1.8" rx="0.9" fill="white"/>';

  return `<svg class="callout-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="${fill}"/>${glyph}</svg>`;
}

const calloutTypeMap = {
  default: 'info',
  info: 'info',
  warning: 'warning',
  danger: 'danger',
  error: 'danger',
};

export function resolveCalloutType(type) {
  if (calloutTypeMap[type]) return calloutTypeMap[type];
  if (type === 'success') return 'success';
  return 'info';
}

function innerCalloutText(text) {
  return (text || '').trim().replace(/^<p>\s*/i, '');
}

export function decorateDefaultBlockquotes(html) {
  if (!html || typeof html !== 'string') return html;
  return html.replace(/<blockquote(\s[^>]*)?>/gi, (match, attrs = '') => {
    if (/(?:info|warning|danger)-blockquote/.test(attrs)) return match;
    if (/\b(?:warning|danger|success)\b/.test(attrs) && !/\b(?:default|info)\b/.test(attrs)) return match;
    return `<blockquote class="info-blockquote">${calloutIcon('info')}`;
  });
}

export default function renderBlockquote(text) {
  const content = innerCalloutText(text);
  const infoMarker = 'ℹ️';
  const infoMarkerPlain = 'ℹ';
  const bookMarker = '📘';
  const warningMarker = '⚠️';
  const warningMarkerPlain = '⚠';
  const dangerMarker = '❗';

  if (content.startsWith(infoMarker) || content.startsWith(infoMarkerPlain) || content.startsWith(bookMarker)) {
    return `<blockquote class="info-blockquote">${calloutIcon('info')}${text.replace(infoMarker, '').replace(infoMarkerPlain, '').replace(bookMarker, '').trim()}</blockquote>`;
  }
  if (content.startsWith(warningMarker) || content.startsWith(warningMarkerPlain)) {
    return `<blockquote class="warning-blockquote">${calloutIcon('warning')}${text.replace(warningMarker, '').replace(warningMarkerPlain, '').trim()}</blockquote>`;
  }
  if (content.startsWith(dangerMarker)) {
    return `<blockquote class="danger-blockquote">${calloutIcon('danger')}${text.replace(dangerMarker, '').trim()}</blockquote>`;
  }

  return `<blockquote class="info-blockquote">${calloutIcon('info')}${text}</blockquote>`;
}

marked.Renderer.prototype.blockquote = renderBlockquote;
marked.Renderer.prototype.html = function htmlRenderer(htmlContent) {
  return decorateDefaultBlockquotes(htmlContent);
};
