import * as THREE from 'three'
import { FloatingText } from './FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'

/**
 * Portal - Circular portal for section navigation with animated shader
 */
export class Portal extends THREE.Group {
  constructor(options = {}) {
    super()
    
    this.label = options.label || 'Portal'
    this.targetPosition = options.targetPosition || new THREE.Vector3(0, 0, 0)
    this.sectionId = options.sectionId || 'default'
    this.textRenderer = options.textRenderer || new TextRenderer()
    
    // Visual settings
    this.outerRadius = options.outerRadius || 2
    this.innerRadius = options.innerRadius || 1.6
    this.tubeRadius = options.tubeRadius || 0.15
    
    // Colors
    this.ringColor = options.ringColor || 0x4488ff
    this.portalColor = options.portalColor || new THREE.Color(0x0066ff)
    this.glowColor = options.glowColor || new THREE.Color(0x00aaff)
    
    // State
    this.isActive = true
    this.isHovered = false
    this.animationTime = Math.random() * Math.PI * 2
    
    // Components
    this.ring = null
    this.portalPlane = null
    this.labelText = null
    this.glowRing = null
    this.particles = null
    
    this.build()
    this.setupInteraction()
  }

  build() {
    this.createRing()
    this.createPortalPlane()
    this.createGlowEffect()
    this.createParticles()
    this.createLabel()
  }

  createRing() {
    // Torus ring frame
    const ringGeom = new THREE.TorusGeometry(
      this.outerRadius,
      this.tubeRadius,
      16,
      64
    )
    
    const ringMaterial = new THREE.MeshStandardMaterial({
      color: this.ringColor,
      metalness: 0.8,
      roughness: 0.2,
      emissive: this.glowColor,
      emissiveIntensity: 0.2
    })
    
    this.ring = new THREE.Mesh(ringGeom, ringMaterial)
    this.ring.rotation.x = Math.PI / 2
    this.ring.castShadow = true
    this.add(this.ring)
    
    // Inner ring accent
    const innerRingGeom = new THREE.TorusGeometry(
      this.innerRadius,
      this.tubeRadius * 0.5,
      12,
      48
    )
    const innerRing = new THREE.Mesh(innerRingGeom, ringMaterial.clone())
    innerRing.rotation.x = Math.PI / 2
    innerRing.material.emissiveIntensity = 0.4
    this.add(innerRing)
    this.innerRing = innerRing
  }

  createPortalPlane() {
    // Animated portal surface using custom shader
    const portalGeom = new THREE.CircleGeometry(this.innerRadius - 0.1, 64)
    
    // Custom shader for swirling portal effect
    const portalMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color1: { value: this.portalColor },
        color2: { value: this.glowColor },
        opacity: { value: 0.8 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform float opacity;
        varying vec2 vUv;
        
        // Simplex noise function
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m;
          m = m*m;
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
          m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        void main() {
          vec2 center = vUv - 0.5;
          float dist = length(center);
          float angle = atan(center.y, center.x);
          
          // Swirling pattern
          float swirl = snoise(vec2(angle * 3.0 + time * 0.5, dist * 5.0 - time));
          float noise = snoise(vec2(center.x * 4.0 + time * 0.3, center.y * 4.0 - time * 0.2));
          
          // Radial fade
          float fade = 1.0 - smoothstep(0.3, 0.5, dist);
          
          // Color mixing
          float mixFactor = swirl * 0.5 + 0.5 + noise * 0.2;
          vec3 color = mix(color1, color2, mixFactor);
          
          // Edge glow
          float edgeGlow = smoothstep(0.35, 0.5, dist) * (1.0 - smoothstep(0.5, 0.52, dist));
          color += color2 * edgeGlow * 2.0;
          
          // Center brightness
          float centerBright = 1.0 - smoothstep(0.0, 0.3, dist);
          color += vec3(0.3) * centerBright;
          
          gl_FragColor = vec4(color, opacity * fade);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    })
    
    this.portalPlane = new THREE.Mesh(portalGeom, portalMaterial)
    this.portalPlane.rotation.x = -Math.PI / 2
    this.portalPlane.position.y = 0.05
    this.add(this.portalPlane)
  }

  createGlowEffect() {
    // Outer glow ring
    const glowGeom = new THREE.RingGeometry(
      this.outerRadius - 0.1,
      this.outerRadius + 0.3,
      64
    )
    
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: this.glowColor,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    this.glowRing = new THREE.Mesh(glowGeom, glowMaterial)
    this.glowRing.rotation.x = -Math.PI / 2
    this.add(this.glowRing)
    
    // Point light inside portal
    const portalLight = new THREE.PointLight(this.glowColor, 1, 8)
    portalLight.position.y = 0.5
    this.add(portalLight)
    this.portalLight = portalLight
  }

  createParticles() {
    // Rising particles from portal
    const particleCount = 50
    const particleGeom = new THREE.BufferGeometry()
    
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      // Random position within portal circle
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * this.innerRadius * 0.8
      
      positions[i * 3] = Math.cos(angle) * radius
      positions[i * 3 + 1] = Math.random() * 2
      positions[i * 3 + 2] = Math.sin(angle) * radius
      
      // Upward velocity with some randomness
      velocities[i * 3] = (Math.random() - 0.5) * 0.2
      velocities[i * 3 + 1] = 0.5 + Math.random() * 0.5
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.2
    }
    
    particleGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const particleMaterial = new THREE.PointsMaterial({
      color: this.glowColor,
      size: 0.08,
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
    // Portal label above the ring
    this.labelText = new FloatingText(this.label, {
      style: 'title',
      textRenderer: this.textRenderer,
      glowColor: this.glowColor,
      glowIntensity: 0.5,
      animate: true,
      bobAmplitude: 0.05,
      billboard: true
    })
    this.labelText.position.y = this.outerRadius + 0.8
    this.add(this.labelText)
  }

  setupInteraction() {
    this.userData.interactive = true
    this.userData.type = 'portal'
    this.userData.sectionId = this.sectionId
    this.userData.targetPosition = this.targetPosition
    this.userData.onClick = () => this.activate()
    this.userData.onHover = (hovering) => this.setHovered(hovering)
  }

  setHovered(hovered) {
    this.isHovered = hovered
    
    // Intensify effects on hover
    if (this.ring) {
      this.ring.material.emissiveIntensity = hovered ? 0.5 : 0.2
    }
    if (this.innerRing) {
      this.innerRing.material.emissiveIntensity = hovered ? 0.7 : 0.4
    }
    if (this.glowRing) {
      this.glowRing.material.opacity = hovered ? 0.5 : 0.3
    }
    if (this.portalLight) {
      this.portalLight.intensity = hovered ? 2 : 1
    }
  }

  activate() {
    if (!this.isActive) return
    
    this.dispatchEvent({
      type: 'teleport',
      portal: this,
      targetPosition: this.targetPosition,
      sectionId: this.sectionId
    })
  }

  update(deltaTime, camera) {
    this.animationTime += deltaTime
    
    // Update portal shader
    if (this.portalPlane) {
      this.portalPlane.material.uniforms.time.value = this.animationTime
    }
    
    // Rotate rings slowly
    if (this.ring) {
      this.ring.rotation.z += deltaTime * 0.2
    }
    if (this.innerRing) {
      this.innerRing.rotation.z -= deltaTime * 0.3
    }
    
    // Pulse glow
    if (this.glowRing) {
      const pulse = 0.3 + Math.sin(this.animationTime * 2) * 0.1
      this.glowRing.material.opacity = this.isHovered ? pulse + 0.2 : pulse
    }
    
    // Animate particles
    if (this.particles && this.particleVelocities) {
      const positions = this.particles.geometry.attributes.position.array
      
      for (let i = 0; i < positions.length / 3; i++) {
        // Move particle upward
        positions[i * 3 + 1] += this.particleVelocities[i * 3 + 1] * deltaTime
        
        // Reset particle when it goes too high
        if (positions[i * 3 + 1] > 3) {
          const angle = Math.random() * Math.PI * 2
          const radius = Math.random() * this.innerRadius * 0.8
          positions[i * 3] = Math.cos(angle) * radius
          positions[i * 3 + 1] = 0
          positions[i * 3 + 2] = Math.sin(angle) * radius
        }
        
        // Add some swirl
        const swirl = deltaTime * 0.5
        const x = positions[i * 3]
        const z = positions[i * 3 + 2]
        positions[i * 3] = x * Math.cos(swirl) - z * Math.sin(swirl)
        positions[i * 3 + 2] = x * Math.sin(swirl) + z * Math.cos(swirl)
      }
      
      this.particles.geometry.attributes.position.needsUpdate = true
    }
    
    // Update label
    if (this.labelText && this.labelText.update) {
      this.labelText.update(deltaTime, camera)
    }
  }

  setActive(active) {
    this.isActive = active
    
    if (this.portalPlane) {
      this.portalPlane.material.uniforms.opacity.value = active ? 0.8 : 0.3
    }
    if (this.ring) {
      this.ring.material.emissiveIntensity = active ? 0.2 : 0.05
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

export default Portal
