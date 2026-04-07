import * as THREE from 'three';

class Terrain {
  constructor() {
    this.group = new THREE.Group();
    this.ground = null;
    this.grass = null;
  }

  init() {
    this.createGround();
    this.createGrass();
    return this;
  }

  createGround() {
    // Large terrain plane with displacement
    const segments = 128;
    const geometry = new THREE.PlaneGeometry(200, 200, segments, segments);
    
    // Apply height displacement using simplex-like noise
    const positionAttr = geometry.attributes.position;
    const vertex = new THREE.Vector3();
    
    for (let i = 0; i < positionAttr.count; i++) {
      vertex.fromBufferAttribute(positionAttr, i);
      
      // Multi-octave noise for natural terrain
      const x = vertex.x * 0.02;
      const y = vertex.y * 0.02;
      
      let height = 0;
      height += this.noise(x, y) * 3;
      height += this.noise(x * 2, y * 2) * 1.5;
      height += this.noise(x * 4, y * 4) * 0.75;
      
      // Keep center area relatively flat for walking
      const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
      const flattenFactor = Math.min(1, distFromCenter / 30);
      height *= flattenFactor;
      
      positionAttr.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    // Dark earth/grass material
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a2a1a,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: false
    });
    
    this.ground = new THREE.Mesh(geometry, material);
    this.ground.rotation.x = -Math.PI / 2;
    this.ground.receiveShadow = true;
    this.ground.name = 'terrain';
    
    this.group.add(this.ground);
  }

  // Simple pseudo-random noise function
  noise(x, y) {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }

  createGrass() {
    const grassCount = 15000;
    const grassGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(grassCount * 6); // 2 vertices per grass blade
    const colors = new Float32Array(grassCount * 6);
    
    const baseColor = new THREE.Color(0x1a3a1a);
    const tipColor = new THREE.Color(0x2a4a2a);
    
    for (let i = 0; i < grassCount; i++) {
      // Random position within terrain bounds
      const x = (Math.random() - 0.5) * 180;
      const z = (Math.random() - 0.5) * 180;
      
      // Get approximate terrain height at this position
      const terrainHeight = this.getTerrainHeight(x, z);
      
      // Grass blade height varies
      const bladeHeight = 0.2 + Math.random() * 0.4;
      
      // Slight random tilt
      const tiltX = (Math.random() - 0.5) * 0.1;
      const tiltZ = (Math.random() - 0.5) * 0.1;
      
      // Base vertex
      const idx = i * 6;
      positions[idx] = x;
      positions[idx + 1] = terrainHeight;
      positions[idx + 2] = z;
      
      // Tip vertex
      positions[idx + 3] = x + tiltX;
      positions[idx + 4] = terrainHeight + bladeHeight;
      positions[idx + 5] = z + tiltZ;
      
      // Colors (darker at base, slightly lighter at tip)
      colors[idx] = baseColor.r;
      colors[idx + 1] = baseColor.g;
      colors[idx + 2] = baseColor.b;
      colors[idx + 3] = tipColor.r;
      colors[idx + 4] = tipColor.g;
      colors[idx + 5] = tipColor.b;
    }
    
    grassGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    grassGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const grassMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.6
    });
    
    this.grass = new THREE.LineSegments(grassGeometry, grassMaterial);
    this.grass.name = 'grass';
    this.group.add(this.grass);
  }

  // Approximate terrain height at a given position
  getTerrainHeight(x, z) {
    const nx = x * 0.02;
    const nz = z * 0.02;
    
    let height = 0;
    height += this.noise(nx, nz) * 3;
    height += this.noise(nx * 2, nz * 2) * 1.5;
    height += this.noise(nx * 4, nz * 4) * 0.75;
    
    const distFromCenter = Math.sqrt(x * x + z * z);
    const flattenFactor = Math.min(1, distFromCenter / 30);
    height *= flattenFactor;
    
    return height;
  }

  // Animate grass (subtle wind effect)
  update(elapsed) {
    if (!this.grass) return;
    
    const positions = this.grass.geometry.attributes.position.array;
    const windStrength = 0.05;
    const windSpeed = 2;
    
    for (let i = 0; i < positions.length / 6; i++) {
      const idx = i * 6;
      const baseX = positions[idx];
      const baseZ = positions[idx + 2];
      
      // Animate tip position with wind
      const windOffset = Math.sin(elapsed * windSpeed + baseX * 0.5 + baseZ * 0.5) * windStrength;
      positions[idx + 3] = baseX + windOffset;
    }
    
    this.grass.geometry.attributes.position.needsUpdate = true;
  }

  getGroup() {
    return this.group;
  }
}

export const terrain = new Terrain();
export default terrain;
