import * as THREE from 'three'
import { FloatingText } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * Monument - A stone-like monument with floating crystal for major achievements
 */
export class Monument extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.title = options.title || 'Achievement'
    this.subtitle = options.subtitle || ''
    this.description = options.description || ''
    this.year = options.year || ''
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Visual settings
    this.baseWidth = options.baseWidth || 1.5
    this.baseHeight = options.baseHeight || 0.4
    this.pedestalHeight = options.pedestalHeight || 2
    this.crystalSize = options.crystalSize || 0.6
    
    // Colors
    this.stoneColor = options.stoneColor || 0x3a3a4a
    this.crystalColor = options.crystalColor || new THREE.Color(0x00ffaa)
    this.accentColor = options.accentColor || 0xffd700
    
    // State
    this.isHovered = false
    this.animationTime = Math.random() * Math.PI * 2
    
    // Components
    this.base = null
    this.pedestal = null
    this.crystal = null
    this.particles = null
    this.inscription = null
    this.glowOrb = null
    
    this.build()
    this.setupInteraction()
  }

  build() {
    this.createBase()
    this.createPedestal()
    this.createCrystal()
    this.createParticles()
    this.createInscription()
  }

  createBase() {
    // Stone base platform
    const baseGroup = new THREE.Group()
    
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: this.stoneColor,
      roughness: 0.9,
      metalness: 0.1
    })
    
    // Multi-tiered base
    const tier1 = new THREE.Mesh(
      new THREE.BoxGeometry(this.baseWidth * 1.5, this.baseHeight * 0.5, this.baseWidth * 1.5),
      stoneMaterial
    )
    tier1.position.y = this.baseHeight * 0.25
    tier1.castShadow = true
    tier1.receiveShadow = true
    baseGroup.add(tier1)
    
    const tier2 = new THREE.Mesh(
      new THREE.BoxGeometry(this.baseWidth * 1.2, this.baseHeight * 0.3, this.baseWidth * 1.2),
      stoneMaterial
    )
    tier2.position.y = this.baseHeight * 0.65
    tier2.castShadow = true
    baseGroup.add(tier2)
    
    const tier3 = new THREE.Mesh(
      new THREE.BoxGeometry(this.baseWidth, this.baseHeight * 0.2, this.baseWidth),
      stoneMaterial
    )
    tier3.position.y = this.baseHeight * 0.9
    tier3.castShadow = true
    baseGroup.add(tier3)
    
    this.base = baseGroup
    this.add(baseGroup)
  }

  createPedestal() {
    // Central pillar/pedestal
    const pedestalMaterial = new THREE.MeshStandardMaterial({
      color: this.stoneColor,
      roughness: 0.7,
      metalness: 0.2
    })
    
    // Tapered column
    const pedestalGeom = new THREE.CylinderGeometry(
      this.baseWidth * 0.25,
      this.baseWidth * 0.35,
      this.pedestalHeight,
      8
    )
    
    this.pedestal = new THREE.Mesh(pedestalGeom, pedestalMaterial)
    this.pedestal.position.y = this.baseHeight + this.pedestalHeight / 2
    this.pedestal.castShadow = true
    this.add(this.pedestal)
    
    // Top cap
    const capGeom = new THREE.CylinderGeometry(
      this.baseWidth * 0.35,
      this.baseWidth * 0.25,
      0.15,
      8
    )
    const capMesh = new THREE.Mesh(capGeom, pedestalMaterial)
    capMesh.position.y = this.baseHeight + this.pedestalHeight + 0.075
    capMesh.castShadow = true
    this.add(capMesh)
  }

  createCrystal() {
    // Floating icosahedron crystal
    const crystalGroup = new THREE.Group()
    
    const crystalGeom = new THREE.IcosahedronGeometry(this.crystalSize, 0)
    const crystalMaterial = new THREE.MeshPhysicalMaterial({
      color: this.crystalColor,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      transparent: true,
      opacity: 0.9,
      emissive: this.crystalColor,
      emissiveIntensity: 0.3
    })
    
    this.crystal = new THREE.Mesh(crystalGeom, crystalMaterial)
    crystalGroup.add(this.crystal)
    
    // Inner glow core
    const coreGeom = new THREE.IcosahedronGeometry(this.crystalSize * 0.4, 0)
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: this.crystalColor,
      transparent: true,
      opacity: 0.8
    })
    const core = new THREE.Mesh(coreGeom, coreMaterial)
    crystalGroup.add(core)
    
    // Crystal light
    const crystalLight = new THREE.PointLight(this.crystalColor, 1, 8)
    crystalGroup.add(crystalLight)
    
    crystalGroup.position.y = this.baseHeight + this.pedestalHeight + this.crystalSize + 0.5
    crystalGroup.userData.floatOffset = Math.random() * Math.PI * 2
    
    this.crystalGroup = crystalGroup
    this.add(crystalGroup)
  }

  createParticles() {
    // Floating particles around the crystal
    const particleCount = 30
    const particleGeom = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const colors = new Float32Array(particleCount * 3)
    const sizes = new Float32Array(particleCount)
    
    const color = new THREE.Color(this.crystalColor)
    
    for (let i = 0; i < particleCount; i++) {
      // Random positions in a sphere around the crystal
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const radius = 0.8 + Math.random() * 1.2
      
      positions[i * 3] = Math.sin(phi) * Math.cos(theta) * radius
      positions[i * 3 + 1] = Math.cos(phi) * radius
      positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * radius
      
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
      
      sizes[i] = 0.02 + Math.random() * 0.04
    }
    
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    particleGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    particleGeom.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.particles = new THREE.Points(particleGeom, particleMaterial)
    this.particles.position.y = this.baseHeight + this.pedestalHeight + this.crystalSize + 0.5
    this.add(this.particles)
    
    // Store original positions for animation
    this.particleBasePositions = positions.slice()
  }

  createInscription() {
    // Text on the front of the pedestal
    const inscriptionGroup = new THREE.Group()
    
    // Title
    this.titleText = new FloatingText(this.title, {
      style: 'title',
      textRenderer: this.textRenderer,
      maxWidth: this.baseWidth * 100,
      glowColor: this.accentColor,
      glowIntensity: 0.3,
      animate: false,
      billboard: false,
      fontSize: 16
    })
    this.titleText.scale.setScalar(0.8)
    this.titleText.position.set(0, this.baseHeight + this.pedestalHeight * 0.6, this.baseWidth * 0.3)
    inscriptionGroup.add(this.titleText)
    
    // Year badge
    if (this.year) {
      this.yearText = new FloatingText(String(this.year), {
        style: 'label',
        textRenderer: this.textRenderer,
        glowColor: this.crystalColor,
        glowIntensity: 0.5,
        animate: false,
        billboard: false,
        fontSize: 14
      })
      this.yearText.scale.setScalar(0.6)
      this.yearText.position.set(0, this.baseHeight + this.pedestalHeight * 0.35, this.baseWidth * 0.3)
      inscriptionGroup.add(this.yearText)
    }
    
    // Subtitle
    if (this.subtitle) {
      this.subtitleText = new FloatingText(this.subtitle, {
        style: 'body',
        textRenderer: this.textRenderer,
        maxWidth: this.baseWidth * 100,
        glow: false,
        animate: false,
        billboard: false,
        fontSize: 12
      })
      this.subtitleText.scale.setScalar(0.6)
      this.subtitleText.position.set(0, this.baseHeight + this.pedestalHeight * 0.15, this.baseWidth * 0.3)
      inscriptionGroup.add(this.subtitleText)
    }
    
    this.inscription = inscriptionGroup
    this.add(inscriptionGroup)
  }

  setupInteraction() {
    this.userData.interactive = true
    this.userData.type = 'monument'
    this.userData.title = this.title
    this.userData.description = this.description
    this.userData.onClick = () => this.showDetails()
    this.userData.onHover = (hovering) => this.setHovered(hovering)
  }

  setHovered(hovered) {
    this.isHovered = hovered
    
    // Intensify crystal glow on hover
    if (this.crystal) {
      this.crystal.material.emissiveIntensity = hovered ? 0.6 : 0.3
    }
    
    // Increase particle visibility
    if (this.particles) {
      this.particles.material.opacity = hovered ? 1 : 0.8
    }
  }

  showDetails() {
    this.dispatchEvent({
      type: 'showDetails',
      monument: this,
      title: this.title,
      description: this.description
    })
  }

  update(deltaTime, camera) {
    this.animationTime += deltaTime
    
    // Rotate and float the crystal
    if (this.crystalGroup) {
      const floatOffset = this.crystalGroup.userData.floatOffset || 0
      this.crystalGroup.rotation.y += deltaTime * 0.5
      this.crystalGroup.rotation.x = Math.sin(this.animationTime * 0.5 + floatOffset) * 0.1
      
      // Floating motion
      const baseY = this.baseHeight + this.pedestalHeight + this.crystalSize + 0.5
      this.crystalGroup.position.y = baseY + Math.sin(this.animationTime + floatOffset) * 0.15
    }
    
    // Animate particles
    if (this.particles && this.particleBasePositions) {
      const positions = this.particles.geometry.attributes.position.array
      
      for (let i = 0; i < positions.length / 3; i++) {
        const baseX = this.particleBasePositions[i * 3]
        const baseY = this.particleBasePositions[i * 3 + 1]
        const baseZ = this.particleBasePositions[i * 3 + 2]
        
        // Orbiting motion
        const angle = this.animationTime * 0.3 + i * 0.5
        const orbitRadius = 0.1
        
        positions[i * 3] = baseX + Math.cos(angle) * orbitRadius
        positions[i * 3 + 1] = baseY + Math.sin(this.animationTime + i) * 0.1
        positions[i * 3 + 2] = baseZ + Math.sin(angle) * orbitRadius
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true
      
      // Match crystal position
      this.particles.position.y = this.crystalGroup.position.y
    }
    
    // Update text
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

export default Monument
