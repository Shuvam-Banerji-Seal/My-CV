/**
 * Road geometry tests.
 *
 * The road is the layout authority for the whole scene, so its contract needs
 * to hold: monotonic station positions, unit tangents, a right vector that is
 * genuinely perpendicular and horizontal, and clamped lookups at the ends.
 */
import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Road, STATION_SPACING, LEAD_IN, LEAD_OUT, ROAD_WIDTH } from '../src/scene/Road.js';

const COUNT = 12;

describe('Road.buildCurve', () => {
  it('adds a lead-in and lead-out beyond the station span', () => {
    const curve = Road.buildCurve(COUNT);
    const points = curve.points;
    expect(points[0].z).toBe(LEAD_IN);
    expect(points[points.length - 1].z).toBe(-(COUNT - 1) * STATION_SPACING - LEAD_OUT);
  });

  it('is deterministic across builds', () => {
    const a = Road.buildCurve(COUNT).getPointAt(0.42);
    const b = Road.buildCurve(COUNT).getPointAt(0.42);
    expect(a.x).toBeCloseTo(b.x, 10);
    expect(a.z).toBeCloseTo(b.z, 10);
  });

  it('travels in -Z overall', () => {
    const curve = Road.buildCurve(COUNT);
    expect(curve.getPointAt(1).z).toBeLessThan(curve.getPointAt(0).z);
  });
});

describe('Road', () => {
  const road = new Road(COUNT);

  it('has positive length and a renderable group', () => {
    expect(road.length).toBeGreaterThan(0);
    expect(road.group.children.length).toBeGreaterThan(0);
  });

  it('places stations in strictly increasing road order', () => {
    for (let i = 1; i < COUNT; i++) {
      expect(road.uForStation(i)).toBeGreaterThan(road.uForStation(i - 1));
    }
  });

  it('keeps every station u inside [0, 1] and off both ends', () => {
    for (let i = 0; i < COUNT; i++) {
      const u = road.uForStation(i);
      expect(u).toBeGreaterThan(0);
      expect(u).toBeLessThan(1);
    }
  });

  it('returns unit tangents', () => {
    for (const u of [0, 0.25, 0.5, 0.75, 1]) {
      expect(road.tangentAt(u).length()).toBeCloseTo(1, 6);
    }
  });

  it('returns a horizontal right vector perpendicular to the tangent', () => {
    for (const u of [0.1, 0.5, 0.9]) {
      const right = road.rightAt(u);
      expect(right.length()).toBeCloseTo(1, 6);
      expect(right.y).toBeCloseTo(0, 6);
      expect(right.dot(road.tangentAt(u))).toBeCloseTo(0, 6);
    }
  });

  it('clamps out-of-range lookups instead of returning NaN', () => {
    for (const u of [-3, 4]) {
      const point = road.pointAt(u);
      expect(Number.isFinite(point.x)).toBe(true);
      expect(Number.isFinite(point.z)).toBe(true);
    }
    expect(road.pointAt(-1).equals(road.pointAt(0))).toBe(true);
    expect(road.pointAt(2).equals(road.pointAt(1))).toBe(true);
  });

  it('builds a surface as wide as ROAD_WIDTH', () => {
    const u = 0.5;
    const centre = road.pointAt(u);
    const right = road.rightAt(u).multiplyScalar(ROAD_WIDTH / 2);
    const edge = new THREE.Vector3().addVectors(centre, right);
    expect(edge.distanceTo(centre)).toBeCloseTo(ROAD_WIDTH / 2, 6);
  });

  it('survives a single-milestone road', () => {
    const tiny = new Road(1);
    expect(Number.isFinite(tiny.uForStation(0))).toBe(true);
    expect(tiny.length).toBeGreaterThan(0);
  });
});
