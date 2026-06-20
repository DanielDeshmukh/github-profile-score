import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const TEMPLATE_DIR = join(__dirname, '..', '..', '..', 'templates');

export function loadTemplate(name: string): string {
  const filePath = join(TEMPLATE_DIR, `${name}.svg`);
  return readFileSync(filePath, 'utf-8');
}

export function renderFromTemplate(
  name: string,
  vars: Record<string, string>,
): string {
  let svg = loadTemplate(name);
  for (const [key, value] of Object.entries(vars)) {
    svg = svg.replaceAll(`{{${key}}}`, value);
  }
  return svg;
}

