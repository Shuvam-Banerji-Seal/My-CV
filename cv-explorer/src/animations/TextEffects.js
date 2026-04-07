import anime from 'animejs'

/**
 * TextEffects - Reusable text animation utilities
 * For both DOM elements and preparing text for 3D rendering
 */
export class TextEffects {
  constructor() {
    this.activeAnimations = new Map()
    this.glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`'
  }

  /**
   * Classic typewriter effect with cursor
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to type
   * @param {Object} options - Configuration options
   */
  typewriter(element, text, options = {}) {
    const {
      speed = 50,
      cursor = true,
      cursorChar = '|',
      onComplete = null,
      startDelay = 0
    } = options

    element.textContent = ''
    element.style.position = 'relative'
    
    // Create cursor element
    let cursorElement = null
    if (cursor) {
      cursorElement = document.createElement('span')
      cursorElement.className = 'typewriter-cursor'
      cursorElement.textContent = cursorChar
      cursorElement.style.cssText = `
        animation: blink 0.8s step-end infinite;
        margin-left: 2px;
      `
      
      // Add blink animation if not exists
      if (!document.getElementById('typewriter-styles')) {
        const style = document.createElement('style')
        style.id = 'typewriter-styles'
        style.textContent = `
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
        `
        document.head.appendChild(style)
      }
    }

    let index = 0
    let timeoutId = null

    const type = () => {
      if (index < text.length) {
        element.textContent += text.charAt(index)
        if (cursorElement) {
          element.appendChild(cursorElement)
        }
        index++
        timeoutId = setTimeout(type, speed)
      } else {
        // Remove cursor after typing complete
        if (cursorElement) {
          setTimeout(() => {
            cursorElement.style.animation = 'none'
            cursorElement.style.opacity = '0'
          }, 1500)
        }
        if (onComplete) onComplete()
      }
    }

    timeoutId = setTimeout(type, startDelay)
    
    // Return cancel function
    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      element.textContent = text
      if (cursorElement) cursorElement.remove()
    }
  }

  /**
   * Fade in paragraphs word by word or line by line
   * @param {HTMLElement} element - Target element
   * @param {Object} options - Configuration options
   */
  fadeInText(element, options = {}) {
    const {
      mode = 'word', // 'word', 'line', 'char'
      duration = 500,
      stagger = 50,
      easing = 'easeOutQuad',
      onComplete = null
    } = options

    const text = element.textContent
    element.textContent = ''
    element.style.opacity = '1'

    let items = []
    
    switch (mode) {
      case 'char':
        items = text.split('')
        break
      case 'line':
        items = text.split('\n')
        break
      case 'word':
      default:
        items = text.split(/(\s+)/)
    }

    // Wrap each item in a span
    items.forEach((item, index) => {
      const span = document.createElement('span')
      span.textContent = item
      span.style.cssText = `
        display: inline-block;
        opacity: 0;
        transform: translateY(10px);
      `
      element.appendChild(span)
    })

    const spans = element.querySelectorAll('span')

    const animation = anime({
      targets: spans,
      opacity: [0, 1],
      translateY: [10, 0],
      duration: duration,
      delay: anime.stagger(stagger),
      easing: easing,
      complete: () => {
        // Clean up spans, restore original text
        element.textContent = text
        if (onComplete) onComplete()
      }
    })

    this.activeAnimations.set(element, animation)
    return animation
  }

  /**
   * Glitch effect for tech terms and headers
   * @param {HTMLElement} element - Target element
   * @param {Object} options - Configuration options
   */
  glitch(element, options = {}) {
    const {
      duration = 1000,
      iterations = 3,
      intensity = 0.3, // 0-1, portion of text to glitch
      finalText = element.textContent,
      onComplete = null
    } = options

    const originalText = element.textContent
    const textLength = originalText.length
    const glitchCount = Math.floor(textLength * intensity)
    
    let iteration = 0
    const intervalDuration = duration / (iterations * 2)
    let intervalId = null

    const glitchText = () => {
      if (iteration >= iterations * 2) {
        element.textContent = finalText
        if (onComplete) onComplete()
        return
      }

      if (iteration % 2 === 0) {
        // Glitch phase
        let glitched = originalText.split('')
        const indices = new Set()
        
        while (indices.size < glitchCount) {
          indices.add(Math.floor(Math.random() * textLength))
        }
        
        indices.forEach(i => {
          glitched[i] = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)]
        })
        
        element.textContent = glitched.join('')
        
        // Add visual glitch effect
        element.style.textShadow = `
          ${Math.random() * 4 - 2}px 0 #ff0000,
          ${Math.random() * -4 + 2}px 0 #00ffff
        `
        element.style.transform = `translateX(${Math.random() * 4 - 2}px)`
      } else {
        // Normal phase
        element.textContent = originalText
        element.style.textShadow = 'none'
        element.style.transform = 'none'
      }

      iteration++
      intervalId = setTimeout(glitchText, intervalDuration)
    }

    glitchText()

    // Return cancel function
    return () => {
      if (intervalId) clearTimeout(intervalId)
      element.textContent = finalText
      element.style.textShadow = 'none'
      element.style.transform = 'none'
    }
  }

  /**
   * Continuous subtle glitch for background elements
   */
  continuousGlitch(element, options = {}) {
    const {
      intensity = 0.1,
      frequency = 2000, // ms between glitches
      glitchDuration = 100
    } = options

    let intervalId = null
    let timeoutId = null
    const originalText = element.textContent

    const doGlitch = () => {
      // Randomly decide if we should glitch
      if (Math.random() > 0.7) {
        const textLength = originalText.length
        const glitchCount = Math.max(1, Math.floor(textLength * intensity))
        let glitched = originalText.split('')
        
        for (let i = 0; i < glitchCount; i++) {
          const idx = Math.floor(Math.random() * textLength)
          glitched[idx] = this.glitchChars[Math.floor(Math.random() * this.glitchChars.length)]
        }
        
        element.textContent = glitched.join('')
        
        timeoutId = setTimeout(() => {
          element.textContent = originalText
        }, glitchDuration)
      }
    }

    intervalId = setInterval(doGlitch, frequency)

    // Return stop function
    return () => {
      if (intervalId) clearInterval(intervalId)
      if (timeoutId) clearTimeout(timeoutId)
      element.textContent = originalText
    }
  }

  /**
   * Scramble text then resolve to final text
   */
  scrambleReveal(element, options = {}) {
    const {
      duration = 1500,
      finalText = element.textContent,
      chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
      onComplete = null
    } = options

    const textLength = finalText.length
    let resolved = new Array(textLength).fill(false)
    let currentText = new Array(textLength).fill('').map(() => 
      chars[Math.floor(Math.random() * chars.length)]
    )
    
    element.textContent = currentText.join('')
    
    const startTime = performance.now()
    let animationId = null

    const update = () => {
      const elapsed = performance.now() - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Progressively resolve characters
      const resolveCount = Math.floor(progress * textLength)
      
      for (let i = 0; i < textLength; i++) {
        if (i < resolveCount && !resolved[i]) {
          resolved[i] = true
          currentText[i] = finalText[i]
        } else if (!resolved[i]) {
          // Keep scrambling unresolved characters
          currentText[i] = chars[Math.floor(Math.random() * chars.length)]
        }
      }
      
      element.textContent = currentText.join('')
      
      if (progress < 1) {
        animationId = requestAnimationFrame(update)
      } else {
        element.textContent = finalText
        if (onComplete) onComplete()
      }
    }

    animationId = requestAnimationFrame(update)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
      element.textContent = finalText
    }
  }

  /**
   * Split text for 3D rendering with per-character animation data
   * Returns array of objects ready for Three.js text rendering
   */
  prepareFor3D(text, options = {}) {
    const {
      type = 'typewriter', // 'typewriter', 'wave', 'scatter'
      duration = 1000,
      stagger = 50
    } = options

    const chars = text.split('')
    
    return chars.map((char, index) => {
      const baseDelay = index * stagger
      
      let animationData = {
        char,
        index,
        delay: baseDelay,
        duration: duration
      }

      switch (type) {
        case 'wave':
          animationData.offsetY = Math.sin(index * 0.5) * 0.1
          animationData.phase = index * 0.3
          break
          
        case 'scatter':
          animationData.startX = (Math.random() - 0.5) * 5
          animationData.startY = (Math.random() - 0.5) * 5
          animationData.startZ = (Math.random() - 0.5) * 2
          animationData.startRotation = Math.random() * Math.PI * 2
          break
          
        case 'typewriter':
        default:
          animationData.startOpacity = 0
          animationData.startScale = 0.5
      }

      return animationData
    })
  }

  /**
   * Counter animation (numbers counting up)
   */
  counter(element, options = {}) {
    const {
      start = 0,
      end = parseInt(element.textContent) || 100,
      duration = 1000,
      prefix = '',
      suffix = '',
      decimals = 0,
      easing = 'easeOutQuad',
      onComplete = null
    } = options

    const obj = { value: start }

    const animation = anime({
      targets: obj,
      value: end,
      duration: duration,
      easing: easing,
      round: decimals === 0 ? 1 : false,
      update: () => {
        const displayValue = decimals > 0 
          ? obj.value.toFixed(decimals)
          : Math.round(obj.value)
        element.textContent = `${prefix}${displayValue}${suffix}`
      },
      complete: () => {
        if (onComplete) onComplete()
      }
    })

    return animation
  }

  /**
   * Highlight effect - draws attention to text
   */
  highlight(element, options = {}) {
    const {
      color = '#ffff00',
      duration = 300,
      repeat = 2
    } = options

    const originalBg = element.style.backgroundColor

    return anime({
      targets: element,
      backgroundColor: [originalBg || 'transparent', color, originalBg || 'transparent'],
      duration: duration,
      easing: 'easeInOutQuad',
      loop: repeat
    })
  }

  /**
   * Stop all active animations
   */
  stopAll() {
    this.activeAnimations.forEach(animation => {
      if (animation.pause) animation.pause()
    })
    this.activeAnimations.clear()
  }

  /**
   * Stop animation for specific element
   */
  stop(element) {
    const animation = this.activeAnimations.get(element)
    if (animation) {
      if (animation.pause) animation.pause()
      this.activeAnimations.delete(element)
    }
  }
}

// Export singleton instance
export const textEffects = new TextEffects()
export default TextEffects
