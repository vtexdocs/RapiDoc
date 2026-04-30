export function joinURLandPath(url, path) {
  const u = url == null ? '' : String(url);
  const p = path == null ? '' : String(path);
  if (u.length > 0 && p.length > 0 && u.slice(-1) === p.charAt(0)) return u.slice(0, -1) + p;
  return u + p;
}

export function parseURL(variables, url, path) {
  if (!variables) return url;

  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{${key}}`, 'g');
    url = url.replace(regex, value.value);
  }

  return joinURLandPath(url, path);
}
