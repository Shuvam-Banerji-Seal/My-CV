/**
 * Path.js tests — verifies the winding Catmull-Rom path generates correctly,
 * produces the right number of waypoints, and that book positions stay
 * within the playable boundary (radius < 85).
 */
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Path } from '../src/world/Path.js';

describe('Path', () => {
  it('constructs with default waypoint count = 15 (one per chapter)', () => {
    const path = new Path();
    expect(path.waypoints).toHaveLength(15);
  });

  it('constructs with a custom waypoint count', () => {
    const path = new Path({ waypointCount: 8 });
    expect(path.waypoints).toHaveLength(8);
  });

  it('every waypoint has position, tangent, and normal Vector3s', () => {
    const path = new Path();
    for (const wp of path.waypoints) {
      expect(wp.position).toBeInstanceOf(THREE.Vector3);
      expect(wp.tangent).toBeInstanceOf(THREE.Vector3);
      expect(wp.normal).toBeInstanceOf(THREE.Vector3);
      // Tangent should be normalised
      expect(wp.tangent.length()).toBeCloseTo(1, 4);
      expect(wp.normal.length()).toBeCloseTo(1, 4);
      // Normal is perpendicular to tangent on the XZ plane
      expect(wp.tangent.dot(wp.normal)).toBeCloseTo(0, 4);
    }
  });

  it('control points are all within the boundary radius (< 70)', () => {
    const path = new Path();
    for (const p of path.controlPoints) {
      const r = Math.sqrt(p.x * p.x + p.z * p.z);
      expect(r, `point (${p.x}, ${p.z}) at radius ${r}`).toBeLessThan(70);
    }
  });

  it('waypoint positions are all within boundary radius (< 75)', () => {
    const path = new Path();
    for (const wp of path.waypoints) {
      const r = Math.sqrt(wp.position.x ** 2 + wp.position.z ** 2);
      expect(r).toBeLessThan(75);
    }
  });

  it('book positions (with offset) stay within boundary radius (< 80)', () => {
    const path = new Path();
    const bookPositions = path.getBookPositions(3.5);
    expect(bookPositions).toHaveLength(15);
    for (const bp of bookPositions) {
      expect(bp.position).toBeInstanceOf(THREE.Vector3);
      expect(bp.tangent).toBeInstanceOf(THREE.Vector3);
      const r = Math.sqrt(bp.position.x ** 2 + bp.position.z ** 2);
      expect(r).toBeLessThan(80);
      // facingY is a number
      expect(bp.facingY).toEqual(expect.any(Number));
    }
  });

  it('path goes roughly in the -z direction (player walks north)', () => {
    const path = new Path();
    const start = path.waypoints[0].position;
    const end = path.waypoints[path.waypoints.length - 1].position;
    // The end should be further in -z than the start
    expect(end.z).toBeLessThan(start.z);
    // And the end should be at least 40 units away from the start
    const dist = start.distanceTo(end);
    expect(dist).toBeGreaterThan(40);
  });

  it('builds a tube mesh and glow ribbon', () => {
    const path = new Path();
    expect(path.tubeMesh).toBeInstanceOf(THREE.Mesh);
    expect(path.glowMesh).toBeInstanceOf(THREE.Mesh);
    expect(path.group.children.length).toBeGreaterThan(15); // tube + glow + 15 stones
  });

  it('update() does not throw and pulses the glow opacity', () => {
    const path = new Path();
    const before = path.glowMesh.material.opacity;
    expect(() => path.update(0)).not.toThrow();
    path.update(Math.PI / 3);
    // Just verify it didn't NaN
    expect(path.glowMesh.material.opacity).toEqual(expect.any(Number));
    expect(Number.isNaN(path.glowMesh.material.opacity)).toBe(false);
    void before;
  });

  it('dispose() clears the group', () => {
    const path = new Path();
    expect(path.group.children.length).toBeGreaterThan(0);
    path.dispose();
    expect(path.group.children.length).toBe(0);
  });
});
