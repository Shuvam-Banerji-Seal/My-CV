import * as THREE from 'three'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * FloatingText - Creates animated floating text panels with glow effects
 */
export class FloatingText extends THREE.Group {
  constructor(text, options = {}) {
    super()
    
    this.text = text
    this.options = options
    this.style = options.style || 'body' // 'title', 'body', 'highlight', 'label'
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Animation state
    this.animationEnabled = options.animate !== false
    this.bobAmplitude = options.bobAmplitude || 0.05
    this.bobSpeed = options.bobSpeed || 1
    this.rotationAmplitude = options.rotationAmplitude || 0.02
    this.initialY = 0
    this.time = Math.random() * Math.PI * 2 // Random phase offset
    
    // Glow settings
    this.glowEnabled = options.glow !== false
    this.glowColor = options.glowColor || new THREE.Color(0x4488ff)
    this.glowIntensity = options.glowIntensity || 0.3
    
    // Billboard mode - always face camera
    this.billboardMode = options.billboard !== false
    
    // Create the text panel
    this.panel = null
    this.glowMesh = null
    this.createPanel()
  }

  createPanel() {
    // Create text panel based on style
    let panel
    const renderOptions = { ...this.options }
    
    switch (this.style) {
      case 'title':
        panel = this.textRenderer.createTitlePanel(this.text, renderOptions)
        break
      case 'highlight':
        panel = this.textRenderer.createHighlightPanel(this.text, renderOptions)
        break
      case 'label':
        panel = this.textRenderer.createLabel(this.text, renderOptions)
        break
      case 'body':
      default:
        panel = this.textRenderer.createBodyPanel(this.text, renderOptions)
        break
    }
    
    this.panel = panel
    this.add(panel.mesh)
    
    // Create glow effect
    if (this.glowEnabled) {
      this.createGlow(panel.width, panel.height)
    }
  }

  createGlow(width, height) {
    // Create a slightly larger plane behind the text for glow effect
    const glowScale = 1.15
    const glowGeometry = new THREE.PlaneGeometry(width * glowScale, height * glowScale)
    
    // Create gradient texture for glow
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 128
    glowCanvas.height = 128
    const ctx = glowCanvas.getContext('2d')
    
    // Radial gradient for soft glow
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, `rgba(${Math.floor(this.glowColor.r * 255)}, ${Math.floor(this.glowColor.g * 255)}, ${Math.floor(this.glowColor.b * 255)}, ${this.glowIntensity})`)
    gradient.addColorStop(0.5, `rgba(${Math.floor(this.glowColor.r * 255)}, ${Math.floor(this.glowColor.g * 255)}, ${Math.floor(this.glowColor.b * 255)}, ${this.glowIntensity * 0.3})`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    
    const glowTexture = new THREE.CanvasTexture(glowCanvas)
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    
    this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
    this.glowMesh.position.z = -0.01 // Slightly behind the text
    this.glowMesh.userData.glowTexture = glowTexture
    
    this.add(this.glowMesh)
  }

  /**
   * Update animation - call this in your render loop
   */
  update(deltaTime, camera) {
    this.time += deltaTime * this.bobSpeed
    
    // Hover/bob animation
    if (this.animationEnabled) {
      const bobOffset = Math.sin(this.time) * this.bobAmplitude
      this.position.y = this.initialY + bobOffset
      
      // Subtle rotation wobble
      this.rotation.z = Math.sin(this.time * 0.7) * this.rotationAmplitude
    }
    
    // Billboard - face the camera
    if (this.billboardMode && camera) {
      this.quaternion.copy(camera.quaternion)
    }
    
    // Pulse glow
    if (this.glowMesh && this.animationEnabled) {
      const glowPulse = 0.8 + Math.sin(this.time * 1.5) * 0.2
      this.glowMesh.material.opacity = glowPulse
    }
  }

  /**
   * Set the initial Y position (for bob animation baseline)
   */
  setPosition(x, y, z) {
    this.position.set(x, y, z)
    this.initialY = y
  }

  /**
   * Update the text content
   */
  setText(newText) {
    this.text = newText
    this.textRenderer.updateTextPanel(this.panel, newText, this.options)
    
    // Update glow size if needed
    if (this.glowMesh) {
      const glowScale = 1.15
      this.glowMesh.geometry.dispose()
      this.glowMesh.geometry = new THREE.PlaneGeometry(
        this.panel.width * glowScale,
        this.panel.height * glowScale
      )
    }
  }

  /**
   * Set glow color
   */
  setGlowColor(color) {
    this.glowColor = color instanceof THREE.Color ? color : new THREE.Color(color)
    
    if (this.glowMesh) {
      // Recreate glow with new color
      this.remove(this.glowMesh)
      this.glowMesh.geometry.dispose()
      this.glowMesh.material.dispose()
      this.glowMesh.userData.glowTexture.dispose()
      this.createGlow(this.panel.width, this.panel.height)
    }
  }

  /**
   * Enable/disable animation
   */
  setAnimationEnabled(enabled) {
    this.animationEnabled = enabled
    if (!enabled) {
      this.position.y = this.initialY
      this.rotation.z = 0
    }
  }

  /**
   * Fade in animation
   */
  fadeIn(duration = 0.5) {
    if (this.panel && this.panel.mesh) {
      this.panel.mesh.material.opacity = 0
      const startTime = performance.now()
      
      const animate = () => {
        const elapsed = (performance.now() - startTime) / 1000
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
        
        this.panel.mesh.material.opacity = eased
        if (this.glowMesh) {
          this.glowMesh.material.opacity = eased * 0.8
        }
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      
      animate()
    }
  }

  /**
   * Fade out animation
   */
  fadeOut(duration = 0.5) {
    return new Promise((resolve) => {
      if (this.panel && this.panel.mesh) {
        const startOpacity = this.panel.mesh.material.opacity
        const startTime = performance.now()
        
        const animate = () => {
          const elapsed = (performance.now() - startTime) / 1000
          const progress = Math.min(elapsed / duration, 1)
          const eased = Math.pow(1 - progress, 3) // Ease in cubic
          
          this.panel.mesh.material.opacity = startOpacity * eased
          if (this.glowMesh) {
            this.glowMesh.material.opacity = startOpacity * eased * 0.8
          }
          
          if (progress < 1) {
            requestAnimationFrame(animate)
          } else {
            resolve()
          }
        }
        
        animate()
      } else {
        resolve()
      }
    })
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.panel) {
      this.panel.dispose()
    }
    
    if (this.glowMesh) {
      this.glowMesh.geometry.dispose()
      this.glowMesh.material.dispose()
      if (this.glowMesh.userData.glowTexture) {
        this.glowMesh.userData.glowTexture.dispose()
      }
    }
    
    this.clear()
  }
}

/**
 * Factory functions for common text styles
 */
export function createTitle(text, options = {}) {
  return new FloatingText(text, { style: 'title', ...options })
}

export function createBody(text, options = {}) {
  return new FloatingText(text, { style: 'body', ...options })
}

export function createHighlight(text, options = {}) {
  return new FloatingText(text, { style: 'highlight', ...options })
}

export function createLabel(text, options = {}) {
  return new FloatingText(text, { 
    style: 'label', 
    animate: false,
    glow: false,
    ...options 
  })
}
