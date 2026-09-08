import { profile } from '../data/cvData.js';

/**
 * The title card. It doubles as the loading screen: the scene is already
 * rendering behind it, so dismissing it drops you straight onto the road.
 */
export class Intro {
  constructor(root) {
    this.root = root;
    this.onStart = null;

    this.root.innerHTML = `
      <div class="intro-card">
        <p class="intro-eyebrow">Interactive CV</p>
        <h1 class="intro-name">${profile.name}</h1>
        <p class="intro-tagline">${profile.tagline}</p>
        <p class="intro-degree">${profile.degree} · ${profile.institution}</p>
        <button class="intro-start" type="button">Walk the road →</button>
        <p class="intro-note">
          Every milestone stands beside the road in chronological order.
          Walk with <kbd>W</kbd>/<kbd>S</kbd> or the scroll wheel, drag to look around,
          and press <kbd>E</kbd> at a plaque to read it.
        </p>
        <div class="intro-links">
          ${profile.links
            .map(
              (l) =>
                `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`
            )
            .join('')}
        </div>
      </div>
    `;

    this.root.querySelector('.intro-start').addEventListener('click', () => this.dismiss());
  }

  dismiss() {
    this.root.classList.add('is-gone');
    setTimeout(() => {
      this.root.hidden = true;
    }, 700);
    this.onStart?.();
  }
}
