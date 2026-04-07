import * as THREE from 'three';

class Terrain {
  constructor() {
    this.group = new THREE.Group();
    this.ground = null;
    this.grass = null;
    this.heightMap = null; // Cache height values
    this.collisionObjects = []; // Objects for collision detection
  }

  init() {
    this.createGround();
    this.createGrass();
    this.buildHeightCache();
    return this;
  }

  createGround() {
    // Terrain with reduced segments for performance
    const segments = 64; // Reduced from 128
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
      height += this.noise(x, y) * 2; // Reduced height variation
      height += this.noise(x * 2, y * 2) * 1;
      height += this.noise(x * 4, y * 4) * 0.5;
      
      // Keep center area flat for walking
      const distFromCenter = Math.sqrt(vertex.x * vertex.x + vertex.y * vertex.y);
      const flattenFactor = Math.min(1, distFromCenter / 40);
      height *= flattenFactor;
      
      positionAttr.setZ(i, height);
    }
    
    geometry.computeVertexNormals();
    
    // Dark earth material
    const material = new THREE.MeshLambertMaterial({ // Lambert is faster than Standard
      color: 0x1a2a1a
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
    const grassCount = 5000; // Reduced from 15000
    const grassGeometry = new THREE.BufferGeometry();
    
    const positions = new Float32Array(grassCount * 6);
    const colors = new Float32Array(grassCount * 6);
    
    const baseColor = new THREE.Color(0x1a3a1a);
    const tipColor = new THREE.Color(0x2a4a2a);
    
    for (let i = 0; i < grassCount; i++) {
      // Random position within terrain bounds
      const x = (Math.random() - 0.5) * 160;
      const z = (Math.random() - 0.5) * 160;
      
      // Get terrain height
      const terrainHeight = this.getTerrainHeight(x, z);
      
      // Grass blade height
      const bladeHeight = 0.15 + Math.random() * 0.25;
      
      // Base vertex
      const idx = i * 6;
      positions[idx] = x;
      positions[idx + 1] = terrainHeight;
      positions[idx + 2] = z;
      
      // Tip vertex (no tilt - static for performance)
      positions[idx + 3] = x;
      positions[idx + 4] = terrainHeight + bladeHeight;
      positions[idx + 5] = z;
      
      // Colors
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
      opacity: 0.5
    });
    
    this.grass = new THREE.LineSegments(grassGeometry, grassMaterial);
    this.grass.name = 'grass';
    this.grass.frustumCulled = true;
    this.group.add(this.grass);
  }

  // Build a height cache for faster lookups
  buildHeightCache() {
    const resolution = 100;
    const size = 200;
    this.heightMap = new Float32Array(resolution * resolution);
    this.heightMapResolution = resolution;
    this.heightMapSize = size;
    
    for (let i = 0; i < resolution; i++) {
      for (let j = 0; j < resolution; j++) {
        const x = (i / resolution - 0.5) * size;
        const z = (j / resolution - 0.5) * size;
        this.heightMap[i * resolution + j] = this.calculateHeight(x, z);
      }
    }
  }

  calculateHeight(x, z) {
    const nx = x * 0.02;
    const nz = z * 0.02;
    
    let height = 0;
    height += this.noise(nx, nz) * 2;
    height += this.noise(nx * 2, nz * 2) * 1;
    height += this.noise(nx * 4, nz * 4) * 0.5;
    
    const distFromCenter = Math.sqrt(x * x + z * z);
    const flattenFactor = Math.min(1, distFromCenter / 40);
    height *= flattenFactor;
    
    return height;
  }

  // Fast terrain height lookup using cached values
  getTerrainHeight(x, z) {
    if (!this.heightMap) {
      return this.calculateHeight(x, z);
    }
    
    // Convert world coords to heightmap coords
    const res = this.heightMapResolution;
    const size = this.heightMapSize;
    
    const i = Math.floor(((x / size) + 0.5) * res);
    const j = Math.floor(((z / size) + 0.5) * res);
    
    // Clamp to bounds
    const ci = Math.max(0, Math.min(res - 1, i));
    const cj = Math.max(0, Math.min(res - 1, j));
    
    return this.heightMap[ci * res + cj];
  }

  // Register collision objects (called by WorldBuilder)
  addCollisionObject(object, radius = 1) {
    this.collisionObjects.push({ object, radius });
  }

  // Check collision with world objects
  checkCollision(position, playerRadius = 0.5) {
    for (const { object, radius } of this.collisionObjects) {
      const dx = position.x - object.position.x;
      const dz = position.z - object.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      
      if (dist < (radius + playerRadius)) {
        // Return push-out vector
        const pushDist = (radius + playerRadius) - dist;
        const nx = dx / dist || 0;
        const nz = dz / dist || 0;
        return new THREE.Vector3(nx * pushDist, 0, nz * pushDist);
      }
    }
    return null;
  }

  // No per-frame grass animation for performance
  update(elapsed) {
    // Grass is now static - no animation for better performance
  }

  getGroup() {
    return this.group;
  }
}

export const terrain = new Terrain();
export default terrain;
