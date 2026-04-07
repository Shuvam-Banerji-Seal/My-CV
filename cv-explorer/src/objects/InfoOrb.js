import * as THREE from 'three'
import { FloatingText } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * InfoOrb - Small floating information sphere with hover tooltip
 */
export class InfoOrb extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.label = options.label || 'Info'
    this.description = options.description || ''
    this.category = options.category || 'default'
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Visual settings
    this.radius = options.radius || 0.25
    this.glowRadius = options.glowRadius || 0.35
    
    // Colors
    this.orbColor = options.orbColor || new THREE.Color(0x44aaff)
    this.glowColor = options.glowColor || new THREE.Color(0x66ccff)
    
    // State
    this.isHovered = false
    this.animationTime = Math.random() * Math.PI * 2
    this.floatOffset = Math.random() * Math.PI * 2
    this.baseY = 0
    
    // Components
    this.orb = null
    this.glow = null
    this.tooltip = null
    this.ring = null
    
    this.build()
    this.setupInteraction()
  }

  build() {
    this.createOrb()
    this.createGlow()
    this.createRing()
    this.createTooltip()
  }

  createOrb() {
    // Main sphere
    const orbGeom = new THREE.SphereGeometry(this.radius, 32, 32)
    const orbMaterial = new THREE.MeshPhysicalMaterial({
      color: this.orbColor,
      metalness: 0.1,
      roughness: 0.2,
      transmission: 0.6,
      thickness: 0.5,
      transparent: true,
      opacity: 0.9,
      emissive: this.orbColor,
      emissiveIntensity: 0.3
    })
    
    this.orb = new THREE.Mesh(orbGeom, orbMaterial)
    this.orb.castShadow = true
    this.add(this.orb)
    
    // Inner core for extra glow
    const coreGeom = new THREE.SphereGeometry(this.radius * 0.5, 16, 16)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: this.glowColor,
      transparent: true,
      opacity: 0.6
    })
    this.core = new THREE.Mesh(coreGeom, coreMaterial)
    this.add(this.core)
    
    // Point light
    this.orbLight = new THREE.PointLight(this.glowColor, 0.5, 3)
    this.add(this.orbLight)
  }

  createGlow() {
    // Outer glow effect using sprite
    const glowCanvas = document.createElement('canvas')
    glowCanvas.width = 128
    glowCanvas.height = 128
    const ctx = glowCanvas.getContext('2d')
    
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    gradient.addColorStop(0, `rgba(${Math.floor(this.glowColor.r * 255)}, ${Math.floor(this.glowColor.g * 255)}, ${Math.floor(this.glowColor.b * 255)}, 0.6)`)
    gradient.addColorStop(0.4, `rgba(${Math.floor(this.glowColor.r * 255)}, ${Math.floor(this.glowColor.g * 255)}, ${Math.floor(this.glowColor.b * 255)}, 0.3)`)
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 128, 128)
    
    const glowTexture = new THREE.CanvasTexture(glowCanvas)
    const glowMaterial = new THREE.SpriteMaterial({
      map: glowTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.glow = new THREE.Sprite(glowMaterial)
    this.glow.scale.set(this.glowRadius * 3, this.glowRadius * 3, 1)
    this.add(this.glow)
    
    this.glowTexture = glowTexture
  }

  createRing() {
    // Orbiting ring
    const ringGeom = new THREE.TorusGeometry(this.radius * 1.5, 0.02, 8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.glowColor,
      transparent: true,
      opacity: 0.5
    })
    
    this.ring = new THREE.Mesh(ringGeom, ringMaterial)
    this.ring.rotation.x = Math.PI / 2
    this.add(this.ring)
    
    // Second ring at angle
    this.ring2 = new THREE.Mesh(ringGeom.clone(), ringMaterial.clone())
    this.ring2.rotation.x = Math.PI / 3
    this.ring2.rotation.z = Math.PI / 4
    this.add(this.ring2)
  }

  createTooltip() {
    // Tooltip that appears on hover
    this.tooltip = new FloatingText(this.label, {
      style: 'label',
      textRenderer: this.textRenderer,
      glowColor: this.glowColor,
      glowIntensity: 0.4,
      animate: false,
      billboard: true,
      fontSize: 14
    })
    this.tooltip.position.y = this.radius + 0.4
    this.tooltip.visible = false
    this.add(this.tooltip)
  }

  setupInteraction() {
    this.userData.interactive = true
    this.userData.type = 'infoOrb'
    this.userData.label = this.label
    this.userData.description = this.description
    this.userData.category = this.category
    this.userData.onClick = () => this.showInfo()
    this.userData.onHover = (hovering) => this.setHovered(hovering)
  }

  setHovered(hovered) {
    this.isHovered = hovered
    
    // Show/hide tooltip
    if (this.tooltip) {
      this.tooltip.visible = hovered
    }
    
    // Intensify glow
    if (this.orb) {
      this.orb.material.emissiveIntensity = hovered ? 0.6 : 0.3
    }
    if (this.glow) {
      this.glow.scale.setScalar(hovered ? this.glowRadius * 4 : this.glowRadius * 3)
    }
    if (this.orbLight) {
      this.orbLight.intensity = hovered ? 1 : 0.5
    }
  }

  showInfo() {
    this.dispatchEvent({
      type: 'showInfo',
      orb: this,
      label: this.label,
      description: this.description,
      category: this.category
    })
  }

  setPosition(x, y, z) {
    this.position.set(x, y, z)
    this.baseY = y
  }

  update(deltaTime, camera) {
    this.animationTime += deltaTime
    
    // Floating motion
    this.position.y = this.baseY + Math.sin(this.animationTime + this.floatOffset) * 0.1
    
    // Gentle rotation
    if (this.orb) {
      this.orb.rotation.y += deltaTime * 0.3
    }
    
    // Rotate rings
    if (this.ring) {
      this.ring.rotation.z += deltaTime * 0.5
    }
    if (this.ring2) {
      this.ring2.rotation.y += deltaTime * 0.4
    }
    
    // Pulse core
    if (this.core) {
      const pulse = 0.5 + Math.sin(this.animationTime * 2) * 0.3
      this.core.material.opacity = this.isHovered ? 0.9 : pulse
    }
    
    // Update tooltip to face camera
    if (this.tooltip && camera) {
      this.tooltip.quaternion.copy(camera.quaternion)
    }
  }

  dispose() {
    if (this.glowTexture) {
      this.glowTexture.dispose()
    }
    
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

/**
 * Create a cluster of InfoOrbs for a skill category
 */
export function createOrbCluster(skills, options = {}) {
  const cluster = new THREE.Group()
  const orbs = []
  
  const clusterRadius = options.clusterRadius || 2
  const orbColor = options.orbColor || new THREE.Color(0x44aaff)
  
  skills.forEach((skill, index) => {
    const angle = (index / skills.length) * Math.PI * 2
    const radius = clusterRadius * (0.5 + Math.random() * 0.5)
    const height = Math.random() * 1.5
    
    const orb = new InfoOrb({
      label: skill,
      category: options.category || 'skills',
      orbColor: orbColor,
      textRenderer: options.textRenderer,
      radius: 0.15 + Math.random() * 0.1
    })
    
    orb.setPosition(
      Math.cos(angle) * radius,
      height,
      Math.sin(angle) * radius
    )
    
    cluster.add(orb)
    orbs.push(orb)
  })
  
  cluster.orbs = orbs
  
  cluster.update = (deltaTime, camera) => {
    for (const orb of orbs) {
      orb.update(deltaTime, camera)
    }
  }
  
  cluster.dispose = () => {
    for (const orb of orbs) {
      orb.dispose()
    }
    cluster.clear()
  }
  
  return cluster
}

export default InfoOrb
