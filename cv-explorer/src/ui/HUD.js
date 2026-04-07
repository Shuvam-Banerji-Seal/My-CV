import anime from 'animejs'

/**
 * HUD - Heads-up display elements for the CV Explorer
 * Shows current section, interaction prompts, navigation hints
 */
export class HUD {
  constructor() {
    this.container = null
    this.sectionIndicator = null
    this.interactionPrompt = null
    this.navigationHints = null
    this.minimap = null
    
    this.currentSection = 'Welcome'
    this.isPromptVisible = false
    this.isVisible = true
    
    this.createUI()
  }

  createUI() {
    // Main HUD container
    this.container = document.createElement('div')
    this.container.id = 'hud'
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 50;
      font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
    `

    this.createSectionIndicator()
    this.createInteractionPrompt()
    this.createNavigationHints()
    this.createMinimap()
    this.addStyles()

    document.body.appendChild(this.container)
  }

  createSectionIndicator() {
    // Current section indicator at top
    this.sectionIndicator = document.createElement('div')
    this.sectionIndicator.id = 'hud-section'
    this.sectionIndicator.innerHTML = `
      <div class="section-label">CURRENT LOCATION</div>
      <div class="section-name">${this.currentSection}</div>
      <div class="section-line"></div>
    `
    this.sectionIndicator.style.cssText = `
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      opacity: 0.9;
    `
    this.container.appendChild(this.sectionIndicator)
  }

  createInteractionPrompt() {
    // Interaction prompt at center-bottom
    this.interactionPrompt = document.createElement('div')
    this.interactionPrompt.id = 'hud-prompt'
    this.interactionPrompt.innerHTML = `
      <div class="prompt-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      </div>
      <div class="prompt-text">Click to interact</div>
      <div class="prompt-detail"></div>
    `
    this.interactionPrompt.style.cssText = `
      position: absolute;
      bottom: 15%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      opacity: 0;
      transition: opacity 0.2s;
    `
    this.container.appendChild(this.interactionPrompt)
  }

  createNavigationHints() {
    // Navigation hints at bottom-left
    this.navigationHints = document.createElement('div')
    this.navigationHints.id = 'hud-nav'
    this.navigationHints.innerHTML = `
      <div class="nav-hint">
        <span class="nav-key">W A S D</span>
        <span class="nav-desc">Move</span>
      </div>
      <div class="nav-hint">
        <span class="nav-key">MOUSE</span>
        <span class="nav-desc">Look around</span>
      </div>
      <div class="nav-hint">
        <span class="nav-key">CLICK</span>
        <span class="nav-desc">Interact</span>
      </div>
      <div class="nav-hint">
        <span class="nav-key">ESC</span>
        <span class="nav-desc">Release cursor</span>
      </div>
    `
    this.navigationHints.style.cssText = `
      position: absolute;
      bottom: 2rem;
      left: 2rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      opacity: 0.6;
      transition: opacity 0.3s;
    `
    this.container.appendChild(this.navigationHints)
  }

  createMinimap() {
    // Optional minimap in corner
    this.minimap = document.createElement('div')
    this.minimap.id = 'hud-minimap'
    this.minimap.innerHTML = `
      <canvas id="minimap-canvas" width="150" height="150"></canvas>
      <div class="minimap-label">MAP</div>
    `
    this.minimap.style.cssText = `
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      width: 150px;
      height: 150px;
      background: rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(68, 170, 255, 0.3);
      border-radius: 8px;
      overflow: hidden;
      opacity: 0.7;
      transition: opacity 0.3s;
      display: none; /* Hidden by default */
    `
    this.container.appendChild(this.minimap)
    
    this.minimapCanvas = this.minimap.querySelector('#minimap-canvas')
    this.minimapCtx = this.minimapCanvas.getContext('2d')
  }

  addStyles() {
    const style = document.createElement('style')
    style.id = 'hud-styles'
    style.textContent = `
      #hud-section .section-label {
        font-size: 0.65rem;
        letter-spacing: 0.2em;
        color: rgba(255, 255, 255, 0.5);
        margin-bottom: 0.3rem;
      }
      
      #hud-section .section-name {
        font-size: 1.2rem;
        font-weight: 600;
        color: #fff;
        letter-spacing: 0.05em;
        text-shadow: 0 0 20px rgba(68, 170, 255, 0.5);
      }
      
      #hud-section .section-line {
        width: 60px;
        height: 2px;
        background: linear-gradient(90deg, transparent, rgba(68, 170, 255, 0.8), transparent);
        margin: 0.5rem auto 0;
      }
      
      #hud-prompt .prompt-icon {
        color: rgba(68, 170, 255, 0.9);
        margin-bottom: 0.5rem;
        animation: pulse-icon 2s ease-in-out infinite;
      }
      
      #hud-prompt .prompt-text {
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.9);
        letter-spacing: 0.1em;
      }
      
      #hud-prompt .prompt-detail {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.6);
        margin-top: 0.3rem;
      }
      
      @keyframes pulse-icon {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.1); opacity: 0.8; }
      }
      
      #hud-nav .nav-hint {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      
      #hud-nav .nav-key {
        font-size: 0.7rem;
        font-weight: 600;
        color: rgba(68, 170, 255, 0.9);
        background: rgba(68, 170, 255, 0.15);
        padding: 0.2rem 0.5rem;
        border-radius: 3px;
        border: 1px solid rgba(68, 170, 255, 0.3);
        min-width: 50px;
        text-align: center;
      }
      
      #hud-nav .nav-desc {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.7);
      }
      
      #hud-minimap .minimap-label {
        position: absolute;
        top: 5px;
        left: 5px;
        font-size: 0.6rem;
        letter-spacing: 0.15em;
        color: rgba(255, 255, 255, 0.5);
      }
      
      #hud-minimap canvas {
        width: 100%;
        height: 100%;
      }
      
      #hud:hover #hud-nav {
        opacity: 1;
      }
      
      #hud:hover #hud-minimap {
        opacity: 1;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Update current section indicator
   */
  setSection(sectionName) {
    if (sectionName === this.currentSection) return
    
    this.currentSection = sectionName
    const nameElement = this.sectionIndicator.querySelector('.section-name')
    
    // Animate section change
    anime({
      targets: nameElement,
      opacity: [1, 0],
      translateY: [0, -10],
      duration: 200,
      easing: 'easeOutQuad',
      complete: () => {
        nameElement.textContent = sectionName
        anime({
          targets: nameElement,
          opacity: [0, 1],
          translateY: [10, 0],
          duration: 300,
          easing: 'easeOutQuad'
        })
      }
    })
  }

  /**
   * Show interaction prompt when hovering over interactive object
   */
  showPrompt(text = 'Click to interact', detail = '') {
    if (this.isPromptVisible && 
        this.interactionPrompt.querySelector('.prompt-text').textContent === text) {
      return
    }
    
    this.isPromptVisible = true
    this.interactionPrompt.querySelector('.prompt-text').textContent = text
    this.interactionPrompt.querySelector('.prompt-detail').textContent = detail
    
    anime({
      targets: this.interactionPrompt,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 200,
      easing: 'easeOutQuad'
    })
  }

  /**
   * Hide interaction prompt
   */
  hidePrompt() {
    if (!this.isPromptVisible) return
    
    this.isPromptVisible = false
    
    anime({
      targets: this.interactionPrompt,
      opacity: 0,
      duration: 150,
      easing: 'easeOutQuad'
    })
  }

  /**
   * Update minimap with player position and waypoints
   */
  updateMinimap(playerPos, waypoints = [], worldSize = 100) {
    if (!this.minimapCanvas || this.minimap.style.display === 'none') return
    
    const ctx = this.minimapCtx
    const size = 150
    const scale = size / worldSize
    const centerX = size / 2
    const centerY = size / 2
    
    // Clear
    ctx.fillStyle = 'rgba(10, 10, 30, 0.9)'
    ctx.fillRect(0, 0, size, size)
    
    // Draw grid
    ctx.strokeStyle = 'rgba(68, 170, 255, 0.1)'
    ctx.lineWidth = 1
    for (let i = 0; i <= size; i += 30) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i, size)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(0, i)
      ctx.lineTo(size, i)
      ctx.stroke()
    }
    
    // Draw waypoints
    waypoints.forEach(wp => {
      const x = centerX + (wp.x - playerPos.x) * scale
      const y = centerY + (wp.z - playerPos.z) * scale
      
      if (x >= 0 && x <= size && y >= 0 && y <= size) {
        ctx.fillStyle = 'rgba(68, 255, 170, 0.8)'
        ctx.beginPath()
        ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    
    // Draw player (center)
    ctx.fillStyle = '#44aaff'
    ctx.beginPath()
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2)
    ctx.fill()
    
    // Draw player direction indicator
    ctx.strokeStyle = '#44aaff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(centerX, centerY - 10)
    ctx.stroke()
  }

  /**
   * Toggle minimap visibility
   */
  toggleMinimap(show) {
    this.minimap.style.display = show ? 'block' : 'none'
  }

  /**
   * Show/hide navigation hints
   */
  setNavigationHintsVisible(visible) {
    anime({
      targets: this.navigationHints,
      opacity: visible ? 0.6 : 0,
      duration: 300,
      easing: 'easeOutQuad'
    })
  }

  /**
   * Flash notification
   */
  notify(message, duration = 2000) {
    const notification = document.createElement('div')
    notification.className = 'hud-notification'
    notification.textContent = message
    notification.style.cssText = `
      position: absolute;
      top: 30%;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: #fff;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: 1px solid rgba(68, 170, 255, 0.5);
      font-size: 0.9rem;
      opacity: 0;
      pointer-events: none;
    `
    this.container.appendChild(notification)
    
    anime.timeline()
      .add({
        targets: notification,
        opacity: [0, 1],
        translateY: [-20, 0],
        duration: 300,
        easing: 'easeOutQuad'
      })
      .add({
        targets: notification,
        opacity: 0,
        translateY: -10,
        duration: 300,
        delay: duration,
        easing: 'easeInQuad',
        complete: () => notification.remove()
      })
  }

  /**
   * Show/hide entire HUD
   */
  setVisible(visible) {
    this.isVisible = visible
    
    anime({
      targets: this.container,
      opacity: visible ? 1 : 0,
      duration: 300,
      easing: 'easeOutQuad'
    })
  }

  /**
   * Fade in HUD with entrance animation
   */
  async show() {
    return new Promise(resolve => {
      anime.timeline({
        complete: () => resolve()
      })
        .add({
          targets: this.sectionIndicator,
          opacity: [0, 0.9],
          translateY: [-20, 0],
          duration: 500,
          easing: 'easeOutQuad'
        })
        .add({
          targets: this.navigationHints,
          opacity: [0, 0.6],
          translateX: [-20, 0],
          duration: 400,
          easing: 'easeOutQuad'
        }, '-=300')
    })
  }

  /**
   * Update method for touch devices
   */
  setTouchMode(isTouch) {
    if (isTouch) {
      this.navigationHints.innerHTML = `
        <div class="nav-hint">
          <span class="nav-key">JOYSTICK</span>
          <span class="nav-desc">Move</span>
        </div>
        <div class="nav-hint">
          <span class="nav-key">SWIPE</span>
          <span class="nav-desc">Look around</span>
        </div>
        <div class="nav-hint">
          <span class="nav-key">TAP</span>
          <span class="nav-desc">Interact</span>
        </div>
      `
    }
  }

  /**
   * Clean up
   */
  dispose() {
    if (this.container) {
      this.container.remove()
      this.container = null
    }
    
    const style = document.getElementById('hud-styles')
    if (style) style.remove()
  }
}

export default HUD
