import * as THREE from 'three';

/**
 * Fireflies — a swarm of additive-blended glowing points that drift around
 * the path to create a "magical forest" feel.
 *
 * Implemented as a single THREE.Points object with a custom shader for
 * soft circular sprites + per-particle twinkle. Cheap: one draw call.
 */
export class Fireflies {
  constructor(options = {}) {
    this.group = new THREE.Group();
    this.count = options.count ?? 180;
    this.region = options.region ?? { x: 60, z: 80, yMin: 0.5, yMax: 4 };
    this.color = new THREE.Color(options.color ?? 0xffee88);
    this.speed = options.speed ?? 0.4;
    this.build();
  }

  build() {
    const positions = new Float32Array(this.count * 3);
    const phases = new Float32Array(this.count);
    const speeds = new Float32Array(this.count);
    const sizes = new Float32Array(this.count);

    for (let i = 0; i < this.count; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * this.region.x;
      positions[i * 3 + 1] = this.region.yMin + Math.random() * (this.region.yMax - this.region.yMin);
      positions[i * 3 + 2] = -Math.random() * this.region.z; // along the path (north)
      phases[i] = Math.random() * Math.PI * 2;
      speeds[i] = 0.3 + Math.random() * 0.7;
      sizes[i] = 0.15 + Math.random() * 0.25;
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
    geom.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geom.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: this.color }
      },
      vertexShader: `
        attribute float aPhase;
        attribute float aSpeed;
        attribute float aSize;
        uniform float uTime;
        varying float vTwinkle;
        void main() {
          vec3 p = position;
          // Drift: slow sine in x, sine in y, sine in z
          p.x += sin(uTime * aSpeed * 0.5 + aPhase) * 1.5;
          p.y += sin(uTime * aSpeed * 0.7 + aPhase * 1.3) * 0.6;
          p.z += cos(uTime * aSpeed * 0.4 + aPhase * 0.7) * 1.2;
          vTwinkle = 0.4 + 0.6 * abs(sin(uTime * 2.0 + aPhase * 3.0));
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          gl_PointSize = aSize * (220.0 / -mv.z) * vTwinkle;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying float vTwinkle;
        void main() {
          float d = length(gl_PointCoord - vec2(0.5));
          if (d > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.0, 0.5, d)) * vTwinkle;
          gl_FragColor = vec4(uColor, alpha * 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.points = new THREE.Points(geom, mat);
    this.points.name = 'fireflies';
    this.points.frustumCulled = false; // particles drift; bounds are tricky
    this.group.add(this.points);
  }

  update(elapsed) {
    this.points.material.uniforms.uTime.value = elapsed;
  }

  dispose() {
    this.points.geometry.dispose();
    this.points.material.dispose();
    this.group.clear();
  }
}

export default Fireflies;
