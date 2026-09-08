/**
 * Panel tests — escaping, rendering and open/close lifecycle.
 *
 * CV text is authored by hand and contains characters like & and quotes, so the
 * escaping test is the one that actually matters here.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Panel, escapeHtml } from '../src/ui/Panel.js';

describe('escapeHtml', () => {
  it('neutralises markup', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  it('escapes ampersands and both quote styles', () => {
    expect(escapeHtml(`R&D "quoted" 'single'`)).toBe(
      'R&amp;D &quot;quoted&quot; &#39;single&#39;'
    );
  });

  it('renders null and undefined as an empty string', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('Panel', () => {
  let root;
  let panel;

  const milestone = {
    id: 'demo',
    when: 'August 2026',
    kind: 'talk',
    title: 'Guest Lecture & Jury',
    org: 'CBSE STEM DLD, Kolkata',
    summary: 'Addressed 64 teachers from 38 schools.',
    bullets: ['A first point', 'A second point'],
    tags: ['CBSE', 'AI'],
    links: [{ label: 'Deck', url: 'https://example.org/deck' }]
  };

  beforeEach(() => {
    root = document.createElement('aside');
    document.body.appendChild(root);
    panel = new Panel(root);
  });

  it('starts hidden and closed', () => {
    expect(root.hidden).toBe(true);
    expect(panel.isOpen).toBe(false);
  });

  it('renders every field of a milestone', () => {
    panel.open(milestone);
    expect(panel.isOpen).toBe(true);
    expect(root.hidden).toBe(false);
    expect(root.querySelector('.panel-title').textContent).toBe('Guest Lecture & Jury');
    expect(root.querySelector('.panel-org').textContent).toBe('CBSE STEM DLD, Kolkata');
    expect(root.querySelectorAll('.panel-bullets li')).toHaveLength(2);
    expect(root.querySelectorAll('.chip')).toHaveLength(2);
    const link = root.querySelector('.panel-link');
    expect(link.getAttribute('href')).toBe('https://example.org/deck');
    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('omits sections a milestone does not have', () => {
    panel.open({ id: 'bare', when: '2020', kind: 'award', title: 'Bare' });
    expect(root.querySelector('.panel-org')).toBeNull();
    expect(root.querySelector('.panel-bullets')).toBeNull();
    expect(root.querySelector('.panel-links')).toBeNull();
  });

  it('escapes hostile content instead of executing it', () => {
    panel.open({
      id: 'x',
      when: '2020',
      kind: 'award',
      title: '<script>alert(1)</script>',
      summary: '<b>bold</b>'
    });
    expect(root.querySelector('script')).toBeNull();
    expect(root.querySelector('.panel-title').textContent).toBe('<script>alert(1)</script>');
  });

  it('colours itself from the milestone kind', () => {
    panel.open(milestone);
    expect(root.style.getPropertyValue('--accent')).toBe('#22d3ee');
  });

  it('notifies onClose exactly once per close', () => {
    const onClose = vi.fn();
    panel.onClose = onClose;

    panel.open(milestone);
    panel.close();
    panel.close(); // already closed: must not fire again

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(panel.isOpen).toBe(false);
  });

  it('closes when the close button is clicked', () => {
    panel.open(milestone);
    root.querySelector('.panel-close').click();
    expect(panel.isOpen).toBe(false);
  });
});
