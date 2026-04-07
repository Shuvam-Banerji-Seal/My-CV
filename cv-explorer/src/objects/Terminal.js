import * as THREE from 'three'
import { FloatingText } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * Terminal - A futuristic kiosk/terminal for displaying detailed information
 */
export class Terminal extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.title = options.title || 'Terminal'
    this.content = options.content || ''
    this.details = options.details || []
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Visual settings
    this.width = options.width || 2.5
    this.height = options.height || 3
    this.depth = options.depth || 0.15
    this.frameWidth = options.frameWidth || 0.08
    
    // Colors
    this.frameColor = options.frameColor || 0x2a4a6a
    this.glowColor = options.glowColor || new THREE.Color(0x00ccff)
    this.panelColor = options.panelColor || 0x0a1520
    this.accentColor = options.accentColor || 0x00ccff
    
    // State
    this.isHovered = false
    this.isExpanded = false
    this.animationTime = 0
    
    // Components
    this.frame = null
    this.panel = null
    this.glowEdges = null
    this.titleText = null
    this.contentText = null
    this.detailsGroup = null
    this.hoverLight = null
    
    this.build()
    this.setupInteraction()
  }

  build() {
    this.createFrame()
    this.createPanel()
    this.createGlowEdges()
    this.createContent()
    this.createHoverLight()
  }

  createFrame() {
    // Outer frame using BoxGeometry edges
    const frameGroup = new THREE.Group()
    
    // Main frame border
    const frameMaterial = new THREE.MeshStandardMaterial({
      color: this.frameColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: this.glowColor,
      emissiveIntensity: 0.1
    })
    
    // Top bar
    const topGeom = new THREE.BoxGeometry(this.width, this.frameWidth, this.depth)
    const topBar = new THREE.Mesh(topGeom, frameMaterial)
    topBar.position.y = this.height / 2 - this.frameWidth / 2
    frameGroup.add(topBar)
    
    // Bottom bar
    const bottomBar = topBar.clone()
    bottomBar.position.y = -this.height / 2 + this.frameWidth / 2
    frameGroup.add(bottomBar)
    
    // Left bar
    const sideGeom = new THREE.BoxGeometry(this.frameWidth, this.height - this.frameWidth * 2, this.depth)
    const leftBar = new THREE.Mesh(sideGeom, frameMaterial)
    leftBar.position.x = -this.width / 2 + this.frameWidth / 2
    frameGroup.add(leftBar)
    
    // Right bar
    const rightBar = leftBar.clone()
    rightBar.position.x = this.width / 2 - this.frameWidth / 2
    frameGroup.add(rightBar)
    
    // Base/stand
    const baseGeom = new THREE.CylinderGeometry(0.4, 0.5, 0.3, 8)
    const baseMesh = new THREE.Mesh(baseGeom, frameMaterial)
    baseMesh.position.y = -this.height / 2 - 0.15
    frameGroup.add(baseMesh)
    
    // Support pole
    const poleGeom = new THREE.CylinderGeometry(0.08, 0.1, 0.8, 8)
    const poleMesh = new THREE.Mesh(poleGeom, frameMaterial)
    poleMesh.position.y = -this.height / 2 - 0.55
    frameGroup.add(poleMesh)
    
    this.frame = frameGroup
    this.add(frameGroup)
  }

  createPanel() {
    // Inner display panel
    const panelGeom = new THREE.PlaneGeometry(
      this.width - this.frameWidth * 2,
      this.height - this.frameWidth * 2
    )
    
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: this.panelColor,
      metalness: 0.1,
      roughness: 0.8,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    })
    
    this.panel = new THREE.Mesh(panelGeom, panelMaterial)
    this.panel.position.z = this.depth / 2 + 0.01
    this.add(this.panel)
  }

  createGlowEdges() {
    // Emissive edge lines
    const glowGroup = new THREE.Group()
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.glowColor,
      transparent: true,
      opacity: 0.8
    })
    
    const edgeThickness = 0.02
    const innerWidth = this.width - this.frameWidth * 2
    const innerHeight = this.height - this.frameWidth * 2
    
    // Create glowing edge strips
    const topEdge = new THREE.Mesh(
      new THREE.BoxGeometry(innerWidth, edgeThickness, edgeThickness),
      glowMaterial
    )
    topEdge.position.set(0, innerHeight / 2 - edgeThickness / 2, this.depth / 2 + 0.02)
    glowGroup.add(topEdge)
    
    const bottomEdge = topEdge.clone()
    bottomEdge.position.y = -innerHeight / 2 + edgeThickness / 2
    glowGroup.add(bottomEdge)
    
    const leftEdge = new THREE.Mesh(
      new THREE.BoxGeometry(edgeThickness, innerHeight, edgeThickness),
      glowMaterial
    )
    leftEdge.position.set(-innerWidth / 2 + edgeThickness / 2, 0, this.depth / 2 + 0.02)
    glowGroup.add(leftEdge)
    
    const rightEdge = leftEdge.clone()
    rightEdge.position.x = innerWidth / 2 - edgeThickness / 2
    glowGroup.add(rightEdge)
    
    this.glowEdges = glowGroup
    this.add(glowGroup)
  }

  createContent() {
    const contentGroup = new THREE.Group()
    contentGroup.position.z = this.depth / 2 + 0.03
    
    // Title
    this.titleText = new FloatingText(this.title, {
      style: 'title',
      textRenderer: this.textRenderer,
      maxWidth: (this.width - this.frameWidth * 4) * 100,
      glowColor: this.glowColor,
      glowIntensity: 0.5,
      animate: false,
      billboard: false
    })
    this.titleText.position.y = this.height / 2 - this.frameWidth - 0.3
    contentGroup.add(this.titleText)
    
    // Main content
    if (this.content) {
      this.contentText = new FloatingText(this.content, {
        style: 'body',
        textRenderer: this.textRenderer,
        maxWidth: (this.width - this.frameWidth * 4) * 100,
        glow: false,
        animate: false,
        billboard: false
      })
      this.contentText.position.y = this.height / 2 - this.frameWidth - 0.8
      contentGroup.add(this.contentText)
    }
    
    // Details list
    if (this.details.length > 0) {
      this.detailsGroup = new THREE.Group()
      let yOffset = this.height / 2 - this.frameWidth - 1.3
      
      for (const detail of this.details) {
        const detailText = new FloatingText(`• ${detail}`, {
          style: 'body',
          textRenderer: this.textRenderer,
          maxWidth: (this.width - this.frameWidth * 4) * 100,
          fontSize: 12,
          glow: false,
          animate: false,
          billboard: false
        })
        detailText.position.y = yOffset
        this.detailsGroup.add(detailText)
        yOffset -= 0.25
      }
      
      contentGroup.add(this.detailsGroup)
    }
    
    this.add(contentGroup)
  }

  createHoverLight() {
    // Spotlight that activates on hover
    this.hoverLight = new THREE.PointLight(this.glowColor, 0, 5)
    this.hoverLight.position.set(0, 0, 1.5)
    this.add(this.hoverLight)
  }

  setupInteraction() {
    // Mark as interactable
    this.userData.interactive = true
    this.userData.type = 'terminal'
    this.userData.title = this.title
    this.userData.onClick = () => this.toggle()
    this.userData.onHover = (hovering) => this.setHovered(hovering)
  }

  setHovered(hovered) {
    this.isHovered = hovered
    
    // Animate glow intensity
    const targetIntensity = hovered ? 2 : 0
    this.hoverLight.intensity = targetIntensity
    
    // Update glow edges opacity
    if (this.glowEdges) {
      this.glowEdges.children.forEach(edge => {
        edge.material.opacity = hovered ? 1 : 0.8
      })
    }
  }

  toggle() {
    this.isExpanded = !this.isExpanded
    
    // Dispatch event for external handlers
    this.dispatchEvent({
      type: this.isExpanded ? 'expand' : 'collapse',
      terminal: this
    })
  }

  update(deltaTime, camera) {
    this.animationTime += deltaTime
    
    // Pulse glow edges
    if (this.glowEdges) {
      const pulse = 0.7 + Math.sin(this.animationTime * 2) * 0.3
      this.glowEdges.children.forEach(edge => {
        if (!this.isHovered) {
          edge.material.opacity = pulse * 0.8
        }
      })
    }
    
    // Update text elements
    if (this.titleText && this.titleText.update) {
      this.titleText.update(deltaTime, camera)
    }
  }

  dispose() {
    this.traverse(child => {
      if (child.geometry) child.geometry.dispose()
      if (child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach(m => m.dispose())
        } else {
          child.material.dispose()
        }
      }
    })
    this.clear()
  }
}

export default Terminal
