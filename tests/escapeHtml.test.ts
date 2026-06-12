import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../src/utils/escapeHtml.js';

describe('escapeHtml', () => {
  it('should escape ampersands', () => {
    expect(escapeHtml('foo & bar')).toBe('foo &amp; bar');
  });

  it('should escape angle brackets', () => {
    expect(escapeHtml('<script>alert("xss")</script>')).toBe(
      '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;'
    );
  });

  it('should escape quotes', () => {
    expect(escapeHtml('He said "hello"')).toBe('He said &quot;hello&quot;');
    expect(escapeHtml("It's a test")).toBe('It&#x27;s a test');
  });

  it('should escape forward slashes', () => {
    expect(escapeHtml('path/to/file')).toBe('path&#x2F;to&#x2F;file');
  });

  it('should escape backticks', () => {
    expect(escapeHtml('template `literal`')).toBe('template &#96;literal&#96;');
  });

  it('should handle empty string', () => {
    expect(escapeHtml('')).toBe('');
  });

  it('should not modify safe strings', () => {
    expect(escapeHtml('Hello World 123')).toBe('Hello World 123');
  });

  it('should escape multiple special characters', () => {
    expect(escapeHtml('<div class="test">Hello & Goodbye</div>')).toBe(
      '&lt;div class=&quot;test&quot;&gt;Hello &amp; Goodbye&lt;&#x2F;div&gt;'
    );
  });
});
