import anime from 'animejs'

/**
 * LoadingScreen - Animated loading screen with progress bar
 * Shows during initial asset loading
 */
export class LoadingScreen {
  constructor() {
    this.element = null
    this.progressBar = null
    this.progressText = null
    this.statusText = null
    this.progress = 0
    this.isVisible = true
    
    // Loading messages that cycle through
    this.messages = [
      'Initializing neural pathways...',
      'Loading research data...',
      'Constructing 3D environment...',
      'Calibrating visual systems...',
      'Preparing experience...'
    ]
    this.currentMessageIndex = 0
    this.messageInterval = null
    
    this.element = this.createUI()
    this.startMessageCycle()
  }

  createUI() {
    // Main container
    const container = document.createElement('div')
    container.id = 'loading-screen'
    container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #0a0a1a 0%, #1a1a2e 50%, #0a0a1a 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `

    // Background animation (floating particles)
    const particlesCanvas = document.createElement('canvas')
    particlesCanvas.id = 'loading-particles'
    particlesCanvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: 0.5;
    `
    container.appendChild(particlesCanvas)
    this.initParticles(particlesCanvas)

    // Content wrapper
    const content = document.createElement('div')
    content.style.cssText = `
      position: relative;
      z-index: 1;
      text-align: center;
      max-width: 400px;
      padding: 2rem;
    `

    // Logo/Icon area
    const logoContainer = document.createElement('div')
    logoContainer.style.cssText = `
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
      position: relative;
    `

    // Animated logo rings
    for (let i = 0; i < 3; i++) {
      const ring = document.createElement('div')
      ring.className = 'loading-ring'
      ring.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${60 - i * 15}px;
        height: ${60 - i * 15}px;
        border: 2px solid rgba(68, 170, 255, ${0.8 - i * 0.2});
        border-top-color: transparent;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        animation: spin${i} ${1.5 + i * 0.5}s linear infinite;
      `
      logoContainer.appendChild(ring)
    }

    // Center dot
    const centerDot = document.createElement('div')
    centerDot.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 12px;
      height: 12px;
      background: #44aaff;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 20px rgba(68, 170, 255, 0.8);
      animation: pulse 1.5s ease-in-out infinite;
    `
    logoContainer.appendChild(centerDot)

    content.appendChild(logoContainer)

    // Title
    const title = document.createElement('h1')
    title.textContent = 'CV Explorer'
    title.style.cssText = `
      font-size: 1.8rem;
      font-weight: 600;
      color: #fff;
      margin: 0 0 0.5rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
    `
    content.appendChild(title)

    // Status text
    this.statusText = document.createElement('p')
    this.statusText.textContent = this.messages[0]
    this.statusText.style.cssText = `
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 2rem;
      min-height: 1.5em;
      transition: opacity 0.3s;
    `
    content.appendChild(this.statusText)

    // Progress bar container
    const progressContainer = document.createElement('div')
    progressContainer.style.cssText = `
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
      position: relative;
    `

    // Progress bar fill
    this.progressBar = document.createElement('div')
    this.progressBar.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #44aaff, #00ffaa);
      border-radius: 2px;
      transition: width 0.3s ease-out;
      position: relative;
    `

    // Shimmer effect
    const shimmer = document.createElement('div')
    shimmer.style.cssText = `
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      animation: shimmer 2s infinite;
    `
    this.progressBar.appendChild(shimmer)

    progressContainer.appendChild(this.progressBar)
    content.appendChild(progressContainer)

    // Progress percentage
    this.progressText = document.createElement('p')
    this.progressText.textContent = '0%'
    this.progressText.style.cssText = `
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      margin: 0.75rem 0 0;
      font-variant-numeric: tabular-nums;
    `
    content.appendChild(this.progressText)

    container.appendChild(content)

    // Add keyframe animations
    const style = document.createElement('style')
    style.id = 'loading-screen-styles'
    style.textContent = `
      @keyframes spin0 {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes spin1 {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(-360deg); }
      }
      @keyframes spin2 {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes pulse {
        0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        50% { opacity: 0.7; transform: translate(-50%, -50%) scale(1.2); }
      }
      @keyframes shimmer {
        0% { left: -100%; }
        100% { left: 200%; }
      }
    `
    document.head.appendChild(style)

    document.body.appendChild(container)
    return container
  }

  initParticles(canvas) {
    const ctx = canvas.getContext('2d')
    const particles = []
    const particleCount = 50

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      })
    }

    const animate = () => {
      if (!this.isVisible) return
      
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.speedX
        p.y += p.speedY

        // Wrap around
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(68, 170, 255, ${p.opacity})`
        ctx.fill()
      })

      // Draw connections
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(68, 170, 255, ${0.1 * (1 - distance / 100)})`
            ctx.stroke()
          }
        })
      })

      requestAnimationFrame(animate)
    }

    animate()
  }

  startMessageCycle() {
    this.messageInterval = setInterval(() => {
      this.currentMessageIndex = (this.currentMessageIndex + 1) % this.messages.length
      
      // Fade transition
      anime({
        targets: this.statusText,
        opacity: [1, 0],
        duration: 200,
        easing: 'easeOutQuad',
        complete: () => {
          this.statusText.textContent = this.messages[this.currentMessageIndex]
          anime({
            targets: this.statusText,
            opacity: [0, 1],
            duration: 200,
            easing: 'easeInQuad'
          })
        }
      })
    }, 2500)
  }

  /**
   * Set loading progress (0-100)
   */
  setProgress(value) {
    this.progress = Math.max(0, Math.min(100, value))
    
    if (this.progressBar) {
      this.progressBar.style.width = `${this.progress}%`
    }
    
    if (this.progressText) {
      this.progressText.textContent = `${Math.round(this.progress)}%`
    }

    // Update message based on progress
    if (this.progress < 20) {
      this.setStatus('Initializing neural pathways...')
    } else if (this.progress < 40) {
      this.setStatus('Loading research data...')
    } else if (this.progress < 60) {
      this.setStatus('Constructing 3D environment...')
    } else if (this.progress < 80) {
      this.setStatus('Calibrating visual systems...')
    } else {
      this.setStatus('Preparing experience...')
    }
  }

  /**
   * Set custom status message
   */
  setStatus(message) {
    if (this.statusText && this.statusText.textContent !== message) {
      this.statusText.textContent = message
    }
  }

  /**
   * Hide loading screen with fade animation
   */
  async hide() {
    // Stop message cycling
    if (this.messageInterval) {
      clearInterval(this.messageInterval)
      this.messageInterval = null
    }

    // Complete progress bar
    this.setProgress(100)

    return new Promise((resolve) => {
      // Short delay to show 100%
      setTimeout(() => {
        anime({
          targets: this.element,
          opacity: [1, 0],
          duration: 800,
          easing: 'easeInOutQuad',
          complete: () => {
            this.isVisible = false
            this.remove()
            resolve()
          }
        })
      }, 300)
    })
  }

  /**
   * Remove loading screen from DOM
   */
  remove() {
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    // Remove style element
    const style = document.getElementById('loading-screen-styles')
    if (style) {
      style.remove()
    }
  }

  /**
   * Show loading screen (if hidden)
   */
  show() {
    if (!this.element) {
      this.element = this.createUI()
      this.startMessageCycle()
    }
    this.isVisible = true
    this.element.style.opacity = '1'
  }
}

export default LoadingScreen
