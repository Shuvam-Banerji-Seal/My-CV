/**
 * Station tests — placement, focus easing and teardown.
 */
import { describe, it, expect } from 'vitest';
import { Road } from '../src/scene/Road.js';
import { Station } from '../src/objects/Station.js';
import { orderedMilestones, KINDS } from '../src/data/cvData.js';

const milestones = orderedMilestones();
const road = new Road(milestones.length);

function stationAt(index) {
  return new Station(milestones[index], index, road);
}

describe('Station', () => {
  it('alternates sides of the road so the walk reads as an avenue', () => {
    expect(stationAt(0).side).toBe(-1);
    expect(stationAt(1).side).toBe(1);
    expect(stationAt(2).side).toBe(-1);
  });

  it('tags the group with the milestone id so raycasts resolve back to data', () => {
    const station = stationAt(3);
    expect(station.group.userData.stationId).toBe(milestones[3].id);
  });

  it('takes its colour from the milestone kind', () => {
    const station = stationAt(4);
    const expected = KINDS[milestones[4].kind].color;
    expect(`#${station.color.getHexString()}`).toBe(expected.toLowerCase());
  });

  it('stands beside the road, not on it', () => {
    const station = stationAt(5);
    const centre = road.pointAt(station.u);
    const distance = Math.hypot(
      station.group.position.x - centre.x,
      station.group.position.z - centre.z
    );
    expect(distance).toBeGreaterThan(4);
  });

  it('exposes pickable meshes for the raycaster', () => {
    const station = stationAt(2);
    expect(station.pickTargets.length).toBeGreaterThan(0);
    for (const target of station.pickTargets) {
      expect(target.isMesh).toBe(true);
    }
  });

  it('eases focus toward the requested nearness rather than snapping', () => {
    const station = stationAt(6);
    expect(station.focus).toBe(0);
    station.update(0, 1);
    expect(station.focus).toBeGreaterThan(0);
    expect(station.focus).toBeLessThan(1);

    for (let i = 0; i < 200; i++) station.update(i * 0.016, 1);
    expect(station.focus).toBeGreaterThan(0.95);
  });

  it('brightens the pillar and halo as focus rises', () => {
    const station = stationAt(7);
    station.update(0, 0);
    const dimEmissive = station.pillarMaterial.emissiveIntensity;
    for (let i = 0; i < 200; i++) station.update(i * 0.016, 1);
    expect(station.pillarMaterial.emissiveIntensity).toBeGreaterThan(dimEmissive);
    expect(station.haloMaterial.opacity).toBeGreaterThan(0.4);
  });

  it('disposes without throwing', () => {
    const station = stationAt(8);
    expect(() => station.dispose()).not.toThrow();
  });
});
