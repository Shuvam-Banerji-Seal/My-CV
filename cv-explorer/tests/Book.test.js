/**
 * Book.js tests — verifies the 3D book object constructs correctly and
 * its proximity/open/close logic behaves as expected.
 *
 * We import THREE directly (it works in jsdom for non-WebGL code) and
 * construct a Book without a textRenderer (which needs a real canvas context).
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { Book } from '../src/objects/Book.js';

// Stub document.createElement('canvas').getContext — already done in setup.js
// but make extra sure it's here for the Book's createEmblem().
function ensureCanvasStub() {
  if (!HTMLCanvasElement.prototype.getContext) {
    HTMLCanvasElement.prototype.getContext = () => ({});
  }
}

describe('Book', () => {
  let chapter;
  beforeEach(() => {
    ensureCanvasStub();
    chapter = {
      id: 'test',
      title: 'Test Chapter',
      subtitle: 'A subtitle',
      color: 0x4488ff,
      icon: '📖',
      pages: [{ heading: 'Page 1', body: 'Body text' }]
    };
  });

  it('constructs with a chapter and exposes userData for raycasting', () => {
    const book = new Book({ chapter, color: chapter.color });
    expect(book).toBeInstanceOf(Book);
    expect(book).toBeInstanceOf(THREE.Group);
    expect(book.userData.type).toBe('book');
    expect(book.userData.interactive).toBe(true);
    expect(book.userData.title).toBe('Test Chapter');
    expect(book.userData.chapter).toBe(chapter);
    expect(typeof book.userData.onClick).toBe('function');
    expect(typeof book.userData.onHover).toBe('function');
  });

  it('builds cover, back cover, spine, pages, plinth, plinth ring, and glow light', () => {
    const book = new Book({ chapter });
    expect(book.cover).toBeInstanceOf(THREE.Mesh);
    expect(book.backCover).toBeInstanceOf(THREE.Mesh);
    expect(book.spine).toBeInstanceOf(THREE.Mesh);
    expect(book.pages).toBeInstanceOf(THREE.Mesh);
    expect(book.plinth).toBeInstanceOf(THREE.Mesh);
    expect(book.plinthRing).toBeInstanceOf(THREE.Mesh);
    expect(book.glowLight).toBeInstanceOf(THREE.PointLight);
    expect(book.coverPivot).toBeInstanceOf(THREE.Group);
  });

  it('starts closed (openAmount = 0, targetOpen = 0)', () => {
    const book = new Book({ chapter });
    expect(book.isOpen).toBe(false);
    expect(book.openAmount).toBe(0);
    expect(book.targetOpen).toBe(0);
  });

  it('setPlayerNear(true) sets targetOpen = 1, setPlayerNear(false) sets targetOpen = 0', () => {
    const book = new Book({ chapter });
    book.setPlayerNear(true);
    expect(book.targetOpen).toBe(1);
    book.setPlayerNear(false);
    expect(book.targetOpen).toBe(0);
  });

  it('update() lerps openAmount toward target and rotates the cover pivot', () => {
    const book = new Book({ chapter });
    expect(book.openAmount).toBe(0);
    expect(book.coverPivot.rotation.y).toBe(0);

    book.setPlayerNear(true);
    // Simulate ~1 second of frames at 60fps
    for (let i = 0; i < 60; i++) book.update(1 / 60, null);
    expect(book.openAmount).toBeGreaterThan(0.95);
    // Cover should have rotated to ~ -PI * 0.82
    expect(book.coverPivot.rotation.y).toBeLessThan(-Math.PI * 0.7);

    book.setPlayerNear(false);
    for (let i = 0; i < 120; i++) book.update(1 / 60, null);
    expect(book.openAmount).toBeLessThan(0.05);
    expect(book.coverPivot.rotation.y).toBeGreaterThan(-0.05);
  });

  it('update() with a camera faces the player when open', () => {
    const book = new Book({ chapter });
    book.position.set(0, 2, 0);
    const cam = { position: new THREE.Vector3(5, 2, 0) };
    book.setPlayerNear(true);
    for (let i = 0; i < 60; i++) book.update(1 / 60, cam);
    // atan2(5, 0) - PI/2 = 0 (looking +x means face +x)
    // The book should yaw toward the player
    expect(book.rotation.y).not.toBe(0);
  });

  it('openReader() dispatches an openBookReader CustomEvent on the canvas', () => {
    const book = new Book({ chapter });
    const canvas = document.createElement('canvas');
    canvas.id = 'canvas';
    document.body.appendChild(canvas);

    let received = null;
    canvas.addEventListener('openBookReader', (e) => { received = e.detail; });
    book.openReader();
    expect(received).not.toBeNull();
    expect(received.chapter).toBe(chapter);
    expect(received.book).toBe(book);

    document.body.removeChild(canvas);
  });

  it('dispose() clears the group children', () => {
    const book = new Book({ chapter });
    expect(book.children.length).toBeGreaterThan(0);
    book.dispose();
    expect(book.children.length).toBe(0);
  });

  it('respects custom geometry options', () => {
    const book = new Book({ chapter, width: 3, height: 4, thickness: 0.5, floatHeight: 5 });
    // The book adds floatHeight to its y position
    expect(book.position.y).toBe(5);
    // Cover geometry width should match
    expect(book.cover.geometry.parameters.width).toBe(3);
    expect(book.cover.geometry.parameters.height).toBe(4);
  });

  it('hovering increases the glow target', () => {
    const book = new Book({ chapter });
    const before = book.glowLight.intensity;
    book.setHovered(true);
    book.update(0.5, null);
    expect(book.glowLight.intensity).toBeGreaterThan(before);
  });
});
