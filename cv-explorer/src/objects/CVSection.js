import * as THREE from 'three'
import { FloatingText, createTitle, createBody, createLabel } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * CVSection - Groups related text panels with a header and expandable content
 */
export class CVSection extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.title = options.title || 'Section'
    this.items = options.items || []
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Layout options
    this.spacing = options.spacing || 0.15
    this.headerSpacing = options.headerSpacing || 0.25
    this.alignment = options.alignment || 'left' // 'left', 'center', 'right'
    this.maxWidth = options.maxWidth || 400
    
    // Expand/collapse state
    this.expanded = options.expanded !== false
    this.expandable = options.expandable !== false
    
    // Animation
    this.animateItems = options.animateItems !== false
    
    // Visual elements
    this.headerText = null
    this.contentGroup = new THREE.Group()
    this.itemPanels = []
    this.connectorLine = null
    
    // Colors
    this.accentColor = options.accentColor || new THREE.Color(0x4488ff)
    this.headerGlowColor = options.headerGlowColor || this.accentColor
    
    this.add(this.contentGroup)
    this.build()
  }

  build() {
    this.clear()
    this.contentGroup = new THREE.Group()
    this.add(this.contentGroup)
    this.itemPanels = []
    
    // Create header
    this.createHeader()
    
    // Create content items
    if (this.expanded) {
      this.createContent()
    }
    
    // Create connector line
    if (this.items.length > 0 && this.expanded) {
      this.createConnector()
    }
  }

  createHeader() {
    this.headerText = createTitle(this.title, {
      textRenderer: this.textRenderer,
      glowColor: this.headerGlowColor,
      glowIntensity: 0.4,
      maxWidth: this.maxWidth,
      animate: this.animateItems,
      bobAmplitude: 0.03,
      bobSpeed: 0.8
    })
    
    this.add(this.headerText)
  }

  createContent() {
    let yOffset = -this.headerSpacing - (this.headerText?.panel?.height || 0.3)
    
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i]
      let panel
      
      if (typeof item === 'string') {
        // Simple text item
        panel = createBody(item, {
          textRenderer: this.textRenderer,
          maxWidth: this.maxWidth,
          animate: this.animateItems,
          bobAmplitude: 0.02,
          bobSpeed: 0.6 + i * 0.1, // Slight variation in animation
          glowIntensity: 0.2
        })
      } else if (typeof item === 'object') {
        // Complex item with title and description
        const itemGroup = new THREE.Group()
        
        if (item.title) {
          const titlePanel = createLabel(item.title, {
            textRenderer: this.textRenderer,
            maxWidth: this.maxWidth,
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: 'rgba(40, 60, 100, 0.7)',
            animate: false
          })
          itemGroup.add(titlePanel)
          
          if (item.description) {
            const descPanel = createBody(item.description, {
              textRenderer: this.textRenderer,
              maxWidth: this.maxWidth,
              fontSize: 14,
              animate: false,
              glow: false
            })
            const titleHeight = titlePanel.panel?.height || 0.15
            descPanel.position.y = -titleHeight - 0.05
            itemGroup.add(descPanel)
          }
        }
        
        panel = itemGroup
        panel.panel = { height: 0.3 } // Approximate height
      }
      
      if (panel) {
        // Position based on alignment
        const panelWidth = panel.panel?.width || 0
        let xOffset = 0
        
        switch (this.alignment) {
          case 'center':
            xOffset = 0
            break
          case 'right':
            xOffset = -panelWidth / 2
            break
          case 'left':
          default:
            xOffset = panelWidth / 2
            break
        }
        
        if (panel.setPosition) {
          panel.setPosition(xOffset, yOffset, 0)
        } else {
          panel.position.set(xOffset, yOffset, 0)
        }
        
        this.contentGroup.add(panel)
        this.itemPanels.push(panel)
        
        yOffset -= (panel.panel?.height || 0.2) + this.spacing
      }
    }
    
    this.totalHeight = Math.abs(yOffset)
  }

  createConnector() {
    // Create a vertical line connecting header to items
    const lineLength = this.totalHeight - this.spacing
    const points = [
      new THREE.Vector3(0, -this.headerSpacing / 2, 0),
      new THREE.Vector3(0, -lineLength, 0)
    ]
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineBasicMaterial({
      color: this.accentColor,
      transparent: true,
      opacity: 0.3
    })
    
    this.connectorLine = new THREE.Line(geometry, material)
    this.connectorLine.position.x = -0.1 // Offset to the left
    this.add(this.connectorLine)
  }

  /**
   * Toggle expanded/collapsed state
   */
  toggle() {
    if (!this.expandable) return
    
    if (this.expanded) {
      this.collapse()
    } else {
      this.expand()
    }
  }

  /**
   * Expand the section
   */
  async expand() {
    if (this.expanded) return
    
    this.expanded = true
    this.createContent()
    
    if (this.items.length > 0) {
      this.createConnector()
    }
    
    // Animate items appearing
    for (let i = 0; i < this.itemPanels.length; i++) {
      const panel = this.itemPanels[i]
      if (panel.fadeIn) {
        setTimeout(() => panel.fadeIn(0.3), i * 50)
      }
    }
    
    // Animate connector
    if (this.connectorLine) {
      this.connectorLine.material.opacity = 0
      const startTime = performance.now()
      const animate = () => {
        const progress = Math.min((performance.now() - startTime) / 300, 1)
        this.connectorLine.material.opacity = progress * 0.3
        if (progress < 1) requestAnimationFrame(animate)
      }
      animate()
    }
  }

  /**
   * Collapse the section
   */
  async collapse() {
    if (!this.expanded) return
    
    // Animate items disappearing
    const fadePromises = this.itemPanels.map((panel, i) => {
      if (panel.fadeOut) {
        return new Promise(resolve => {
          setTimeout(() => panel.fadeOut(0.2).then(resolve), i * 30)
        })
      }
      return Promise.resolve()
    })
    
    await Promise.all(fadePromises)
    
    // Clean up
    this.contentGroup.clear()
    this.itemPanels.forEach(panel => {
      if (panel.dispose) panel.dispose()
    })
    this.itemPanels = []
    
    if (this.connectorLine) {
      this.remove(this.connectorLine)
      this.connectorLine.geometry.dispose()
      this.connectorLine.material.dispose()
      this.connectorLine = null
    }
    
    this.expanded = false
  }

  /**
   * Add an item to the section
   */
  addItem(item) {
    this.items.push(item)
    if (this.expanded) {
      // Rebuild content
      this.contentGroup.clear()
      this.itemPanels.forEach(panel => {
        if (panel.dispose) panel.dispose()
      })
      this.itemPanels = []
      this.createContent()
    }
  }

  /**
   * Remove an item from the section
   */
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 1)
      if (this.expanded) {
        this.contentGroup.clear()
        this.itemPanels.forEach(panel => {
          if (panel.dispose) panel.dispose()
        })
        this.itemPanels = []
        this.createContent()
      }
    }
  }

  /**
   * Update section with new data
   */
  setData(title, items) {
    this.title = title
    this.items = items
    this.build()
  }

  /**
   * Update animation - call in render loop
   */
  update(deltaTime, camera) {
    if (this.headerText && this.headerText.update) {
      this.headerText.update(deltaTime, camera)
    }
    
    for (const panel of this.itemPanels) {
      if (panel.update) {
        panel.update(deltaTime, camera)
      }
    }
  }

  /**
   * Get the total height of the section
   */
  getTotalHeight() {
    if (!this.expanded) {
      return this.headerText?.panel?.height || 0.3
    }
    return this.totalHeight || 0
  }

  /**
   * Clean up resources
   */
  dispose() {
    if (this.headerText && this.headerText.dispose) {
      this.headerText.dispose()
    }
    
    this.itemPanels.forEach(panel => {
      if (panel.dispose) panel.dispose()
    })
    
    if (this.connectorLine) {
      this.connectorLine.geometry.dispose()
      this.connectorLine.material.dispose()
    }
    
    this.clear()
  }
}

/**
 * Create a CV section from structured data
 */
export function createCVSection(sectionData, options = {}) {
  return new CVSection({
    title: sectionData.title,
    items: sectionData.items || sectionData.content || [],
    ...options
  })
}

/**
 * Create multiple CV sections arranged vertically
 */
export function createCVSections(sectionsData, options = {}) {
  const container = new THREE.Group()
  const sections = []
  const sectionSpacing = options.sectionSpacing || 0.5
  
  let yOffset = 0
  
  for (const sectionData of sectionsData) {
    const section = createCVSection(sectionData, options)
    section.position.y = yOffset
    container.add(section)
    sections.push(section)
    
    yOffset -= section.getTotalHeight() + sectionSpacing
  }
  
  container.sections = sections
  
  container.update = (deltaTime, camera) => {
    for (const section of sections) {
      section.update(deltaTime, camera)
    }
  }
  
  container.dispose = () => {
    for (const section of sections) {
      section.dispose()
    }
    container.clear()
  }
  
  return container
}
