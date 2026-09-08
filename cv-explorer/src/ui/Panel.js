import { KINDS } from '../data/cvData.js';

/** Escapes CV text before it goes anywhere near innerHTML. */
export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * The slide-in reader for a single milestone. Opening it hands keyboard focus
 * to the panel and suspends the road controls, so Escape and Tab behave the way
 * they do in an ordinary dialog.
 */
export class Panel {
  constructor(root) {
    this.root = root;
    this.root.className = 'panel';
    this.root.setAttribute('role', 'dialog');
    this.root.setAttribute('aria-modal', 'false');
    this.root.hidden = true;
    this.isOpen = false;
    this.onClose = null;

    this.root.addEventListener('click', (e) => {
      if (e.target.closest('.panel-close')) this.close();
    });
  }

  open(milestone) {
    const kind = KINDS[milestone.kind] ?? KINDS.project;

    const bullets = (milestone.bullets ?? [])
      .map((b) => `<li>${escapeHtml(b)}</li>`)
      .join('');
    const tags = (milestone.tags ?? [])
      .map((t) => `<span class="chip">${escapeHtml(t)}</span>`)
      .join('');
    const links = (milestone.links ?? [])
      .map(
        (l) =>
          `<a class="panel-link" href="${escapeHtml(l.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(l.label)} ↗</a>`
      )
      .join('');

    this.root.style.setProperty('--accent', kind.color);
    this.root.innerHTML = `
      <button class="panel-close" type="button" aria-label="Close">✕</button>
      <div class="panel-kind">${escapeHtml(milestone.when)} · ${escapeHtml(kind.label)}</div>
      <h2 class="panel-title">${escapeHtml(milestone.title)}</h2>
      ${milestone.org ? `<p class="panel-org">${escapeHtml(milestone.org)}</p>` : ''}
      ${milestone.summary ? `<p class="panel-summary">${escapeHtml(milestone.summary)}</p>` : ''}
      ${bullets ? `<ul class="panel-bullets">${bullets}</ul>` : ''}
      ${tags ? `<div class="panel-chips">${tags}</div>` : ''}
      ${links ? `<div class="panel-links">${links}</div>` : ''}
    `;

    this.root.hidden = false;
    this.isOpen = true;
    document.body.classList.add('panel-open');
    requestAnimationFrame(() => this.root.classList.add('is-open'));
    this.root.querySelector('.panel-close')?.focus();
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.root.classList.remove('is-open');
    document.body.classList.remove('panel-open');
    setTimeout(() => {
      if (!this.isOpen) this.root.hidden = true;
    }, 220);
    this.onClose?.();
  }
}
