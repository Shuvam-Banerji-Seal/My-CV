import * as THREE from 'three'
import { FloatingText } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * Waypoint - Navigation marker with pillar of light effect
 */
export class Waypoint extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.label = options.label || 'Waypoint'
    this.sectionId = options.sectionId || 'default'
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Visual settings
    this.beamRadius = options.beamRadius || 0.3
    this.beamHeight = options.beamHeight || 15
    this.baseRadius = options.baseRadius || 0.8
    
    // Colors
    this.beamColor = options.beamColor || new THREE.Color(0x44ffaa)
    this.baseColor = options.baseColor || 0x2a4a4a
    
    // State
    this.isActive = true
    this.isHovered = false
    this.animationTime = Math.random() * Math.PI * 2
    
    // Components
    this.base = null
    this.beam = null
    this.labelText = null
    this.particles = null
    this.beacon = null
    
    this.build()
    this.setupInteraction()
  }

  build() {
    this.createBase()
    this.createBeam()
    this.createBeacon()
    this.createParticles()
    this.createLabel()
  }

  createBase() {
    // Ground marker base
    const baseGroup = new THREE.Group()
    
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: this.baseColor,
      metalness: 0.6,
      roughness: 0.3,
      emissive: this.beamColor,
      emissiveIntensity: 0.1
    })
    
    // Circular platform
    const platformGeom = new THREE.CylinderGeometry(
      this.baseRadius,
      this.baseRadius * 1.2,
      0.1,
      16
    )
    const platform = new THREE.Mesh(platformGeom, baseMaterial)
    platform.position.y = 0.05
    platform.receiveShadow = true
    baseGroup.add(platform)
    
    // Inner ring
    const ringGeom = new THREE.TorusGeometry(this.baseRadius * 0.6, 0.05, 8, 32)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: this.beamColor,
      transparent: true,
      opacity: 0.8
    })
    const ring = new THREE.Mesh(ringGeom, ringMaterial)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.12
    baseGroup.add(ring)
    this.baseRing = ring
    
    // Ground glow
    const glowGeom = new THREE.CircleGeometry(this.baseRadius * 1.5, 32)
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.beamColor,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const groundGlow = new THREE.Mesh(glowGeom, glowMaterial)
    groundGlow.rotation.x = -Math.PI / 2
    groundGlow.position.y = 0.02
    baseGroup.add(groundGlow)
    this.groundGlow = groundGlow
    
    this.base = baseGroup
    this.add(baseGroup)
  }

  createBeam() {
    // Light pillar using cylinder with gradient
    const beamGeom = new THREE.CylinderGeometry(
      this.beamRadius * 0.1,
      this.beamRadius,
      this.beamHeight,
      16,
      1,
      true
    )
    
    const beamMaterial = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: this.beamColor },
        time: { value: 0 },
        opacity: { value: 0.4 }
      },
      vertexShader: `
        varying vec2 vUv;
        varying float vY;
        void main() {
          vUv = uv;
          vY = position.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        uniform float opacity;
        varying vec2 vUv;
        varying float vY;
        
        void main() {
          // Fade toward top
          float heightFade = 1.0 - smoothstep(0.0, 1.0, (vY + 7.5) / 15.0);
          
          // Scrolling pattern
          float scroll = fract(vUv.y * 5.0 - time * 0.5);
          float pattern = smoothstep(0.0, 0.1, scroll) * smoothstep(0.3, 0.2, scroll);
          
          // Combine
          float alpha = heightFade * (0.3 + pattern * 0.4) * opacity;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.beam = new THREE.Mesh(beamGeom, beamMaterial)
    this.beam.position.y = this.beamHeight / 2 + 0.1
    this.add(this.beam)
  }

  createBeacon() {
    // Floating beacon at top
    const beaconGroup = new THREE.Group()
    
    const beaconGeom = new THREE.OctahedronGeometry(0.3, 0)
    const beaconMaterial = new THREE.MeshPhysicalMaterial({
      color: this.beamColor,
      emissive: this.beamColor,
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.9
    })
    
    const beacon = new THREE.Mesh(beaconGeom, beaconMaterial)
    beaconGroup.add(beacon)
    
    // Beacon light
    const beaconLight = new THREE.PointLight(this.beamColor, 2, 10)
    beaconGroup.add(beaconLight)
    
    beaconGroup.position.y = this.beamHeight + 0.5
    this.beacon = beaconGroup
    this.beaconMesh = beacon
    this.add(beaconGroup)
  }

  createParticles() {
    // Rising particles along the beam
    const particleCount = 30
    const particleGeom = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * this.beamRadius
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * this.beamHeight
      positions[i * 3 + 2] = Math.sin(angle) * radius
      
      velocities[i] = 1 + Math.random() * 2
    }
    
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      color: this.beamColor,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.particles = new THREE.Points(particleGeom, particleMaterial)
    this.particleVelocities = velocities
    this.add(this.particles)
  }

  createLabel() {
    // Waypoint label
    this.labelText = new FloatingText(this.label, {
      style: 'label',
      textRenderer: this.textRenderer,
      glowColor: this.beamColor,
      glowIntensity: 0.4,
      animate: false,
      billboard: true,
      fontSize: 16
    })
    this.labelText.position.y = 2
    this.add(this.labelText)
  }

  setupInteraction() {
    this.userData.interactive = true
    this.userData.type = 'waypoint'
    this.userData.sectionId = this.sectionId
    this.userData.label = this.label
    this.userData.onClick = () => this.activate()
    this.userData.onHover = (hovering) => this.setHovered(hovering)
  }

  setHovered(hovered) {
    this.isHovered = hovered
    
    // Intensify effects
    if (this.beam) {
      this.beam.material.uniforms.opacity.value = hovered ? 0.6 : 0.4
    }
    if (this.groundGlow) {
      this.groundGlow.material.opacity = hovered ? 0.4 : 0.2
    }
    if (this.beaconMesh) {
      this.beaconMesh.material.emissiveIntensity = hovered ? 0.8 : 0.5
    }
  }

  activate() {
    if (!this.isActive) return
    
    this.dispatchEvent({
      type: 'navigate',
      waypoint: this,
      position: this.position.clone(),
      sectionId: this.sectionId
    })
  }

  update(deltaTime, camera) {
    this.animationTime += deltaTime
    
    // Update beam shader
    if (this.beam) {
      this.beam.material.uniforms.time.value = this.animationTime
    }
    
    // Rotate base ring
    if (this.baseRing) {
      this.baseRing.rotation.z += deltaTime * 0.5
    }
    
    // Rotate and float beacon
    if (this.beacon) {
      this.beacon.rotation.y += deltaTime * 0.8
      this.beacon.position.y = this.beamHeight + 0.5 + Math.sin(this.animationTime) * 0.2
    }
    
    // Animate particles
    if (this.particles && this.particleVelocities) {
      const positions = this.particles.geometry.attributes.position.array
      
      for (let i = 0; i < positions.length / 3; i++) {
        positions[i * 3 + 1] += this.particleVelocities[i] * deltaTime
        
        // Reset when reaching top
        if (positions[i * 3 + 1] > this.beamHeight) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * this.beamRadius
          positions[i * 3] = Math.cos(angle) * radius
          positions[i * 3 + 1] = 0
          positions[i * 3 + 2] = Math.sin(angle) * radius
        }
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true
    }
    
    // Update label to face camera
    if (this.labelText && camera) {
      this.labelText.quaternion.copy(camera.quaternion)
    }
  }

  setActive(active) {
    this.isActive = active
    
    if (this.beam) {
      this.beam.material.uniforms.opacity.value = active ? 0.4 : 0.15
    }
    if (this.beacon) {
      this.beacon.visible = active
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

export default Waypoint
