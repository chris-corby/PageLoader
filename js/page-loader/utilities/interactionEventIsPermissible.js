import { specialKeyIsPressed } from './specialKeyIsPressed';

export function interactionEventIsPermissible(event) {
  return !(
    specialKeyIsPressed(event) ||
    event.defaultPrevented ||
    event.target.isContentEditable
  );
}
