import anime from 'animejs';

/**
 * BookReader — a DOM overlay that displays CV chapter content as an open book.
 *
 * Renders a two-page spread (left = meta/cover, right = body). The book sits
 * in a dimmed, blurred overlay. Player must close it (Esc / click outside /
 * close button) to resume walking — the controls are released while open.
 *
 * Page navigation: chapters with multiple `pages` cycle with ← / → arrows
 * and on-screen buttons.
 */
export class BookReader {
  constructor() {
    this.element = null;
    this.overlay = null;
    this.isOpen = false;
    this.currentChapter = null;
    this.currentPageIndex = 0;
    this.onCloseCallback = null;
    this._keyHandler = null;

    this.createUI();
  }

  createUI() {
    // Dim + blur backdrop
    this.overlay = document.createElement('div');
    this.overlay.id = 'book-reader-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.78);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 300;
      opacity: 0;
      pointer-events: none;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    `;
    document.body.appendChild(this.overlay);

    // The book element
    this.element = document.createElement('div');
    this.element.id = 'book-reader';
    this.element.setAttribute('role', 'dialog');
    this.element.setAttribute('aria-modal', 'true');
    this.element.style.cssText = `
      display: flex;
      flex-direction: row;
      width: min(900px, 96vw);
      max-height: 88vh;
      background: linear-gradient(135deg, #f5efe0 0%, #ede4cc 100%);
      border-radius: 6px;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(68, 170, 255, 0.15);
      overflow: hidden;
      font-family: 'Iowan Old Style', 'Palatino Linotype', Palatino, 'Book Antiqua', Georgia, serif;
      color: #2a1a0a;
      transform: scale(0.85) rotateY(-8deg);
      opacity: 0;
    `;
    this.overlay.appendChild(this.element);

    // Close button
    this.closeButton = document.createElement('button');
    this.closeButton.className = 'book-close';
    this.closeButton.setAttribute('aria-label', 'Close book');
    this.closeButton.innerHTML = '&times;';
    this.closeButton.style.cssText = `
      position: absolute;
      top: 12px;
      right: 14px;
      width: 36px;
      height: 36px;
      border: none;
      background: rgba(42, 26, 10, 0.1);
      color: #2a1a0a;
      font-size: 26px;
      line-height: 1;
      border-radius: 50%;
      cursor: pointer;
      z-index: 5;
      transition: background 0.2s;
    `;
    this.closeButton.addEventListener('mouseenter', () => {
      this.closeButton.style.background = 'rgba(42, 26, 10, 0.2)';
    });
    this.closeButton.addEventListener('mouseleave', () => {
      this.closeButton.style.background = 'rgba(42, 26, 10, 0.1)';
    });
    this.element.appendChild(this.closeButton);

    // Left page (cover / meta)
    this.leftPage = document.createElement('div');
    this.leftPage.className = 'book-page book-page-left';
    this.element.appendChild(this.leftPage);

    // Spine shadow in the middle
    this.spine = document.createElement('div');
    this.spine.className = 'book-spine';
    this.spine.style.cssText = `
      width: 18px;
      background: linear-gradient(90deg, rgba(0,0,0,0.18), rgba(0,0,0,0.04) 40%, rgba(0,0,0,0.04) 60%, rgba(0,0,0,0.18));
      flex-shrink: 0;
    `;
    this.element.appendChild(this.spine);

    // Right page (body)
    this.rightPage = document.createElement('div');
    this.rightPage.className = 'book-page book-page-right';
    this.element.appendChild(this.rightPage);

    // Nav controls
    this.nav = document.createElement('div');
    this.nav.className = 'book-nav';
    this.nav.style.cssText = `
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      align-items: center;
      background: rgba(42, 26, 10, 0.06);
      border-radius: 20px;
      padding: 4px 8px;
    `;
    this.element.appendChild(this.nav);

    this.prevBtn = this.makeNavButton('‹', 'Previous page');
    this.nextBtn = this.makeNavButton('›', 'Next page');
    this.pageIndicator = document.createElement('span');
    this.pageIndicator.className = 'book-page-indicator';
    this.pageIndicator.style.cssText = `
      font-size: 0.8rem;
      color: #5a4a2a;
      min-width: 60px;
      text-align: center;
      font-variant-numeric: tabular-nums;
    `;
    this.nav.appendChild(this.prevBtn);
    this.nav.appendChild(this.pageIndicator);
    this.nav.appendChild(this.nextBtn);

    this.addStyles();
    this.setupEventListeners();
  }

  makeNavButton(glyph, label) {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', label);
    btn.textContent = glyph;
    btn.style.cssText = `
      width: 32px;
      height: 32px;
      border: none;
      background: rgba(42, 26, 10, 0.08);
      color: #2a1a0a;
      font-size: 20px;
      line-height: 1;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.15s;
    `;
    btn.addEventListener('mouseenter', () => { btn.style.background = 'rgba(42, 26, 10, 0.18)'; });
    btn.addEventListener('mouseleave', () => { btn.style.background = 'rgba(42, 26, 10, 0.08)'; });
    return btn;
  }

  addStyles() {
    const style = document.createElement('style');
    style.id = 'book-reader-styles';
    style.textContent = `
      .book-page {
        flex: 1 1 0;
        min-width: 0;
        padding: 2.2rem 2rem 3.5rem;
        overflow-y: auto;
        position: relative;
      }
      .book-page::-webkit-scrollbar { width: 6px; }
      .book-page::-webkit-scrollbar-thumb { background: rgba(42,26,10,0.2); border-radius: 3px; }
      .book-page-left {
        background: linear-gradient(135deg, rgba(68,136,255,0.06), rgba(68,136,255,0.02));
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .book-page-right {
        background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1));
      }
      .book-cover-icon {
        font-size: 4rem;
        line-height: 1;
        margin-bottom: 0.5rem;
        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
      }
      .book-cover-title {
        font-size: 1.8rem;
        font-weight: 700;
        margin: 0 0 0.4rem;
        color: #2a1a0a;
        line-height: 1.2;
      }
      .book-cover-subtitle {
        font-size: 0.95rem;
        font-style: italic;
        color: #5a4a2a;
        margin: 0 0 1.2rem;
      }
      .book-cover-meta {
        font-size: 0.85rem;
        color: #4a3a1a;
        line-height: 1.7;
      }
      .book-cover-meta-line { margin: 0.2rem 0; }
      .book-heading {
        font-size: 1.25rem;
        font-weight: 700;
        color: #2a1a0a;
        margin: 0 0 0.8rem;
        padding-bottom: 0.4rem;
        border-bottom: 1px solid rgba(42, 26, 10, 0.18);
      }
      .book-meta {
        font-size: 0.85rem;
        color: #5a4a2a;
        font-style: italic;
        margin: 0 0 1rem;
      }
      .book-meta-line { margin: 0.15rem 0; }
      .book-body {
        font-size: 0.95rem;
        line-height: 1.7;
        color: #2a1a0a;
        margin: 0 0 1rem;
      }
      .book-bullets {
        list-style: none;
        padding: 0;
        margin: 0 0 1rem;
      }
      .book-bullets li {
        position: relative;
        padding-left: 1.3rem;
        margin: 0.4rem 0;
        font-size: 0.92rem;
        line-height: 1.55;
        color: #2a1a0a;
      }
      .book-bullets li::before {
        content: '✦';
        position: absolute;
        left: 0;
        color: #b8860b;
        font-size: 0.8rem;
        top: 0.15rem;
      }
      .book-groups { margin: 0 0 1rem; }
      .book-group { margin: 0.6rem 0; }
      .book-group-name {
        font-size: 0.78rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6a5a2a;
        margin: 0 0 0.3rem;
      }
      .book-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin: 0.4rem 0 1rem;
      }
      .book-tag {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
        background: rgba(42, 26, 10, 0.08);
        border: 1px solid rgba(42, 26, 10, 0.15);
        border-radius: 12px;
        color: #3a2a0a;
        font-family: 'SF Pro Text', -apple-system, sans-serif;
      }
      .book-links {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        margin-top: 1rem;
        font-family: 'SF Pro Text', -apple-system, sans-serif;
      }
      .book-link {
        display: inline-flex;
        align-items: center;
        gap: 0.4rem;
        padding: 0.5rem 0.8rem;
        background: rgba(68, 136, 255, 0.1);
        border: 1px solid rgba(68, 136, 255, 0.3);
        border-radius: 6px;
        color: #1a3a6a;
        text-decoration: none;
        font-size: 0.85rem;
        transition: background 0.15s, transform 0.15s;
      }
      .book-link:hover {
        background: rgba(68, 136, 255, 0.2);
        transform: translateX(2px);
      }
      .book-link::after { content: '↗'; margin-left: auto; }
      @media (max-width: 640px) {
        #book-reader { flex-direction: column; max-height: 92vh; }
        .book-spine { display: none; }
        .book-page { padding: 1.5rem 1.2rem 3rem; }
        .book-cover-title { font-size: 1.4rem; }
      }
    `;
    document.head.appendChild(style);
  }

  setupEventListeners() {
    this.closeButton.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });
    this.prevBtn.addEventListener('click', () => this.prevPage());
    this.nextBtn.addEventListener('click', () => this.nextPage());

    this._keyHandler = (e) => {
      if (!this.isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); this.close(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); this.prevPage(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.nextPage(); }
    };
    document.addEventListener('keydown', this._keyHandler);
  }

  /**
   * Open the reader for a chapter.
   * @param {Object} chapter - a chapter object from cvData.chapters
   * @param {Function} [onClose] - called when the reader closes
   */
  open(chapter, onClose = null) {
    if (this.isOpen) {
      this.close().then(() => this.open(chapter, onClose));
      return;
    }
    this.currentChapter = chapter;
    this.currentPageIndex = 0;
    this.onCloseCallback = onClose;
    this.isOpen = true;
    this.overlay.style.pointerEvents = 'auto';

    this.renderPages();

    anime({
      targets: this.overlay,
      opacity: [0, 1],
      duration: 300,
      easing: 'easeOutQuad'
    });
    anime({
      targets: this.element,
      opacity: [0, 1],
      scale: [0.85, 1],
      rotateY: [-8, 0],
      duration: 500,
      easing: 'easeOutCubic'
    });
  }

  renderPages() {
    const chapter = this.currentChapter;
    if (!chapter) return;
    const pages = chapter.pages || [];
    const page = pages[this.currentPageIndex] || {};
    const totalPages = pages.length;

    // --- Left page: cover-style display ---
    let leftHtml = `
      <div class="book-cover-icon">${chapter.icon || '📖'}</div>
      <h2 class="book-cover-title">${this.escape(chapter.title)}</h2>
    `;
    if (chapter.subtitle) {
      leftHtml += `<p class="book-cover-subtitle">${this.escape(chapter.subtitle)}</p>`;
    }
    if (page.heading && totalPages > 1) {
      leftHtml += `<div class="book-cover-meta">
        <div class="book-cover-meta-line">${this.escape(page.heading)}</div>
      </div>`;
    } else if (page.meta && Array.isArray(page.meta)) {
      leftHtml += '<div class="book-cover-meta">';
      for (const m of page.meta) {
        leftHtml += `<div class="book-cover-meta-line">${this.escape(m)}</div>`;
      }
      leftHtml += '</div>';
    }
    this.leftPage.innerHTML = leftHtml;

    // --- Right page: body content ---
    let rightHtml = '';
    if (page.heading) {
      rightHtml += `<h3 class="book-heading">${this.escape(page.heading)}</h3>`;
    }
    if (page.meta && Array.isArray(page.meta) && page.heading) {
      rightHtml += '<div class="book-meta">';
      for (const m of page.meta) {
        rightHtml += `<div class="book-meta-line">${this.escape(m)}</div>`;
      }
      rightHtml += '</div>';
    }
    if (page.body) {
      rightHtml += `<p class="book-body">${this.escape(page.body)}</p>`;
    }
    if (Array.isArray(page.bullets) && page.bullets.length) {
      rightHtml += '<ul class="book-bullets">';
      for (const b of page.bullets) rightHtml += `<li>${this.escape(b)}</li>`;
      rightHtml += '</ul>';
    }
    if (Array.isArray(page.groups) && page.groups.length) {
      rightHtml += '<div class="book-groups">';
      for (const g of page.groups) {
        rightHtml += `<div class="book-group">
          <div class="book-group-name">${this.escape(g.name)}</div>`;
        if (Array.isArray(g.items)) {
          rightHtml += '<ul class="book-bullets">';
          for (const it of g.items) rightHtml += `<li>${this.escape(it)}</li>`;
          rightHtml += '</ul>';
        }
        rightHtml += '</div>';
      }
      rightHtml += '</div>';
    }
    if (Array.isArray(page.tags) && page.tags.length) {
      rightHtml += '<div class="book-tags">';
      for (const t of page.tags) rightHtml += `<span class="book-tag">${this.escape(t)}</span>`;
      rightHtml += '</div>';
    }
    if (Array.isArray(page.links) && page.links.length) {
      rightHtml += '<div class="book-links">';
      for (const l of page.links) {
        rightHtml += `<a class="book-link" href="${this.escape(l.url)}" target="_blank" rel="noopener noreferrer">${this.escape(l.text)}</a>`;
      }
      rightHtml += '</div>';
    }
    if (!rightHtml) {
      rightHtml = '<p class="book-body" style="opacity:0.6;font-style:italic;">No additional content for this page.</p>';
    }
    this.rightPage.innerHTML = rightHtml;
    this.rightPage.scrollTop = 0;

    // Page indicator
    if (totalPages > 1) {
      this.pageIndicator.textContent = `${this.currentPageIndex + 1} / ${totalPages}`;
      this.prevBtn.style.visibility = this.currentPageIndex > 0 ? 'visible' : 'hidden';
      this.nextBtn.style.visibility = this.currentPageIndex < totalPages - 1 ? 'visible' : 'hidden';
      this.nav.style.display = 'flex';
    } else {
      this.nav.style.display = 'none';
    }
  }

  prevPage() {
    if (this.currentPageIndex > 0) {
      this.currentPageIndex--;
      this.flipPage();
    }
  }

  nextPage() {
    const total = this.currentChapter?.pages?.length || 0;
    if (this.currentPageIndex < total - 1) {
      this.currentPageIndex++;
      this.flipPage();
    }
  }

  flipPage() {
    // Animate a quick page-flip
    anime({
      targets: this.rightPage,
      opacity: [0, 1],
      translateX: [20, 0],
      duration: 250,
      easing: 'easeOutQuad',
      begin: () => this.renderPages()
    });
  }

  escape(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async close() {
    if (!this.isOpen) return Promise.resolve();
    this.isOpen = false;
    this.overlay.style.pointerEvents = 'none';

    return new Promise((resolve) => {
      anime.timeline({
        complete: () => {
          if (this.onCloseCallback) {
            this.onCloseCallback();
            this.onCloseCallback = null;
          }
          resolve();
        }
      })
        .add({
          targets: this.element,
          opacity: [1, 0],
          scale: [1, 0.9],
          duration: 250,
          easing: 'easeInCubic'
        })
        .add({
          targets: this.overlay,
          opacity: 0,
          duration: 200,
          easing: 'easeOutQuad'
        }, '-=150');
    });
  }

  getIsOpen() { return this.isOpen; }

  dispose() {
    if (this._keyHandler) {
      document.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }
    if (this.overlay) { this.overlay.remove(); this.overlay = null; }
    const style = document.getElementById('book-reader-styles');
    if (style) style.remove();
  }
}

export default BookReader;
