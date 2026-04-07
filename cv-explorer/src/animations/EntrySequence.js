import anime from 'animejs'

/**
 * EntrySequence - Cinematic entry animation when page loads
 * Coordinates Three.js camera movements with DOM animations
 */
export class EntrySequence {
  constructor(sceneManager, worldBuilder, controls, camera) {
    this.scene = sceneManager
    this.world = worldBuilder
    this.controls = controls
    this.camera = camera
    this.timeline = null
    this.isPlaying = false
    this.isSkipped = false
    this.onComplete = null
    
    // DOM elements created during sequence
    this.overlay = null
    this.titleElement = null
    this.subtitleElement = null
    this.promptElement = null
    
    // Original camera state
    this.originalCameraY = camera?.getCamera?.()?.position?.y || 1.7
    
    this.setupSkipListener()
  }

  setupSkipListener() {
    const skipHandler = (e) => {
      if (this.isPlaying && !this.isSkipped) {
        // Skip on click, Enter, or Space
        if (e.type === 'click' || e.key === 'Enter' || e.key === ' ') {
          this.skip()
        }
      }
    }
    
    document.addEventListener('click', skipHandler)
    document.addEventListener('keydown', skipHandler)
    
    this.cleanupSkipListener = () => {
      document.removeEventListener('click', skipHandler)
      document.removeEventListener('keydown', skipHandler)
    }
  }

  createOverlay() {
    // Create black overlay for fade effect
    this.overlay = document.createElement('div')
    this.overlay.id = 'entry-overlay'
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #000;
      z-index: 100;
      pointer-events: none;
    `
    document.body.appendChild(this.overlay)
  }

  createTitleElements() {
    // Container for title sequence
    const container = document.createElement('div')
    container.id = 'entry-title-container'
    container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 101;
      text-align: center;
      pointer-events: none;
    `
    
    // Main title
    this.titleElement = document.createElement('h1')
    this.titleElement.id = 'entry-title'
    this.titleElement.textContent = ''
    this.titleElement.style.cssText = `
      font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: clamp(2rem, 5vw, 4rem);
      font-weight: 700;
      color: #fff;
      margin: 0;
      opacity: 0;
      letter-spacing: 0.05em;
      text-shadow: 0 0 30px rgba(68, 170, 255, 0.5);
    `
    container.appendChild(this.titleElement)
    
    // Subtitle
    this.subtitleElement = document.createElement('p')
    this.subtitleElement.id = 'entry-subtitle'
    this.subtitleElement.style.cssText = `
      font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: clamp(0.9rem, 2vw, 1.3rem);
      font-weight: 400;
      color: rgba(255, 255, 255, 0.7);
      margin: 1rem 0 0 0;
      opacity: 0;
      letter-spacing: 0.1em;
    `
    container.appendChild(this.subtitleElement)
    
    document.body.appendChild(container)
    this.titleContainer = container
  }

  createPromptElement() {
    this.promptElement = document.createElement('div')
    this.promptElement.id = 'entry-prompt'
    this.promptElement.innerHTML = `
      <span class="prompt-text">Click to explore</span>
      <span class="prompt-icon">↓</span>
    `
    this.promptElement.style.cssText = `
      position: fixed;
      bottom: 10%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 101;
      text-align: center;
      opacity: 0;
      cursor: pointer;
      pointer-events: auto;
    `
    
    // Add styles
    const style = document.createElement('style')
    style.textContent = `
      #entry-prompt .prompt-text {
        font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont, sans-serif;
        font-size: 1rem;
        color: rgba(255, 255, 255, 0.8);
        letter-spacing: 0.15em;
        text-transform: uppercase;
      }
      #entry-prompt .prompt-icon {
        display: block;
        font-size: 1.5rem;
        margin-top: 0.5rem;
        color: rgba(68, 170, 255, 0.8);
        animation: bounce 1.5s ease-in-out infinite;
      }
      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(8px); }
      }
    `
    document.head.appendChild(style)
    document.body.appendChild(this.promptElement)
  }

  async play() {
    this.isPlaying = true
    
    // Create DOM elements
    this.createOverlay()
    this.createTitleElements()
    this.createPromptElement()
    
    // Disable controls initially
    if (this.controls?.disable) {
      this.controls.disable()
    }
    
    // Get camera and set starting position
    const cam = this.camera?.getCamera?.()
    const startY = -5 // Below terrain
    const endY = this.originalCameraY
    
    if (cam) {
      cam.position.y = startY
    }
    
    // Get CV data for title
    let titleText = 'Welcome'
    let subtitleText = 'Interactive CV Experience'
    
    try {
      const { cvData } = await import('../data/cvData.js')
      if (cvData?.header) {
        titleText = cvData.header.name || titleText
        subtitleText = cvData.header.title || subtitleText
      }
    } catch (e) {
      console.warn('Could not load CV data for entry sequence')
    }
    
    return new Promise((resolve) => {
      this.onComplete = resolve
      
      // Create main timeline
      this.timeline = anime.timeline({
        easing: 'easeOutQuad',
        complete: () => this.onSequenceComplete()
      })
      
      // 1. Fade in from black (2s)
      this.timeline.add({
        targets: this.overlay,
        opacity: [1, 0],
        duration: 2000,
        easing: 'easeInOutQuad'
      })
      
      // 2. Camera rises from below terrain (parallel with fade)
      if (cam) {
        this.timeline.add({
          targets: { y: startY },
          y: endY,
          duration: 2500,
          easing: 'easeOutCubic',
          update: (anim) => {
            const progress = anim.animations[0].currentValue
            cam.position.y = progress
          }
        }, 0) // Start at same time as fade
      }
      
      // 3. Title text fades in with typewriter effect
      this.timeline.add({
        targets: this.titleElement,
        opacity: [0, 1],
        duration: 500,
        begin: () => {
          this.typewriterEffect(this.titleElement, titleText, 80)
        }
      }, 1500)
      
      // 4. Subtitle fades in
      this.timeline.add({
        targets: this.subtitleElement,
        opacity: [0, 1],
        duration: 800,
        begin: () => {
          this.subtitleElement.textContent = subtitleText
        }
      }, 2000 + titleText.length * 80)
      
      // 5. Waypoints appear with stagger
      if (this.world) {
        const waypoints = this.getWaypoints()
        if (waypoints.length > 0) {
          // Store original scales and set to 0
          waypoints.forEach(wp => {
            wp.userData.originalScale = wp.scale.clone()
            wp.scale.set(0, 0, 0)
          })
          
          this.timeline.add({
            targets: waypoints.map(wp => wp.scale),
            x: [0, 1],
            y: [0, 1],
            z: [0, 1],
            duration: 600,
            delay: anime.stagger(150),
            easing: 'easeOutBack'
          }, 2500 + titleText.length * 80)
        }
      }
      
      // 6. "Click to explore" prompt appears
      this.timeline.add({
        targets: this.promptElement,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        easing: 'easeOutQuad'
      }, '-=400')
      
      // Wait a moment then start fading title
      this.timeline.add({
        targets: [this.titleElement, this.subtitleElement],
        opacity: 0,
        duration: 1000,
        delay: 1500
      })
    })
  }

  typewriterEffect(element, text, speed = 50) {
    element.textContent = ''
    let index = 0
    
    const type = () => {
      if (this.isSkipped) {
        element.textContent = text
        return
      }
      
      if (index < text.length) {
        element.textContent += text.charAt(index)
        index++
        setTimeout(type, speed)
      }
    }
    
    type()
  }

  getWaypoints() {
    const waypoints = []
    if (!this.world?.sections) return waypoints
    
    // Find waypoints in the scene
    this.scene?.scene?.traverse?.(child => {
      if (child.userData?.type === 'waypoint') {
        waypoints.push(child)
      }
    })
    
    return waypoints
  }

  skip() {
    this.isSkipped = true
    
    if (this.timeline) {
      this.timeline.pause()
    }
    
    // Immediately complete all animations
    const cam = this.camera?.getCamera?.()
    if (cam) {
      cam.position.y = this.originalCameraY
    }
    
    // Show full title immediately
    if (this.titleElement) {
      this.titleElement.style.opacity = '1'
    }
    
    // Restore waypoint scales
    this.getWaypoints().forEach(wp => {
      if (wp.userData.originalScale) {
        wp.scale.copy(wp.userData.originalScale)
      } else {
        wp.scale.set(1, 1, 1)
      }
    })
    
    // Quick cleanup animation
    anime({
      targets: [this.overlay, this.titleContainer, this.promptElement],
      opacity: 0,
      duration: 300,
      easing: 'easeOutQuad',
      complete: () => this.onSequenceComplete()
    })
  }

  onSequenceComplete() {
    this.isPlaying = false
    
    // Enable controls
    if (this.controls?.enable) {
      this.controls.enable()
    }
    
    // Cleanup DOM
    this.cleanup()
    
    // Call completion callback
    if (this.onComplete) {
      this.onComplete()
    }
  }

  cleanup() {
    // Remove DOM elements
    if (this.overlay) {
      this.overlay.remove()
      this.overlay = null
    }
    if (this.titleContainer) {
      this.titleContainer.remove()
      this.titleContainer = null
    }
    if (this.promptElement) {
      this.promptElement.remove()
      this.promptElement = null
    }
    
    // Remove event listeners
    if (this.cleanupSkipListener) {
      this.cleanupSkipListener()
    }
  }
}

export default EntrySequence
