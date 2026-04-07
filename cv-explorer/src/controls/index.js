/**
 * Controls module exports
 */

import { FirstPersonControls } from './FirstPersonControls.js';
import { TouchControls } from './TouchControls.js';
import { InteractionRaycaster } from './Raycaster.js';

export { FirstPersonControls, TouchControls, InteractionRaycaster };

/**
 * Convenience factory for creating appropriate controls based on device
 * @param {THREE.Camera} camera - The camera to control
 * @param {HTMLElement} domElement - The DOM element to attach controls to
 * @param {THREE.Scene} scene - The scene for raycasting
 * @returns {{ controls: FirstPersonControls|TouchControls, raycaster: InteractionRaycaster, type: string }}
 */
export function createControls(camera, domElement, scene) {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  // Always create raycaster for interactions
  const raycaster = new InteractionRaycaster(camera, scene, domElement);

  let controls;
  let type;

  if (isTouchDevice) {
    controls = new TouchControls(camera, domElement);
    type = 'touch';
  } else {
    controls = new FirstPersonControls(camera, domElement);
    type = 'desktop';
  }

  // Connect interaction callback
  controls.onInteract = () => raycaster.interact();

  return { controls, raycaster, type };
}

export default {
  FirstPersonControls,
  TouchControls,
  InteractionRaycaster,
  createControls
};
