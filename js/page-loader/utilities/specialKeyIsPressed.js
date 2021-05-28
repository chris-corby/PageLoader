export function specialKeyIsPressed(event) {
  //  Special keys suggest a user intention, e.g. open in a new tab
  return event.altKey || event.ctrlKey || event.metaKey || event.shiftKey;
}
