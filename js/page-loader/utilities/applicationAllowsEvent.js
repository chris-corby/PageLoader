import { dispatchEvent } from './dispatchEvent';

export function applicationAllowsEvent(
  name,
  { detail, cancelable = true } = {}
) {
  const event = dispatchEvent(name, {
    cancelable,
    detail,
  });

  return !event.defaultPrevented;
}
