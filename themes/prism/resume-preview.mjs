export function resumePreviewUrl(value) {
  if (value.startsWith('/') && !value.startsWith('//')) return /\.pdf(?:[?#]|$)/i.test(value) ? value : null;
  let url;
  try { url = new URL(value); } catch { return null; }
  if (!['https:', 'http:'].includes(url.protocol)) return null;
  if (url.hostname === 'drive.google.com') {
    const id = url.pathname.match(/^\/file\/d\/([\w-]+)(?:\/|$)/)?.[1];
    if (id) return `https://drive.google.com/file/d/${id}/preview`;
  }
  return /\.pdf$/i.test(url.pathname) ? url.href : null;
}
