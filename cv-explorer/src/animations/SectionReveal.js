import anime from 'animejs'
import * as THREE from 'three'

/**
 * SectionReveal - Animations when approaching different CV sections
 * Coordinates 3D object animations when player enters a zone
 */
export class SectionReveal {
  constructor(sceneManager, camera) {
    this.scene = sceneManager
    this.camera = camera
    this.revealedSections = new Set()
    this.activeAnimations = new Map()
    this.revealDistance = 30 // Distance at which sections start revealing
    this.fullRevealDistance = 15 // Distance at which sections are fully revealed
    
    // Section positions for proximity checking
    this.sectionPositions = new Map()
  }

  /**
   * Register a section for proximity-based reveal
   */
  registerSection(sectionId, position, objects) {
    this.sectionPositions.set(sectionId, {
      position: position.clone(),
      objects: objects,
      revealed: false
    })
    
    // Initially hide objects
    objects.forEach(obj => {
      this.hideObject(obj)
    })
  }

  /**
   * Hide object based on its type
   */
  hideObject(obj) {
    const type = obj.userData?.type || 'default'
    
    switch (type) {
      case 'monument':
        // Monuments start below ground
        obj.userData.originalY = obj.position.y
        obj.position.y -= 5
        obj.userData.hidden = true
        break
        
      case 'terminal':
        // Terminals start off to the side
        obj.userData.originalX = obj.position.x
        obj.userData.originalZ = obj.position.z
        const offset = obj.position.x > 0 ? 10 : -10
        obj.position.x += offset
        obj.userData.hidden = true
        break
        
      case 'orb':
      case 'infoOrb':
        // Orbs start invisible and small
        obj.userData.originalScale = obj.scale.clone()
        obj.scale.set(0, 0, 0)
        if (obj.material) obj.material.opacity = 0
        obj.userData.hidden = true
        break
        
      case 'waypoint':
        // Waypoints start with no beam
        obj.userData.originalScale = obj.scale.clone()
        obj.scale.set(0.3, 0, 0.3)
        obj.userData.hidden = true
        break
        
      default:
        // Generic: fade out
        obj.userData.originalOpacity = obj.material?.opacity ?? 1
        if (obj.material) obj.material.opacity = 0
        obj.userData.hidden = true
    }
  }

  /**
   * Update proximity checks - call every frame
   */
  update(deltaTime) {
    const cam = this.camera?.getCamera?.()
    if (!cam) return
    
    const cameraPos = cam.position
    
    this.sectionPositions.forEach((section, sectionId) => {
      if (section.revealed) return
      
      const distance = cameraPos.distanceTo(section.position)
      
      if (distance < this.revealDistance) {
        section.revealed = true
        this.revealSection(sectionId, section.objects)
      }
    })
  }

  /**
   * Reveal a section with coordinated animations
   */
  revealSection(sectionId, objects) {
    if (this.revealedSections.has(sectionId)) return
    this.revealedSections.add(sectionId)
    
    console.log(`Revealing section: ${sectionId}`)
    
    // Group objects by type
    const monuments = []
    const terminals = []
    const orbs = []
    const waypoints = []
    const others = []
    
    objects.forEach(obj => {
      const type = obj.userData?.type || 'default'
      switch (type) {
        case 'monument': monuments.push(obj); break
        case 'terminal': terminals.push(obj); break
        case 'orb':
        case 'infoOrb': orbs.push(obj); break
        case 'waypoint': waypoints.push(obj); break
        default: others.push(obj)
      }
    })
    
    // Create staggered reveal timeline
    const timeline = anime.timeline({
      easing: 'easeOutQuad'
    })
    
    // 1. Monuments rise from ground
    if (monuments.length > 0) {
      this.animateMonuments(monuments, timeline)
    }
    
    // 2. Terminals slide in from sides
    if (terminals.length > 0) {
      this.animateTerminals(terminals, timeline, monuments.length > 0 ? 300 : 0)
    }
    
    // 3. Orbs fade in with scale bounce
    if (orbs.length > 0) {
      this.animateOrbs(orbs, timeline)
    }
    
    // 4. Waypoints grow
    if (waypoints.length > 0) {
      this.animateWaypoints(waypoints, timeline)
    }
    
    // 5. Others fade in
    if (others.length > 0) {
      this.animateGeneric(others, timeline)
    }
    
    // 6. Intensify particles
    this.intensifyParticles(objects, timeline)
    
    this.activeAnimations.set(sectionId, timeline)
  }

  /**
   * Monuments rise dramatically from the ground
   */
  animateMonuments(monuments, timeline) {
    monuments.forEach((monument, index) => {
      const targetY = monument.userData.originalY ?? monument.position.y + 5
      
      // Create proxy object for animation
      const proxy = { y: monument.position.y }
      
      timeline.add({
        targets: proxy,
        y: targetY,
        duration: 1200,
        delay: index * 200,
        easing: 'easeOutElastic(1, 0.5)',
        update: () => {
          monument.position.y = proxy.y
        },
        begin: () => {
          // Add rising dust effect
          this.createDustEffect(monument.position.clone())
        },
        complete: () => {
          monument.userData.hidden = false
        }
      }, index === 0 ? 0 : '-=1000')
    })
  }

  /**
   * Terminals slide in from the sides
   */
  animateTerminals(terminals, timeline, offset = 0) {
    terminals.forEach((terminal, index) => {
      const targetX = terminal.userData.originalX ?? terminal.position.x
      const targetZ = terminal.userData.originalZ ?? terminal.position.z
      
      const proxy = { 
        x: terminal.position.x, 
        z: terminal.position.z 
      }
      
      timeline.add({
        targets: proxy,
        x: targetX,
        z: targetZ,
        duration: 800,
        delay: index * 150,
        easing: 'easeOutCubic',
        update: () => {
          terminal.position.x = proxy.x
          terminal.position.z = proxy.z
        },
        complete: () => {
          terminal.userData.hidden = false
        }
      }, offset)
    })
  }

  /**
   * Orbs fade in with scale bounce
   */
  animateOrbs(orbs, timeline) {
    orbs.forEach((orb, index) => {
      const originalScale = orb.userData.originalScale || new THREE.Vector3(1, 1, 1)
      
      // Scale animation
      const scaleProxy = { x: 0, y: 0, z: 0 }
      
      timeline.add({
        targets: scaleProxy,
        x: originalScale.x,
        y: originalScale.y,
        z: originalScale.z,
        duration: 600,
        delay: index * 100,
        easing: 'easeOutBack',
        update: () => {
          orb.scale.set(scaleProxy.x, scaleProxy.y, scaleProxy.z)
        }
      }, '-=400')
      
      // Opacity animation (if material exists)
      if (orb.material) {
        const opacityProxy = { opacity: 0 }
        
        timeline.add({
          targets: opacityProxy,
          opacity: orb.userData.originalOpacity ?? 1,
          duration: 400,
          easing: 'easeOutQuad',
          update: () => {
            if (orb.material) {
              orb.material.opacity = opacityProxy.opacity
            }
          },
          complete: () => {
            orb.userData.hidden = false
          }
        }, '-=600')
      }
    })
  }

  /**
   * Waypoints grow their light beams
   */
  animateWaypoints(waypoints, timeline) {
    waypoints.forEach((waypoint, index) => {
      const originalScale = waypoint.userData.originalScale || new THREE.Vector3(1, 1, 1)
      
      const proxy = { 
        x: waypoint.scale.x, 
        y: waypoint.scale.y, 
        z: waypoint.scale.z 
      }
      
      timeline.add({
        targets: proxy,
        x: originalScale.x,
        y: originalScale.y,
        z: originalScale.z,
        duration: 1000,
        delay: index * 150,
        easing: 'easeOutElastic(1, 0.6)',
        update: () => {
          waypoint.scale.set(proxy.x, proxy.y, proxy.z)
        },
        complete: () => {
          waypoint.userData.hidden = false
        }
      }, '-=800')
    })
  }

  /**
   * Generic fade-in for other objects
   */
  animateGeneric(objects, timeline) {
    objects.forEach((obj, index) => {
      if (!obj.material) return
      
      const proxy = { opacity: 0 }
      const targetOpacity = obj.userData.originalOpacity ?? 1
      
      timeline.add({
        targets: proxy,
        opacity: targetOpacity,
        duration: 500,
        delay: index * 50,
        easing: 'easeOutQuad',
        update: () => {
          obj.material.opacity = proxy.opacity
        },
        complete: () => {
          obj.userData.hidden = false
        }
      }, '-=400')
    })
  }

  /**
   * Intensify particle effects when section reveals
   */
  intensifyParticles(objects, timeline) {
    objects.forEach(obj => {
      // Find particle systems within the object
      obj.traverse?.(child => {
        if (child.type === 'Points' && child.material) {
          const originalSize = child.material.size || 0.1
          const proxy = { size: originalSize * 0.5 }
          
          timeline.add({
            targets: proxy,
            size: [originalSize * 2, originalSize],
            duration: 800,
            easing: 'easeOutQuad',
            update: () => {
              child.material.size = proxy.size
            }
          }, '-=600')
        }
      })
    })
  }

  /**
   * Create dust/particle effect for rising monuments
   */
  createDustEffect(position) {
    if (!this.scene?.scene) return
    
    const particleCount = 20
    const geometry = new THREE.BufferGeometry()
    const positions = new Float32Array(particleCount * 3)
    const velocities = []
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const radius = Math.random() * 2
      
      positions[i * 3] = position.x + Math.cos(angle) * radius
      positions[i * 3 + 1] = position.y
      positions[i * 3 + 2] = position.z + Math.sin(angle) * radius
      
      velocities.push({
        x: (Math.random() - 0.5) * 0.1,
        y: Math.random() * 0.15,
        z: (Math.random() - 0.5) * 0.1
      })
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    
    const material = new THREE.PointsMaterial({
      color: 0x886644,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    
    const particles = new THREE.Points(geometry, material)
    this.scene.scene.add(particles)
    
    // Animate particles
    const startTime = performance.now()
    const duration = 1500
    
    const animateDust = () => {
      const elapsed = performance.now() - startTime
      const progress = elapsed / duration
      
      if (progress >= 1) {
        this.scene.scene.remove(particles)
        geometry.dispose()
        material.dispose()
        return
      }
      
      const posArray = particles.geometry.attributes.position.array
      
      for (let i = 0; i < particleCount; i++) {
        posArray[i * 3] += velocities[i].x
        posArray[i * 3 + 1] += velocities[i].y
        posArray[i * 3 + 2] += velocities[i].z
        
        // Slow down
        velocities[i].y *= 0.98
      }
      
      particles.geometry.attributes.position.needsUpdate = true
      material.opacity = 0.6 * (1 - progress)
      
      requestAnimationFrame(animateDust)
    }
    
    animateDust()
  }

  /**
   * Force reveal a specific section immediately
   */
  forceReveal(sectionId) {
    const section = this.sectionPositions.get(sectionId)
    if (section && !section.revealed) {
      section.revealed = true
      this.revealSection(sectionId, section.objects)
    }
  }

  /**
   * Reveal all sections immediately (for skip functionality)
   */
  revealAll() {
    this.sectionPositions.forEach((section, sectionId) => {
      if (!section.revealed) {
        // Skip animation, just set final positions
        section.objects.forEach(obj => {
          if (obj.userData.originalY !== undefined) {
            obj.position.y = obj.userData.originalY
          }
          if (obj.userData.originalX !== undefined) {
            obj.position.x = obj.userData.originalX
          }
          if (obj.userData.originalZ !== undefined) {
            obj.position.z = obj.userData.originalZ
          }
          if (obj.userData.originalScale) {
            obj.scale.copy(obj.userData.originalScale)
          }
          if (obj.userData.originalOpacity !== undefined && obj.material) {
            obj.material.opacity = obj.userData.originalOpacity
          }
          obj.userData.hidden = false
        })
        section.revealed = true
        this.revealedSections.add(sectionId)
      }
    })
    
    // Stop all active animations
    this.activeAnimations.forEach(timeline => timeline.pause())
    this.activeAnimations.clear()
  }

  /**
   * Reset all sections to hidden state
   */
  reset() {
    this.revealedSections.clear()
    this.activeAnimations.forEach(timeline => timeline.pause())
    this.activeAnimations.clear()
    
    this.sectionPositions.forEach((section) => {
      section.revealed = false
      section.objects.forEach(obj => this.hideObject(obj))
    })
  }

  dispose() {
    this.activeAnimations.forEach(timeline => timeline.pause())
    this.activeAnimations.clear()
    this.sectionPositions.clear()
    this.revealedSections.clear()
  }
}

export default SectionReveal
