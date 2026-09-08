import { KINDS } from '../data/cvData.js';

/**
 * The DOM chrome layered over the canvas: the header, the "you are here"
 * readout, the control hints, and the timeline scrubber down the right edge.
 *
 * Kept deliberately in plain DOM rather than sprites – it stays crisp, it is
 * selectable, and screen readers can reach it.
 */
export class Hud {
  /**
   * @param {HTMLElement} root
   * @param {object[]} milestones road-ordered milestones
   * @param {(index:number)=>void} onJump
   */
  constructor(root, milestones, onJump) {
    this.root = root;
    this.milestones = milestones;
    this.onJump = onJump;
    this.activeIndex = -1;
    this.#render();
  }

  #render() {
    this.root.innerHTML = `
      <header class="hud-top">
        <div class="hud-name">Shuvam Banerji Seal</div>
        <div class="hud-sub">A walk through the CV, in order</div>
      </header>

      <nav class="timeline" aria-label="Timeline">
        <ol class="timeline-list"></ol>
      </nav>

      <div class="hud-now" aria-live="polite">
        <span class="hud-now-date"></span>
        <span class="hud-now-title"></span>
        <button class="hud-open" type="button">Open <kbd>E</kbd></button>
      </div>

      <div class="hud-hint">
        <kbd>W</kbd><kbd>S</kbd> or scroll to walk · drag to look ·
        <kbd>E</kbd> or click a plaque to open · <kbd>Esc</kbd> to close
      </div>
    `;

    this.list = this.root.querySelector('.timeline-list');
    this.nowDate = this.root.querySelector('.hud-now-date');
    this.nowTitle = this.root.querySelector('.hud-now-title');
    this.openButton = this.root.querySelector('.hud-open');

    this.milestones.forEach((milestone, index) => {
      const kind = KINDS[milestone.kind] ?? KINDS.project;
      const li = document.createElement('li');
      li.className = 'timeline-item';
      li.innerHTML = `
        <button type="button" class="timeline-dot" style="--dot:${kind.color}">
          <span class="timeline-tip">${milestone.when} · ${milestone.title}</span>
        </button>
      `;
      li.querySelector('button').addEventListener('click', () => this.onJump(index));
      this.list.appendChild(li);
    });

    this.dots = [...this.root.querySelectorAll('.timeline-dot')];
  }

  onOpenRequest(handler) {
    this.openButton.addEventListener('click', handler);
  }

  setActive(index) {
    if (index === this.activeIndex) return;
    this.activeIndex = index;

    this.dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));

    const milestone = this.milestones[index];
    if (!milestone) return;
    const kind = KINDS[milestone.kind] ?? KINDS.project;
    this.nowDate.textContent = `${milestone.when} · ${kind.label}`;
    this.nowDate.style.color = kind.color;
    this.nowTitle.textContent = milestone.title;

    const dot = this.dots[index];
    dot?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}
