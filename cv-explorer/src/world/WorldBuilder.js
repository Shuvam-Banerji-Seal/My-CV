import * as THREE from 'three';
import { chapters } from '../data/cvData.js';
import { Book } from '../objects/Book.js';
import { Path } from './Path.js';
import { Lantern } from './Lantern.js';
import { Fireflies } from './Fireflies.js';
import { FloatingText, createTitle } from '../objects/FloatingText.js';
import { TextRenderer } from '../utils/TextRenderer.js';
import { terrain } from '../scene/Terrain.js';

/**
 * WorldBuilder — the magical journey world.
 *
 * Layout: a winding Catmull-Rom path through the world. Books (one per CV
 * chapter) float above stone plinths placed at intervals along the path,
 * offset to the side so the player walks past each one.
 *
 * The player spawns at the path start (south, z ≈ 0) and walks north (-z),
 * encountering books one by one. Lanterns line the path; fireflies drift
 * overhead for ambience.
 *
 * Proximity: each frame we check the camera distance to every book and toggle
 * the book's `setPlayerNear` state. The closest book in range also reports
 * its chapter title to the HUD via a custom event.
 */
export class WorldBuilder {
  constructor(scene) {
    this.scene = scene;
    this.textRenderer = new TextRenderer();
    this.books = [];
    this.lanterns = [];
    this.path = null;
    this.fireflies = null;
    this.updateCallbacks = [];
    this.sections = new Map();
    this.startMarker = null;
    this.endMarker = null;

    // The book that the player is currently nearest to (for HUD updates)
    this.currentNearestBook = null;
  }

  build() {
    // 1. The winding path
    this.path = new Path({ waypointCount: chapters.length });
    this.scene.add(this.path.getGroup());
    this.updateCallbacks.push((_dt, _cam) => this.path.update(performance.now() / 1000));

    // 2. Books placed along the path
    this.createBooksAlongPath();

    // 3. Welcome archway at the start
    this.createStartArea();

    // 4. End marker
    this.createEndArea();

    // 5. Lanterns at intervals beside the path
    this.createLanterns();

    // 6. Fireflies for ambience
    this.fireflies = new Fireflies({ count: 200, region: { x: 70, z: 80, yMin: 0.8, yMax: 5 } });
    this.scene.add(this.fireflies.group);
    this.updateCallbacks.push((_dt, _cam) => this.fireflies.update(performance.now() / 1000));

    // 7. Per-chapter spotlights (soft, no shadows)
    this.createBookLights();

    return this;
  }

  /**
   * Place one Book per chapter at intervals along the path.
   * Books alternate sides of the path so the journey feels varied.
   */
  createBooksAlongPath() {
    const positions = this.path.getBookPositions(3.5);
    // positions.length === chapters.length by construction (both use waypointCount)
    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const slot = positions[i];

      // Alternate which side of the path the book sits on.
      // Path.getBookPositions already offsets by +3.5 along the path normal;
      // for odd indices we mirror it to the other side.
      const finalPos = new THREE.Vector3(
        i % 2 === 0 ? slot.position.x : -slot.position.x,
        0,
        slot.position.z
      );
      // Guard against x≈0 (book on the path itself) — push it to the side
      if (Math.abs(finalPos.x) < 1.5) {
        finalPos.x = (i % 2 === 0 ? 3.5 : -3.5);
      }

      const terrainHeight = terrain.getTerrainHeight(finalPos.x, finalPos.z);

      const book = new Book({
        chapter,
        color: chapter.color,
        textRenderer: this.textRenderer,
        proximityRadius: 5.5,
        floatHeight: 2.2
      });

      // Place the book; book internally adds floatHeight to y, so set base y to terrain
      book.position.set(finalPos.x, terrainHeight, finalPos.z);
      // Face the path direction (so the cover faces the player walking by)
      book.rotation.y = slot.facingY;

      this.scene.add(book);
      this.books.push(book);
      this.sections.set(chapter.id, { position: finalPos, objects: [book] });
      this.updateCallbacks.push((dt, cam) => book.update(dt, cam));
    }
  }

  /**
   * A welcoming archway / title at the start of the path.
   */
  createStartArea() {
    const group = new THREE.Group();
    group.name = 'startArea';

    // Two pillars
    const pillarGeom = new THREE.CylinderGeometry(0.4, 0.5, 5, 12);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a35, metalness: 0.3, roughness: 0.7
    });
    const left = new THREE.Mesh(pillarGeom, pillarMat);
    left.position.set(-2.5, 2.5, 1.5);
    left.castShadow = true;
    const right = new THREE.Mesh(pillarGeom, pillarMat);
    right.position.set(2.5, 2.5, 1.5);
    right.castShadow = true;
    group.add(left, right);

    // Lintel
    const lintelGeom = new THREE.BoxGeometry(6, 0.4, 0.6);
    const lintel = new THREE.Mesh(lintelGeom, pillarMat);
    lintel.position.set(0, 5.2, 1.5);
    lintel.castShadow = true;
    group.add(lintel);

    // Glowing name text above the archway
    const titleText = createTitle('Shuvam Banerji Seal', {
      textRenderer: this.textRenderer,
      glowColor: new THREE.Color(0x44aaff),
      glowIntensity: 0.6,
      animate: true,
      bobAmplitude: 0.06,
      billboard: true,
      fontSize: 30
    });
    titleText.position.set(0, 6.5, 1.5);
    group.add(titleText);
    this.updateCallbacks.push((dt, cam) => titleText.update(dt, cam));

    // Subtitle
    const subtitle = new FloatingText('Walk the path · Open the books', {
      style: 'body',
      textRenderer: this.textRenderer,
      glowColor: new THREE.Color(0x66ccff),
      glowIntensity: 0.3,
      animate: true,
      bobAmplitude: 0.04,
      billboard: true,
      fontSize: 16
    });
    subtitle.position.set(0, 5.8, 1.5);
    group.add(subtitle);
    this.updateCallbacks.push((dt, cam) => subtitle.update(dt, cam));

    this.startMarker = group;
    this.scene.add(group);
  }

  /**
   * A small "end of journey" marker at the path's terminus.
   */
  createEndArea() {
    const group = new THREE.Group();
    group.name = 'endArea';

    // A taller obelisk marking the end
    const obeliskGeom = new THREE.ConeGeometry(0.6, 4, 4);
    const obeliskMat = new THREE.MeshStandardMaterial({
      color: 0x2a2a45,
      metalness: 0.5,
      roughness: 0.4,
      emissive: 0x4466aa,
      emissiveIntensity: 0.2
    });
    const obelisk = new THREE.Mesh(obeliskGeom, obeliskMat);
    const endPos = this.path.controlPoints[this.path.controlPoints.length - 1].clone();
    obelisk.position.set(endPos.x, 2, endPos.z);
    obelisk.castShadow = true;
    group.add(obelisk);

    const endText = new FloatingText('End of Journey', {
      style: 'label',
      textRenderer: this.textRenderer,
      glowColor: new THREE.Color(0x88aaff),
      glowIntensity: 0.4,
      animate: true,
      billboard: true
    });
    endText.position.set(endPos.x, 4.5, endPos.z);
    group.add(endText);
    this.updateCallbacks.push((dt, cam) => endText.update(dt, cam));

    this.endMarker = group;
    this.scene.add(group);
  }

  /**
   * Lanterns placed at regular intervals along the path, alternating sides.
   */
  createLanterns() {
    const positions = this.path.getBookPositions(2.0); // closer to path
    for (let i = 0; i < positions.length; i++) {
      if (i % 2 !== 0) continue; // every other waypoint
      const slot = positions[i];
      const side = (i % 4 < 2) ? -1 : 1;
      const pos = new THREE.Vector3(
        slot.position.x * 0 + (side * 2.0),
        0,
        slot.position.z
      );
      const terrainHeight = terrain.getTerrainHeight(pos.x, pos.z);
      const lantern = new Lantern({
        position: new THREE.Vector3(pos.x, terrainHeight, pos.z),
        color: 0xffaa44,
        intensity: 1.0,
        height: 3.5
      });
      this.scene.add(lantern.group);
      this.lanterns.push(lantern);
      this.updateCallbacks.push((_dt, _cam) => lantern.update(performance.now() / 1000));
    }
  }

  /**
   * Soft point lights above each book for accent (no shadows — cheap).
   */
  createBookLights() {
    for (const book of this.books) {
      const light = new THREE.PointLight(book.color, 0.5, 10, 2);
      light.position.set(book.position.x, book.position.y + 3, book.position.z);
      this.scene.add(light);
    }
  }

  /**
   * Per-frame proximity check: find the book nearest to the camera and toggle
   * each book's open/closed state. Reports the nearest in-range chapter to
   * the HUD via a custom event on the canvas.
   */
  update(deltaTime, camera) {
    for (const cb of this.updateCallbacks) cb(deltaTime, camera);

    let nearest = null;
    let nearestDist = Infinity;
    const camPos = camera.position;

    for (const book of this.books) {
      const dx = camPos.x - book.position.x;
      const dz = camPos.z - book.position.z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const near = dist < book.proximityRadius;
      book.setPlayerNear(near);

      if (near && dist < nearestDist) {
        nearestDist = dist;
        nearest = book;
      }
    }

    // Notify HUD when the nearest book changes
    if (nearest !== this.currentNearestBook) {
      this.currentNearestBook = nearest;
      const canvas = document.getElementById('canvas');
      if (canvas) {
        if (nearest) {
          canvas.dispatchEvent(new CustomEvent('bookInRange', {
            detail: { chapter: nearest.chapter, book: nearest }
          }));
        } else {
          canvas.dispatchEvent(new CustomEvent('bookOutOfRange'));
        }
      }
    }
  }

  getInteractables() {
    return this.books;
  }

  getSection(id) {
    return this.sections.get(id);
  }

  dispose() {
    for (const book of this.books) book.dispose();
    for (const lantern of this.lanterns) lantern.dispose();
    if (this.fireflies) this.fireflies.dispose();
    if (this.path) this.path.dispose();
    this.books = [];
    this.lanterns = [];
    this.updateCallbacks = [];
    this.sections.clear();
  }
}

export default WorldBuilder;
