// Fired to manually kick off the top loading bar (see RouteLoadingBar) from
// code that navigates via router.push()/replace() rather than a real <a>
// click — RouteLoadingBar's own document-level click listener only ever
// sees actual clicks, so anything that navigates programmatically (a search
// suggestion, a form submit) needs to call this itself, right before the
// router call.
export const ROUTE_LOADING_START_EVENT = 'route-loading:start';

export function startRouteLoading() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ROUTE_LOADING_START_EVENT));
  }
}
