const escapeMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#96;',
};

const escapeRegex = /[&<>"'`/]/g;

export function escapeHtml(str: string): string {
  return str.replace(escapeRegex, (char) => escapeMap[char] || char);
}
