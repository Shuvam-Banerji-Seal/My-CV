import * as THREE from 'three'
import { cvData } from '../data/cvData.js'
import { Terminal } from '../objects/Terminal.js'
import { Monument } from '../objects/Monument.js'
import { Portal } from '../objects/Portal.js'
import { InfoOrb, createOrbCluster } from '../objects/InfoOrb.js'
import { Waypoint } from '../objects/Waypoint.js'
import { FloatingText, createTitle } from '../objects/FloatingText.js'
import { TextRenderer } from '../utils/TextRenderer.js'
import { terrain } from '../scene/Terrain.js'

/**
 * WorldBuilder - Main world layout manager for CV exploration
 * 
 * Layout:
 *                    [Publications - Monuments]
 *                           |
 *    [Skills Orbs] ---- [CENTER: Welcome] ---- [Projects - Terminals]  
 *                           |
 *                    [Education Path]
 *                           |
 *                    [Ventures & Experience]
 */
export class WorldBuilder {
  constructor(scene) {
    this.scene = scene
    this.sections = new Map()
    this.interactables = []
    this.updateCallbacks = []
    
    // Shared text renderer
    this.textRenderer = new TextRenderer()
    
    // Zone positions (distance from center)
    this.zoneDistance = 40
    this.innerZoneDistance = 25
    
    // Zone groups
    this.welcomeZone = null
    this.publicationsZone = null
    this.projectsZone = null
    this.skillsZone = null
    this.educationZone = null
    this.venturesZone = null
    this.navigationPortals = null
  }

  /**
   * Build the entire world layout
   */
  build() {
    this.createWelcomeArea()
    this.createPublicationZone()
    this.createProjectsZone()
    this.createSkillsZone()
    this.createEducationPath()
    this.createVenturesZone()
    this.createNavigationPortals()
    this.createZoneLighting()
    
    return this
  }

  /**
   * Center welcome area with name and title
   */
  createWelcomeArea() {
    const group = new THREE.Group()
    group.name = 'welcomeZone'
    
    const { header } = cvData
    
    // Main name title
    const nameText = createTitle(header.name, {
      textRenderer: this.textRenderer,
      glowColor: new THREE.Color(0x44aaff),
      glowIntensity: 0.6,
      animate: true,
      bobAmplitude: 0.08,
      billboard: true,
      fontSize: 32
    })
    nameText.position.set(0, 4, 0)
    group.add(nameText)
    this.updateCallbacks.push((dt, cam) => nameText.update(dt, cam))
    
    // Title/subtitle
    const titleText = new FloatingText(header.title, {
      style: 'body',
      textRenderer: this.textRenderer,
      glowColor: new THREE.Color(0x66ccff),
      glowIntensity: 0.3,
      animate: true,
      bobAmplitude: 0.04,
      billboard: true,
      maxWidth: 500,
      fontSize: 16
    })
    titleText.position.set(0, 3, 0)
    group.add(titleText)
    this.updateCallbacks.push((dt, cam) => titleText.update(dt, cam))
    
    // Institution
    const instText = new FloatingText(header.institution, {
      style: 'label',
      textRenderer: this.textRenderer,
      glow: false,
      animate: true,
      bobAmplitude: 0.03,
      billboard: true,
      fontSize: 14
    })
    instText.position.set(0, 2.3, 0)
    group.add(instText)
    this.updateCallbacks.push((dt, cam) => instText.update(dt, cam))
    
    // Central platform marker
    const platformGeom = new THREE.CylinderGeometry(5, 6, 0.3, 32)
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x1a2a3a,
      metalness: 0.7,
      roughness: 0.3,
      emissive: 0x112233,
      emissiveIntensity: 0.2
    })
    const platform = new THREE.Mesh(platformGeom, platformMat)
    platform.position.y = -0.15
    platform.receiveShadow = true
    group.add(platform)
    
    // Glowing ring around platform
    const ringGeom = new THREE.TorusGeometry(5.5, 0.1, 8, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x44aaff,
      transparent: true,
      opacity: 0.6
    })
    const ring = new THREE.Mesh(ringGeom, ringMat)
    ring.rotation.x = -Math.PI / 2
    ring.position.y = 0.1
    group.add(ring)
    
    this.welcomeZone = group
    this.sections.set('welcome', group)
    this.scene.add(group)
  }

  /**
   * North zone: Monuments for publications
   */
  createPublicationZone() {
    const group = new THREE.Group()
    group.name = 'publicationsZone'
    group.position.set(0, 0, -this.zoneDistance)
    
    const { publications } = cvData
    
    // Zone waypoint
    const waypoint = new Waypoint({
      label: 'Publications',
      sectionId: 'publications',
      textRenderer: this.textRenderer,
      beamColor: new THREE.Color(0xffd700)
    })
    waypoint.position.set(0, this.getTerrainHeight(0, -this.zoneDistance), 0)
    group.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    // Create monuments for each publication
    publications.forEach((pub, index) => {
      const angle = (index / publications.length) * Math.PI - Math.PI / 2
      const radius = 12
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      const monument = new Monument({
        title: pub.title,
        subtitle: pub.venue,
        description: pub.description,
        year: pub.year,
        textRenderer: this.textRenderer,
        crystalColor: this.getPublicationColor(pub)
      })
      
      monument.position.set(x, this.getTerrainHeight(x, z - this.zoneDistance), z)
      group.add(monument)
      this.interactables.push(monument)
      this.updateCallbacks.push((dt, cam) => monument.update(dt, cam))
    })
    
    this.publicationsZone = group
    this.sections.set('publications', group)
    this.scene.add(group)
  }

  /**
   * East zone: Terminals for projects
   */
  createProjectsZone() {
    const group = new THREE.Group()
    group.name = 'projectsZone'
    group.position.set(this.zoneDistance, 0, 0)
    
    const { projects } = cvData
    
    // Zone waypoint
    const waypoint = new Waypoint({
      label: 'Projects',
      sectionId: 'projects',
      textRenderer: this.textRenderer,
      beamColor: new THREE.Color(0x00ccff)
    })
    waypoint.position.set(0, this.getTerrainHeight(this.zoneDistance, 0), 0)
    group.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    // Create terminals for main projects (limit to avoid overcrowding)
    const mainProjects = projects.filter(p => !p.projects).slice(0, 6)
    
    mainProjects.forEach((proj, index) => {
      const angle = (index / mainProjects.length) * Math.PI - Math.PI / 2
      const radius = 10
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      const terminal = new Terminal({
        title: proj.title,
        content: proj.description,
        details: proj.technologies || [],
        textRenderer: this.textRenderer,
        glowColor: new THREE.Color(0x00ccff)
      })
      
      // Face toward center
      terminal.position.set(x, this.getTerrainHeight(x + this.zoneDistance, z), z)
      terminal.lookAt(new THREE.Vector3(0, terminal.position.y, 0))
      
      group.add(terminal)
      this.interactables.push(terminal)
      this.updateCallbacks.push((dt, cam) => terminal.update(dt, cam))
    })
    
    this.projectsZone = group
    this.sections.set('projects', group)
    this.scene.add(group)
  }

  /**
   * West zone: Orb clusters for skills
   */
  createSkillsZone() {
    const group = new THREE.Group()
    group.name = 'skillsZone'
    group.position.set(-this.zoneDistance, 0, 0)
    
    const { skills } = cvData
    
    // Zone waypoint
    const waypoint = new Waypoint({
      label: 'Skills',
      sectionId: 'skills',
      textRenderer: this.textRenderer,
      beamColor: new THREE.Color(0x44ffaa)
    })
    waypoint.position.set(0, this.getTerrainHeight(-this.zoneDistance, 0), 0)
    group.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    // Create orb clusters for different skill categories
    const skillCategories = [
      { name: 'Languages', skills: skills.programmingLanguages, color: 0xff6644, position: { x: -8, z: 0 } },
      { name: 'Python', skills: skills.pythonCore.slice(0, 6), color: 0x3776ab, position: { x: 0, z: -8 } },
      { name: 'NLP/ML', skills: skills.nlpMl.slice(0, 6), color: 0x44aa66, position: { x: 8, z: 0 } },
      { name: 'Web Dev', skills: skills.webDevStack.slice(0, 6), color: 0xf7df1e, position: { x: 0, z: 8 } },
      { name: 'Scientific', skills: skills.scientificSoftware, color: 0x9966ff, position: { x: -5, z: -5 } },
      { name: 'LLMs', skills: skills.llmsEmbeddings.slice(0, 5), color: 0xff44aa, position: { x: 5, z: -5 } }
    ]
    
    skillCategories.forEach(cat => {
      const cluster = createOrbCluster(cat.skills, {
        category: cat.name,
        orbColor: new THREE.Color(cat.color),
        textRenderer: this.textRenderer,
        clusterRadius: 3
      })
      
      const y = this.getTerrainHeight(cat.position.x - this.zoneDistance, cat.position.z)
      cluster.position.set(cat.position.x, y + 1, cat.position.z)
      
      // Category label
      const label = new FloatingText(cat.name, {
        style: 'label',
        textRenderer: this.textRenderer,
        glowColor: new THREE.Color(cat.color),
        glowIntensity: 0.4,
        animate: true,
        billboard: true
      })
      label.position.set(0, 3, 0)
      cluster.add(label)
      
      group.add(cluster)
      cluster.orbs.forEach(orb => this.interactables.push(orb))
      this.updateCallbacks.push((dt, cam) => {
        cluster.update(dt, cam)
        label.update(dt, cam)
      })
    })
    
    this.skillsZone = group
    this.sections.set('skills', group)
    this.scene.add(group)
  }

  /**
   * South zone: Timeline path for education
   */
  createEducationPath() {
    const group = new THREE.Group()
    group.name = 'educationZone'
    group.position.set(0, 0, this.zoneDistance)
    
    const { education } = cvData
    
    // Zone waypoint
    const waypoint = new Waypoint({
      label: 'Education',
      sectionId: 'education',
      textRenderer: this.textRenderer,
      beamColor: new THREE.Color(0xaa66ff)
    })
    waypoint.position.set(0, this.getTerrainHeight(0, this.zoneDistance), 0)
    group.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    // Create timeline path
    const pathPoints = []
    const pathLength = 25
    const startX = -pathLength / 2
    
    education.forEach((edu, index) => {
      const t = index / (education.length - 1)
      const x = startX + t * pathLength
      const z = Math.sin(t * Math.PI) * 3
      
      pathPoints.push(new THREE.Vector3(x, 0.1, z))
      
      // Create terminal for each education entry
      const terminal = new Terminal({
        title: edu.institution,
        content: edu.degree || edu.level,
        details: [edu.period, edu.cgpa ? `CGPA: ${edu.cgpa}` : edu.percentage],
        textRenderer: this.textRenderer,
        glowColor: new THREE.Color(0xaa66ff),
        width: 2,
        height: 2.5
      })
      
      const y = this.getTerrainHeight(x, z + this.zoneDistance)
      terminal.position.set(x, y, z + 2)
      terminal.rotation.y = Math.PI
      
      group.add(terminal)
      this.interactables.push(terminal)
      this.updateCallbacks.push((dt, cam) => terminal.update(dt, cam))
    })
    
    // Create path line
    const pathCurve = new THREE.CatmullRomCurve3(pathPoints)
    const pathGeom = new THREE.TubeGeometry(pathCurve, 64, 0.1, 8, false)
    const pathMat = new THREE.MeshBasicMaterial({
      color: 0xaa66ff,
      transparent: true,
      opacity: 0.4
    })
    const pathMesh = new THREE.Mesh(pathGeom, pathMat)
    group.add(pathMesh)
    
    this.educationZone = group
    this.sections.set('education', group)
    this.scene.add(group)
  }

  /**
   * Far south: Ventures and professional experience
   */
  createVenturesZone() {
    const group = new THREE.Group()
    group.name = 'venturesZone'
    group.position.set(0, 0, this.zoneDistance + 30)
    
    const { ventures, professionalExperience } = cvData
    
    // Zone waypoint
    const waypoint = new Waypoint({
      label: 'Ventures & Experience',
      sectionId: 'ventures',
      textRenderer: this.textRenderer,
      beamColor: new THREE.Color(0xff6644)
    })
    waypoint.position.set(0, this.getTerrainHeight(0, this.zoneDistance + 30), 0)
    group.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    // Monuments for ventures (startups)
    ventures.forEach((venture, index) => {
      const x = (index - ventures.length / 2) * 8
      
      const monument = new Monument({
        title: venture.title,
        subtitle: venture.position,
        description: venture.description,
        year: venture.period,
        textRenderer: this.textRenderer,
        crystalColor: new THREE.Color(0xff6644),
        accentColor: 0xffa500
      })
      
      monument.position.set(x, this.getTerrainHeight(x, this.zoneDistance + 30 - 10), -10)
      group.add(monument)
      this.interactables.push(monument)
      this.updateCallbacks.push((dt, cam) => monument.update(dt, cam))
    })
    
    // Terminals for professional experience
    professionalExperience.slice(0, 4).forEach((exp, index) => {
      const angle = (index / 4) * Math.PI + Math.PI
      const radius = 12
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      
      const terminal = new Terminal({
        title: exp.title,
        content: exp.description,
        details: [exp.period, exp.location || ''].filter(Boolean),
        textRenderer: this.textRenderer,
        glowColor: new THREE.Color(0xff9944)
      })
      
      terminal.position.set(x, this.getTerrainHeight(x, z + this.zoneDistance + 30), z)
      terminal.lookAt(new THREE.Vector3(0, terminal.position.y, 0))
      
      group.add(terminal)
      this.interactables.push(terminal)
      this.updateCallbacks.push((dt, cam) => terminal.update(dt, cam))
    })
    
    this.venturesZone = group
    this.sections.set('ventures', group)
    this.scene.add(group)
  }

  /**
   * Create navigation portals around center
   */
  createNavigationPortals() {
    const group = new THREE.Group()
    group.name = 'navigationPortals'
    
    const portalConfigs = [
      { label: 'Publications', sectionId: 'publications', target: new THREE.Vector3(0, 0, -this.zoneDistance + 5), angle: 0, color: 0xffd700 },
      { label: 'Projects', sectionId: 'projects', target: new THREE.Vector3(this.zoneDistance - 5, 0, 0), angle: Math.PI / 2, color: 0x00ccff },
      { label: 'Skills', sectionId: 'skills', target: new THREE.Vector3(-this.zoneDistance + 5, 0, 0), angle: -Math.PI / 2, color: 0x44ffaa },
      { label: 'Education', sectionId: 'education', target: new THREE.Vector3(0, 0, this.zoneDistance - 5), angle: Math.PI, color: 0xaa66ff }
    ]
    
    const portalDistance = 12
    
    portalConfigs.forEach((config, index) => {
      const x = Math.sin(config.angle) * portalDistance
      const z = -Math.cos(config.angle) * portalDistance
      
      const portal = new Portal({
        label: config.label,
        sectionId: config.sectionId,
        targetPosition: config.target,
        textRenderer: this.textRenderer,
        portalColor: new THREE.Color(config.color),
        glowColor: new THREE.Color(config.color).multiplyScalar(1.5),
        outerRadius: 1.8
      })
      
      portal.position.set(x, this.getTerrainHeight(x, z), z)
      
      group.add(portal)
      this.interactables.push(portal)
      this.updateCallbacks.push((dt, cam) => portal.update(dt, cam))
    })
    
    this.navigationPortals = group
    this.scene.add(group)
  }

  /**
   * Create spotlights for each zone
   */
  createZoneLighting() {
    const zones = [
      { pos: new THREE.Vector3(0, 0, 0), color: 0x4488ff, name: 'welcome' },
      { pos: new THREE.Vector3(0, 0, -this.zoneDistance), color: 0xffd700, name: 'publications' },
      { pos: new THREE.Vector3(this.zoneDistance, 0, 0), color: 0x00ccff, name: 'projects' },
      { pos: new THREE.Vector3(-this.zoneDistance, 0, 0), color: 0x44ffaa, name: 'skills' },
      { pos: new THREE.Vector3(0, 0, this.zoneDistance), color: 0xaa66ff, name: 'education' },
      { pos: new THREE.Vector3(0, 0, this.zoneDistance + 30), color: 0xff6644, name: 'ventures' }
    ]
    
    zones.forEach(zone => {
      // Spotlight from above
      const spotlight = new THREE.SpotLight(zone.color, 1, 60, Math.PI / 4, 0.5, 1)
      spotlight.position.set(zone.pos.x, 25, zone.pos.z)
      spotlight.target.position.copy(zone.pos)
      spotlight.castShadow = true
      spotlight.shadow.mapSize.width = 512
      spotlight.shadow.mapSize.height = 512
      
      this.scene.add(spotlight)
      this.scene.add(spotlight.target)
      
      // Ambient point light for fill
      const pointLight = new THREE.PointLight(zone.color, 0.3, 40)
      pointLight.position.set(zone.pos.x, 5, zone.pos.z)
      this.scene.add(pointLight)
    })
  }

  /**
   * Get terrain height at position (wrapper for terrain module)
   */
  getTerrainHeight(x, z) {
    if (terrain && terrain.getTerrainHeight) {
      return terrain.getTerrainHeight(x, z)
    }
    return 0
  }

  /**
   * Get color based on publication status/venue
   */
  getPublicationColor(pub) {
    if (pub.status === 'In Progress') return new THREE.Color(0x66aaff)
    if (pub.venue?.includes('TREC')) return new THREE.Color(0x00ff88)
    if (pub.venue?.includes('FIRE')) return new THREE.Color(0xffaa00)
    if (pub.venue?.includes('ECIR')) return new THREE.Color(0xff4488)
    return new THREE.Color(0x00ffaa)
  }

  /**
   * Place objects in a circle
   */
  placeInCircle(objects, center, radius, startAngle = 0) {
    objects.forEach((obj, index) => {
      const angle = startAngle + (index / objects.length) * Math.PI * 2
      const x = center.x + Math.cos(angle) * radius
      const z = center.z + Math.sin(angle) * radius
      const y = this.getTerrainHeight(x, z)
      
      obj.position.set(x, y, z)
      
      // Face toward center
      obj.lookAt(new THREE.Vector3(center.x, y, center.z))
    })
  }

  /**
   * Place objects along a curve path
   */
  placeAlongPath(objects, pathCurve) {
    objects.forEach((obj, index) => {
      const t = index / (objects.length - 1)
      const point = pathCurve.getPoint(t)
      const y = this.getTerrainHeight(point.x, point.z)
      
      obj.position.set(point.x, y, point.z)
      
      // Orient along path
      const tangent = pathCurve.getTangent(t)
      obj.lookAt(new THREE.Vector3(
        point.x + tangent.x,
        y,
        point.z + tangent.z
      ))
    })
  }

  /**
   * Create a simple waypoint marker
   */
  createWaypointMarker(position, label) {
    const waypoint = new Waypoint({
      label,
      textRenderer: this.textRenderer
    })
    waypoint.position.copy(position)
    waypoint.position.y = this.getTerrainHeight(position.x, position.z)
    
    this.scene.add(waypoint)
    this.interactables.push(waypoint)
    this.updateCallbacks.push((dt, cam) => waypoint.update(dt, cam))
    
    return waypoint
  }

  /**
   * Get all interactable objects
   */
  getInteractables() {
    return this.interactables
  }

  /**
   * Update all world objects
   */
  update(deltaTime, camera) {
    for (const callback of this.updateCallbacks) {
      callback(deltaTime, camera)
    }
  }

  /**
   * Get section group by ID
   */
  getSection(sectionId) {
    return this.sections.get(sectionId)
  }

  /**
   * Navigate to a section
   */
  getSectionPosition(sectionId) {
    const positions = {
      welcome: new THREE.Vector3(0, 2, 8),
      publications: new THREE.Vector3(0, 2, -this.zoneDistance + 10),
      projects: new THREE.Vector3(this.zoneDistance - 10, 2, 0),
      skills: new THREE.Vector3(-this.zoneDistance + 10, 2, 0),
      education: new THREE.Vector3(0, 2, this.zoneDistance - 10),
      ventures: new THREE.Vector3(0, 2, this.zoneDistance + 20)
    }
    
    return positions[sectionId] || positions.welcome
  }

  /**
   * Clean up all resources
   */
  dispose() {
    this.interactables.forEach(obj => {
      if (obj.dispose) obj.dispose()
    })
    
    this.sections.forEach(section => {
      section.traverse(child => {
        if (child.geometry) child.geometry.dispose()
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    })
    
    this.sections.clear()
    this.interactables = []
    this.updateCallbacks = []
  }
}

export default WorldBuilder
