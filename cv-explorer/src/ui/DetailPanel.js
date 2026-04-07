import anime from 'animejs'
import { textEffects } from '../animations/TextEffects.js'

/**
 * DetailPanel - Slide-in panel for detailed information
 * Shows full details when clicking on terminals, monuments, etc.
 */
export class DetailPanel {
  constructor() {
    this.element = null
    this.overlay = null
    this.isOpen = false
    this.currentData = null
    this.onCloseCallback = null
    
    this.createUI()
    this.setupEventListeners()
  }

  createUI() {
    // Backdrop overlay
    this.overlay = document.createElement('div')
    this.overlay.id = 'detail-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.6);
      z-index: 200;
      opacity: 0;
      pointer-events: none;
      backdrop-filter: blur(4px);
    `
    document.body.appendChild(this.overlay)

    // Main panel
    this.element = document.createElement('div')
    this.element.id = 'detail-panel'
    this.element.innerHTML = `
      <div class="panel-header">
        <div class="panel-type"></div>
        <h2 class="panel-title"></h2>
        <button class="panel-close" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div class="panel-content">
        <div class="panel-meta"></div>
        <div class="panel-description"></div>
        <div class="panel-details"></div>
        <div class="panel-links"></div>
      </div>
    `
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      right: -450px;
      width: 450px;
      max-width: 90vw;
      height: 100%;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 100%);
      z-index: 201;
      overflow-y: auto;
      box-shadow: -5px 0 30px rgba(0, 0, 0, 0.5);
      border-left: 1px solid rgba(68, 170, 255, 0.2);
    `
    document.body.appendChild(this.element)

    this.addStyles()
  }

  addStyles() {
    const style = document.createElement('style')
    style.id = 'detail-panel-styles'
    style.textContent = `
      #detail-panel {
        font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
        color: #fff;
      }
      
      #detail-panel .panel-header {
        padding: 2rem;
        border-bottom: 1px solid rgba(68, 170, 255, 0.2);
        position: sticky;
        top: 0;
        background: inherit;
        z-index: 1;
      }
      
      #detail-panel .panel-type {
        font-size: 0.7rem;
        letter-spacing: 0.2em;
        color: rgba(68, 170, 255, 0.9);
        text-transform: uppercase;
        margin-bottom: 0.5rem;
      }
      
      #detail-panel .panel-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin: 0;
        line-height: 1.3;
        color: #fff;
      }
      
      #detail-panel .panel-close {
        position: absolute;
        top: 1.5rem;
        right: 1.5rem;
        width: 40px;
        height: 40px;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: rgba(255, 255, 255, 0.7);
        transition: all 0.2s;
      }
      
      #detail-panel .panel-close:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #fff;
        transform: scale(1.05);
      }
      
      #detail-panel .panel-content {
        padding: 2rem;
      }
      
      #detail-panel .panel-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }
      
      #detail-panel .meta-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: rgba(255, 255, 255, 0.7);
      }
      
      #detail-panel .meta-item svg {
        width: 16px;
        height: 16px;
        opacity: 0.7;
      }
      
      #detail-panel .panel-description {
        font-size: 1rem;
        line-height: 1.7;
        color: rgba(255, 255, 255, 0.85);
        margin-bottom: 1.5rem;
      }
      
      #detail-panel .panel-details {
        margin-bottom: 1.5rem;
      }
      
      #detail-panel .detail-section {
        margin-bottom: 1.5rem;
      }
      
      #detail-panel .detail-section h3 {
        font-size: 0.8rem;
        letter-spacing: 0.1em;
        color: rgba(68, 170, 255, 0.9);
        text-transform: uppercase;
        margin: 0 0 0.75rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid rgba(68, 170, 255, 0.2);
      }
      
      #detail-panel .detail-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      
      #detail-panel .detail-list li {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
        padding: 0.5rem 0;
        padding-left: 1.2rem;
        position: relative;
      }
      
      #detail-panel .detail-list li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: rgba(68, 170, 255, 0.6);
      }
      
      #detail-panel .tag-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
      }
      
      #detail-panel .tag {
        font-size: 0.75rem;
        padding: 0.3rem 0.75rem;
        background: rgba(68, 170, 255, 0.15);
        border: 1px solid rgba(68, 170, 255, 0.3);
        border-radius: 20px;
        color: rgba(68, 170, 255, 0.9);
      }
      
      #detail-panel .panel-links {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      
      #detail-panel .panel-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.03);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        color: #fff;
        text-decoration: none;
        font-size: 0.9rem;
        transition: all 0.2s;
        pointer-events: auto;
      }
      
      #detail-panel .panel-link:hover {
        background: rgba(68, 170, 255, 0.1);
        border-color: rgba(68, 170, 255, 0.3);
        transform: translateX(5px);
      }
      
      #detail-panel .panel-link svg {
        width: 20px;
        height: 20px;
        opacity: 0.7;
      }
      
      #detail-panel .panel-link .link-text {
        flex: 1;
      }
      
      #detail-panel .panel-link .link-arrow {
        opacity: 0.5;
      }
      
      /* Scrollbar styling */
      #detail-panel::-webkit-scrollbar {
        width: 6px;
      }
      
      #detail-panel::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.05);
      }
      
      #detail-panel::-webkit-scrollbar-thumb {
        background: rgba(68, 170, 255, 0.3);
        border-radius: 3px;
      }
      
      #detail-panel::-webkit-scrollbar-thumb:hover {
        background: rgba(68, 170, 255, 0.5);
      }
    `
    document.head.appendChild(style)
  }

  setupEventListeners() {
    // Close button
    const closeBtn = this.element.querySelector('.panel-close')
    closeBtn.addEventListener('click', () => this.close())

    // Overlay click
    this.overlay.addEventListener('click', () => this.close())

    // Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close()
      }
    })
  }

  /**
   * Open panel with data
   * @param {Object} data - Content data
   * @param {string} data.type - Type label (e.g., 'Publication', 'Project')
   * @param {string} data.title - Main title
   * @param {string} data.description - Description text
   * @param {Array} data.meta - Meta info [{icon, text}]
   * @param {Array} data.details - Detail sections [{title, items}]
   * @param {Array} data.tags - Tag strings
   * @param {Array} data.links - Links [{url, text, icon}]
   */
  open(data, onClose = null) {
    if (this.isOpen) {
      this.close().then(() => this.open(data, onClose))
      return
    }

    this.currentData = data
    this.onCloseCallback = onClose
    this.isOpen = true

    // Populate content
    this.populateContent(data)

    // Animate in
    this.overlay.style.pointerEvents = 'auto'
    
    anime.timeline()
      .add({
        targets: this.overlay,
        opacity: [0, 1],
        duration: 300,
        easing: 'easeOutQuad'
      })
      .add({
        targets: this.element,
        right: ['-450px', '0px'],
        duration: 400,
        easing: 'easeOutCubic'
      }, '-=200')

    // Animate content items
    setTimeout(() => {
      const title = this.element.querySelector('.panel-title')
      const desc = this.element.querySelector('.panel-description')
      
      if (title.textContent) {
        textEffects.typewriter(title, title.textContent, { speed: 30, cursor: false })
      }
      
      if (desc.textContent) {
        textEffects.fadeInText(desc, { mode: 'word', stagger: 20 })
      }
    }, 400)
  }

  populateContent(data) {
    // Type
    const typeEl = this.element.querySelector('.panel-type')
    typeEl.textContent = data.type || ''

    // Title
    const titleEl = this.element.querySelector('.panel-title')
    titleEl.textContent = data.title || ''

    // Meta
    const metaEl = this.element.querySelector('.panel-meta')
    metaEl.innerHTML = ''
    if (data.meta && data.meta.length > 0) {
      data.meta.forEach(item => {
        const div = document.createElement('div')
        div.className = 'meta-item'
        div.innerHTML = `
          ${item.icon ? `<span>${item.icon}</span>` : ''}
          <span>${item.text}</span>
        `
        metaEl.appendChild(div)
      })
    }

    // Description
    const descEl = this.element.querySelector('.panel-description')
    descEl.textContent = data.description || ''

    // Details
    const detailsEl = this.element.querySelector('.panel-details')
    detailsEl.innerHTML = ''
    
    if (data.details && data.details.length > 0) {
      data.details.forEach(section => {
        const div = document.createElement('div')
        div.className = 'detail-section'
        
        let itemsHtml = ''
        if (Array.isArray(section.items)) {
          itemsHtml = `<ul class="detail-list">
            ${section.items.map(item => `<li>${item}</li>`).join('')}
          </ul>`
        } else {
          itemsHtml = `<p>${section.items}</p>`
        }
        
        div.innerHTML = `
          <h3>${section.title}</h3>
          ${itemsHtml}
        `
        detailsEl.appendChild(div)
      })
    }
    
    // Tags
    if (data.tags && data.tags.length > 0) {
      const tagSection = document.createElement('div')
      tagSection.className = 'detail-section'
      tagSection.innerHTML = `
        <h3>Technologies</h3>
        <div class="tag-list">
          ${data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
      `
      detailsEl.appendChild(tagSection)
    }

    // Links
    const linksEl = this.element.querySelector('.panel-links')
    linksEl.innerHTML = ''
    
    if (data.links && data.links.length > 0) {
      data.links.forEach(link => {
        const a = document.createElement('a')
        a.className = 'panel-link'
        a.href = link.url
        a.target = '_blank'
        a.rel = 'noopener noreferrer'
        a.innerHTML = `
          ${this.getLinkIcon(link.icon || 'link')}
          <span class="link-text">${link.text}</span>
          <span class="link-arrow">→</span>
        `
        linksEl.appendChild(a)
      })
    }
  }

  getLinkIcon(type) {
    const icons = {
      github: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.12.82-.26.82-.58v-2.18c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .1-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
      </svg>`,
      link: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
      </svg>`,
      pdf: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>`,
      video: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>`,
      demo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8"/>
      </svg>`,
      arxiv: `<svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>`
    }
    return icons[type] || icons.link
  }

  /**
   * Close panel
   */
  async close() {
    if (!this.isOpen) return Promise.resolve()

    this.isOpen = false
    this.overlay.style.pointerEvents = 'none'

    return new Promise(resolve => {
      anime.timeline({
        complete: () => {
          if (this.onCloseCallback) {
            this.onCloseCallback()
            this.onCloseCallback = null
          }
          resolve()
        }
      })
        .add({
          targets: this.element,
          right: '-450px',
          duration: 300,
          easing: 'easeInCubic'
        })
        .add({
          targets: this.overlay,
          opacity: 0,
          duration: 200,
          easing: 'easeOutQuad'
        }, '-=150')
    })
  }

  /**
   * Toggle panel
   */
  toggle(data, onClose) {
    if (this.isOpen) {
      this.close()
    } else {
      this.open(data, onClose)
    }
  }

  /**
   * Check if panel is open
   */
  getIsOpen() {
    return this.isOpen
  }

  /**
   * Clean up
   */
  dispose() {
    if (this.element) {
      this.element.remove()
      this.element = null
    }
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
    
    const style = document.getElementById('detail-panel-styles')
    if (style) style.remove()
  }
}

export default DetailPanel
