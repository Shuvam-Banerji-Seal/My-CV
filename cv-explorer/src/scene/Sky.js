import * as THREE from 'three';

class Sky {
  constructor() {
    this.group = new THREE.Group();
    this.stars = null;
    this.aurora = null;
  }

  init() {
    this.createSkyDome();
    this.createStars();
    this.createAurora();
    return this;
  }

  createSkyDome() {
    // Large sphere with gradient material
    const geometry = new THREE.SphereGeometry(300, 32, 32);
    
    // Custom shader for gradient sky
    const material = new THREE.ShaderMaterial({
      uniforms: {
        topColor: { value: new THREE.Color(0x0a0a20) },
        bottomColor: { value: new THREE.Color(0x050510) },
        horizonColor: { value: new THREE.Color(0x0f1525) },
        offset: { value: 30 },
        exponent: { value: 0.6 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform vec3 horizonColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        
        void main() {
          float h = normalize(vWorldPosition + offset).y;
          float t = max(pow(max(h, 0.0), exponent), 0.0);
          
          // Blend from bottom through horizon to top
          vec3 color;
          if (h < 0.3) {
            color = mix(bottomColor, horizonColor, h / 0.3);
          } else {
            color = mix(horizonColor, topColor, (h - 0.3) / 0.7);
          }
          
          gl_FragColor = vec4(color, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });
    
    const skyDome = new THREE.Mesh(geometry, material);
    skyDome.name = 'skyDome';
    this.group.add(skyDome);
  }

  createStars() {
    const starCount = 3000;
    const geometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);
    
    for (let i = 0; i < starCount; i++) {
      // Distribute stars on upper hemisphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 0.5; // Only upper half
      const radius = 250 + Math.random() * 30;
      
      const idx = i * 3;
      positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
      positions[idx + 1] = radius * Math.cos(phi) + 20; // Offset upward
      positions[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);
      
      // Vary star colors (white to slight blue/yellow)
      const colorVariation = Math.random();
      if (colorVariation < 0.7) {
        // White stars
        colors[idx] = 0.9 + Math.random() * 0.1;
        colors[idx + 1] = 0.9 + Math.random() * 0.1;
        colors[idx + 2] = 1.0;
      } else if (colorVariation < 0.85) {
        // Blue stars
        colors[idx] = 0.7;
        colors[idx + 1] = 0.8;
        colors[idx + 2] = 1.0;
      } else {
        // Warm stars
        colors[idx] = 1.0;
        colors[idx + 1] = 0.9;
        colors[idx + 2] = 0.7;
      }
      
      sizes[i] = 0.5 + Math.random() * 1.5;
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Custom shader for twinkling stars
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vSize;
        uniform float time;
        
        void main() {
          vColor = color;
          vSize = size;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Twinkle effect
          float twinkle = sin(time * 2.0 + position.x * 0.1 + position.z * 0.1) * 0.3 + 0.7;
          gl_PointSize = size * twinkle * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          // Circular point with soft edges
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float alpha = 1.0 - smoothstep(0.2, 0.5, dist);
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    
    this.stars = new THREE.Points(geometry, material);
    this.stars.name = 'stars';
    this.group.add(this.stars);
  }

  createAurora() {
    // Subtle aurora effect using a curved plane
    const auroraGeometry = new THREE.PlaneGeometry(200, 40, 64, 8);
    
    const auroraMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 }
      },
      vertexShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          vUv = uv;
          
          vec3 pos = position;
          
          // Wavy distortion
          float wave = sin(pos.x * 0.05 + time * 0.5) * 5.0;
          wave += sin(pos.x * 0.02 + time * 0.3) * 8.0;
          pos.z += wave;
          
          vWave = wave * 0.1;
          
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec2 vUv;
        varying float vWave;
        
        void main() {
          // Aurora colors: green to blue to purple
          vec3 green = vec3(0.2, 0.8, 0.4);
          vec3 blue = vec3(0.2, 0.4, 0.8);
          vec3 purple = vec3(0.5, 0.2, 0.7);
          
          float t = vUv.x + sin(time * 0.2) * 0.2;
          vec3 color;
          if (t < 0.5) {
            color = mix(green, blue, t * 2.0);
          } else {
            color = mix(blue, purple, (t - 0.5) * 2.0);
          }
          
          // Fade at edges
          float alphaY = smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          float alphaX = smoothstep(0.0, 0.2, vUv.x) * smoothstep(1.0, 0.8, vUv.x);
          
          // Flickering
          float flicker = sin(time * 3.0 + vUv.x * 10.0) * 0.2 + 0.8;
          
          float alpha = alphaY * alphaX * flicker * 0.15;
          
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    
    this.aurora = new THREE.Mesh(auroraGeometry, auroraMaterial);
    this.aurora.position.set(0, 80, -100);
    this.aurora.rotation.x = -Math.PI / 6;
    this.aurora.name = 'aurora';
    this.group.add(this.aurora);
  }

  update(elapsed) {
    // Update star twinkle
    if (this.stars) {
      this.stars.material.uniforms.time.value = elapsed;
    }
    
    // Update aurora animation
    if (this.aurora) {
      this.aurora.material.uniforms.time.value = elapsed;
      // Gentle floating motion
      this.aurora.position.y = 80 + Math.sin(elapsed * 0.2) * 2;
    }
  }

  getGroup() {
    return this.group;
  }
}

export const sky = new Sky();
export default sky;
