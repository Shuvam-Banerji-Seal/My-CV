import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext'
import * as THREE from 'three'

/**
 * TextRenderer - Creates 3D text panels using Pretext for layout
 * and Three.js CanvasTexture for rendering
 */
export class TextRenderer {
  constructor(options = {}) {
    this.fontSize = options.fontSize || 24
    this.fontFamily = options.fontFamily || 'Inter, system-ui, sans-serif'
    this.color = options.color || '#ffffff'
    this.backgroundColor = options.backgroundColor || 'rgba(0,0,0,0.7)'
    this.padding = options.padding || 20
    this.maxWidth = options.maxWidth || 400
    this.lineHeight = options.lineHeight || 1.4
    this.borderRadius = options.borderRadius || 8
    this.borderColor = options.borderColor || 'rgba(255,255,255,0.1)'
    this.borderWidth = options.borderWidth || 1
  }

  /**
   * Get the font string for canvas context
   */
  getFontString(fontSize = this.fontSize, fontWeight = 'normal') {
    return `${fontWeight} ${fontSize}px ${this.fontFamily}`
  }

  /**
   * Layout text using Pretext and return line information
   */
  layoutText(text, options = {}) {
    const fontSize = options.fontSize || this.fontSize
    const maxWidth = options.maxWidth || this.maxWidth
    const lineHeightPx = fontSize * (options.lineHeight || this.lineHeight)
    const fontWeight = options.fontWeight || 'normal'
    
    const fontString = this.getFontString(fontSize, fontWeight)
    const prepared = prepareWithSegments(text, fontString)
    const { lines } = layoutWithLines(prepared, maxWidth, lineHeightPx)
    
    return {
      lines,
      lineHeight: lineHeightPx,
      fontSize,
      fontString
    }
  }

  /**
   * Create a canvas with the text rendered
   */
  createCanvas(text, options = {}) {
    const padding = options.padding !== undefined ? options.padding : this.padding
    const maxWidth = options.maxWidth || this.maxWidth
    const backgroundColor = options.backgroundColor || this.backgroundColor
    const color = options.color || this.color
    const borderRadius = options.borderRadius !== undefined ? options.borderRadius : this.borderRadius
    const borderColor = options.borderColor || this.borderColor
    const borderWidth = options.borderWidth !== undefined ? options.borderWidth : this.borderWidth
    
    // Layout the text
    const layout = this.layoutText(text, options)
    const { lines, lineHeight, fontString } = layout
    
    // Calculate canvas dimensions
    let textWidth = 0
    for (const line of lines) {
      if (line.width > textWidth) {
        textWidth = line.width
      }
    }
    
    const textHeight = lines.length * lineHeight
    const canvasWidth = Math.ceil(textWidth + padding * 2)
    const canvasHeight = Math.ceil(textHeight + padding * 2)
    
    // Create canvas
    const canvas = document.createElement('canvas')
    const dpr = Math.min(window.devicePixelRatio || 1, 2) // Cap at 2x for performance
    canvas.width = canvasWidth * dpr
    canvas.height = canvasHeight * dpr
    
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    
    // Draw background with rounded corners
    this.drawRoundedRect(ctx, 0, 0, canvasWidth, canvasHeight, borderRadius, backgroundColor)
    
    // Draw border
    if (borderWidth > 0) {
      ctx.strokeStyle = borderColor
      ctx.lineWidth = borderWidth
      this.strokeRoundedRect(ctx, borderWidth / 2, borderWidth / 2, 
        canvasWidth - borderWidth, canvasHeight - borderWidth, borderRadius)
    }
    
    // Draw text
    ctx.font = fontString
    ctx.fillStyle = color
    ctx.textBaseline = 'top'
    
    let y = padding
    for (const line of lines) {
      ctx.fillText(line.text, padding, y)
      y += lineHeight
    }
    
    return {
      canvas,
      width: canvasWidth,
      height: canvasHeight,
      lines,
      dpr
    }
  }

  /**
   * Draw a rounded rectangle
   */
  drawRoundedRect(ctx, x, y, width, height, radius, fillStyle) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.fillStyle = fillStyle
    ctx.fill()
  }

  /**
   * Stroke a rounded rectangle
   */
  strokeRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    ctx.lineTo(x + radius, y + height)
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
    ctx.lineTo(x, y + radius)
    ctx.quadraticCurveTo(x, y, x + radius, y)
    ctx.closePath()
    ctx.stroke()
  }

  /**
   * Create a Three.js mesh with the text texture
   */
  createTextPanel(text, options = {}) {
    const { canvas, width, height } = this.createCanvas(text, options)
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(canvas)
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    texture.generateMipmaps = false
    
    // Create material
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false
    })
    
    // Scale factor to convert pixels to world units
    const scale = options.worldScale || 0.01
    const worldWidth = width * scale
    const worldHeight = height * scale
    
    // Create geometry
    const geometry = new THREE.PlaneGeometry(worldWidth, worldHeight)
    
    // Create mesh
    const mesh = new THREE.Mesh(geometry, material)
    mesh.userData = {
      type: 'textPanel',
      text,
      pixelWidth: width,
      pixelHeight: height
    }
    
    return {
      mesh,
      width: worldWidth,
      height: worldHeight,
      pixelWidth: width,
      pixelHeight: height,
      texture,
      dispose: () => {
        texture.dispose()
        material.dispose()
        geometry.dispose()
      }
    }
  }

  /**
   * Create a title panel with larger, bolder text
   */
  createTitlePanel(text, options = {}) {
    return this.createTextPanel(text, {
      fontSize: 32,
      fontWeight: 'bold',
      padding: 24,
      backgroundColor: 'rgba(20, 20, 40, 0.85)',
      borderColor: 'rgba(100, 150, 255, 0.3)',
      borderWidth: 2,
      ...options
    })
  }

  /**
   * Create a body text panel
   */
  createBodyPanel(text, options = {}) {
    return this.createTextPanel(text, {
      fontSize: 18,
      fontWeight: 'normal',
      padding: 16,
      backgroundColor: 'rgba(10, 10, 30, 0.75)',
      color: 'rgba(255, 255, 255, 0.9)',
      ...options
    })
  }

  /**
   * Create a highlight/accent panel
   */
  createHighlightPanel(text, options = {}) {
    return this.createTextPanel(text, {
      fontSize: 20,
      fontWeight: '500',
      padding: 18,
      backgroundColor: 'rgba(60, 80, 160, 0.8)',
      borderColor: 'rgba(100, 180, 255, 0.5)',
      borderWidth: 2,
      color: '#ffffff',
      ...options
    })
  }

  /**
   * Create a label (small, compact text)
   */
  createLabel(text, options = {}) {
    return this.createTextPanel(text, {
      fontSize: 14,
      fontWeight: '500',
      padding: 8,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      borderRadius: 4,
      maxWidth: 200,
      ...options
    })
  }

  /**
   * Update an existing text panel with new text
   */
  updateTextPanel(panel, newText, options = {}) {
    const { canvas, width, height } = this.createCanvas(newText, options)
    
    // Update texture
    panel.texture.image = canvas
    panel.texture.needsUpdate = true
    
    // Update geometry if size changed
    const scale = options.worldScale || 0.01
    const worldWidth = width * scale
    const worldHeight = height * scale
    
    if (worldWidth !== panel.width || worldHeight !== panel.height) {
      panel.mesh.geometry.dispose()
      panel.mesh.geometry = new THREE.PlaneGeometry(worldWidth, worldHeight)
      panel.width = worldWidth
      panel.height = worldHeight
    }
    
    panel.pixelWidth = width
    panel.pixelHeight = height
    panel.mesh.userData.text = newText
    
    return panel
  }
}

// Export a default instance for convenience
export const textRenderer = new TextRenderer()
