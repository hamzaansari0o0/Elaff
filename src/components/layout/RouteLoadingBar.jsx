'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// A stuck bar (route never actually changes — e.g. navigating to the exact
// page you're already on) is worse than no bar, so it always self-clears.
const SAFETY_TIMEOUT_MS = 4000;

function RouteLoadingBarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const timeoutIdsRef = useRef([]);
  // Whether a navigation is in flight — a plain ref, not state. It's written
  // synchronously the instant a navigation starts (see `start()` below) so
  // the completion effect can never miss a route change that lands before a
  // *deferred* state update would have. Using isLoading state here instead
  // previously raced: pathname could update (and the completion effect run)
  // before the deferred setIsLoading(true) had even fired, leaving the bar
  // stuck mid-animation.
  const isNavigatingRef = useRef(false);

  // Every client-side navigation in the App Router — a <Link> click or a
  // router.push()/replace() call — ultimately calls history.pushState or
  // replaceState. Patching those two functions once catches every
  // navigation at a single reliable point, rather than trying to intercept
  // clicks on every link and every router.push() call site individually.
  useEffect(() => {
    function clearScheduledSteps() {
      timeoutIdsRef.current.forEach(clearTimeout);
      timeoutIdsRef.current = [];
    }

    function start() {
      // Synchronous — safe even from inside a useInsertionEffect (which is
      // where Next's router can call pushState/replaceState from during a
      // route transition) because mutating a ref never schedules a
      // re-render, unlike a setState call, which throws "useInsertionEffect
      // must not schedule updates" from that same call stack.
      isNavigatingRef.current = true;
      clearScheduledSteps();

      // The visual progress updates *do* go through setState, so those stay
      // deferred a macrotask out, same reasoning as above.
      timeoutIdsRef.current.push(setTimeout(() => setProgress(15), 0));
      timeoutIdsRef.current.push(setTimeout(() => setProgress(45), 120));
      timeoutIdsRef.current.push(setTimeout(() => setProgress(70), 400));
      timeoutIdsRef.current.push(setTimeout(() => setProgress(85), 900));
      timeoutIdsRef.current.push(
        setTimeout(() => {
          isNavigatingRef.current = false;
          setProgress(0);
        }, SAFETY_TIMEOUT_MS)
      );
    }

    const original = { pushState: window.history.pushState, replaceState: window.history.replaceState };

    if (!window.history.pushState.__routeLoadingBarPatched) {
      window.history.pushState = function patchedPushState(...args) {
        start();
        return original.pushState.apply(window.history, args);
      };
      window.history.pushState.__routeLoadingBarPatched = true;

      window.history.replaceState = function patchedReplaceState(...args) {
        start();
        return original.replaceState.apply(window.history, args);
      };
    }

    window.addEventListener('popstate', start);
    return () => {
      window.removeEventListener('popstate', start);
      clearScheduledSteps();
    };
  }, []);

  // pathname/searchParams only change once Next.js has actually finished
  // rendering the destination route, so this is the real "navigation done" signal.
  useEffect(() => {
    if (!isNavigatingRef.current) return;
    isNavigatingRef.current = false;
    timeoutIdsRef.current.forEach(clearTimeout);

    // Deferred (not called directly in the effect body) to stay consistent
    // with the rest of this component, even though this particular effect
    // isn't the one at risk of the useInsertionEffect issue.
    const jumpToComplete = setTimeout(() => setProgress(100), 0);
    const finishTimeout = setTimeout(() => setProgress(0), 200);

    return () => {
      clearTimeout(jumpToComplete);
      clearTimeout(finishTimeout);
    };
  }, [pathname, searchParams]);

  if (progress === 0) return null;

  return (
    <div id="route-loading-bar" className="fixed top-0 left-0 right-0 z-[100] h-[3px] pointer-events-none" aria-hidden="true">
      <div
        className="h-full bg-brand-cta shadow-[0_0_10px_rgba(13,148,136,0.7)] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}

// Site-wide top progress bar so a click that's about to load a new page
// never feels like it did nothing while the next page is still loading.
export default function RouteLoadingBar() {
  return (
    <Suspense fallback={null}>
      <RouteLoadingBarInner />
    </Suspense>
  );
}
