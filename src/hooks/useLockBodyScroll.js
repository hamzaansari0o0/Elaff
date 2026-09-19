'use client';

import { useEffect } from 'react';

// Without this, an open drawer/modal still leaves the page underneath it
// scrollable — the mouse wheel scrolls whichever element the browser picks,
// which is usually the body, not the panel under the cursor. Locking body
// scroll while the overlay is open forces wheel input into the panel's own
// overflow-y-auto container instead.
let lockCount = 0;

export default function useLockBodyScroll(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;

    lockCount += 1;
    if (lockCount === 1) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      lockCount -= 1;
      if (lockCount === 0) {
        document.body.style.overflow = '';
      }
    };
  }, [isLocked]);
}
