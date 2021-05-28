export function errorToLocation(error, location) {
  console.error(error);

  //  Attempt to load the page directly.
  //  A 404 is more informative to a user than a console error.
  window.location.assign(location);
}
