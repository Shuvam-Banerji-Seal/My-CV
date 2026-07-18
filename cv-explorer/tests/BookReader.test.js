/**
 * BookReader.js tests — verifies the DOM overlay constructs, opens with a
 * chapter, renders pages, and handles navigation. Runs in jsdom.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BookReader } from '../src/ui/BookReader.js';

// animejs uses requestAnimationFrame — jsdom doesn't have it by default
beforeEach(() => {
  if (!globalThis.requestAnimationFrame) {
    globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
    globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
  }
});

describe('BookReader', () => {
  let reader;
  let chapter;

  beforeEach(() => {
    reader = new BookReader();
    chapter = {
      id: 'test',
      title: 'Test Chapter',
      subtitle: 'A test subtitle',
      icon: '📖',
      color: 0x4488ff,
      pages: [
        { heading: 'Page 1', body: 'First page body', bullets: ['Bullet A', 'Bullet B'] },
        { heading: 'Page 2', body: 'Second page body', tags: ['Tag1', 'Tag2'] },
        {
          heading: 'Page 3',
          groups: [{ name: 'Group A', items: ['Item 1', 'Item 2'] }],
          links: [{ text: 'Link', url: 'https://example.com' }]
        }
      ]
    };
  });

  afterEach(() => {
    reader.dispose();
  });

  it('constructs and appends overlay + element to the document', () => {
    expect(document.getElementById('book-reader-overlay')).not.toBeNull();
    expect(document.getElementById('book-reader')).not.toBeNull();
  });

  it('starts closed', () => {
    expect(reader.getIsOpen()).toBe(false);
  });

  it('open() sets isOpen=true and renders the first page', () => {
    reader.open(chapter);
    expect(reader.getIsOpen()).toBe(true);
    // Left page should show the title + icon
    const left = reader.leftPage.innerHTML;
    expect(left).toContain('Test Chapter');
    expect(left).toContain('📖');
    // Right page should show the first page heading
    const right = reader.rightPage.innerHTML;
    expect(right).toContain('Page 1');
    expect(right).toContain('First page body');
    expect(right).toContain('Bullet A');
  });

  it('renders groups, tags, and links on their respective pages', () => {
    reader.open(chapter);
    // Page 2 has tags
    reader.currentPageIndex = 1;
    reader.renderPages();
    let right = reader.rightPage.innerHTML;
    expect(right).toContain('Page 2');
    expect(right).toContain('Tag1');
    expect(right).toContain('Tag2');
    // Page 3 has groups + links
    reader.currentPageIndex = 2;
    reader.renderPages();
    right = reader.rightPage.innerHTML;
    expect(right).toContain('Group A');
    expect(right).toContain('Item 1');
    expect(right).toContain('https://example.com');
    expect(right).toContain('Link');
  });

  it('nextPage() advances to the next page and updates the indicator', () => {
    reader.open(chapter);
    expect(reader.currentPageIndex).toBe(0);
    reader.nextPage();
    expect(reader.currentPageIndex).toBe(1);
    reader.nextPage();
    expect(reader.currentPageIndex).toBe(2);
    // Should not go past the last page
    reader.nextPage();
    expect(reader.currentPageIndex).toBe(2);
  });

  it('prevPage() goes back but not below 0', () => {
    reader.open(chapter);
    reader.currentPageIndex = 2;
    reader.prevPage();
    expect(reader.currentPageIndex).toBe(1);
    reader.prevPage();
    expect(reader.currentPageIndex).toBe(0);
    reader.prevPage();
    expect(reader.currentPageIndex).toBe(0);
  });

  it('page indicator shows N / total and nav buttons are visible for multi-page chapters', () => {
    reader.open(chapter);
    expect(reader.nav.style.display).not.toBe('none');
    expect(reader.pageIndicator.textContent).toBe('1 / 3');
  });

  it('hides nav for single-page chapters', () => {
    const single = { ...chapter, pages: [{ heading: 'Only', body: 'One page' }] };
    reader.open(single);
    expect(reader.nav.style.display).toBe('none');
  });

  it('escape() escapes HTML special characters to prevent injection', () => {
    expect(reader.escape('<script>alert("x")</script>')).toBe('&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;');
    expect(reader.escape("a'b&c")).toBe('a&#39;b&amp;c');
    expect(reader.escape(null)).toBe('');
    expect(reader.escape(undefined)).toBe('');
    expect(reader.escape(42)).toBe('42');
  });

  it('close() sets isOpen=false', async () => {
    reader.open(chapter);
    expect(reader.getIsOpen()).toBe(true);
    await reader.close();
    expect(reader.getIsOpen()).toBe(false);
  });

  it('ArrowRight / ArrowLeft keyboard events navigate pages when open', () => {
    reader.open(chapter);
    const e = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    document.dispatchEvent(e);
    expect(reader.currentPageIndex).toBe(1);
    const e2 = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    document.dispatchEvent(e2);
    expect(reader.currentPageIndex).toBe(0);
  });

  it('dispose() removes overlay and styles from the document', () => {
    reader.dispose();
    expect(document.getElementById('book-reader-overlay')).toBeNull();
    expect(document.getElementById('book-reader')).toBeNull();
    expect(document.getElementById('book-reader-styles')).toBeNull();
  });
});
