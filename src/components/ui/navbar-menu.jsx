'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const transition = {
  type: 'spring',
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

// `triggerClassName` lets callers match their own nav's typography instead
// of the default black/white label styling — this project has no dark mode.
// `href`, if given, makes the trigger label itself a real link (clicking it
// navigates) on top of the hover-to-open panel — an <a> wrapping a <p> is
// valid HTML5 (block content inside an anchor is explicitly allowed).
export const MenuItem = ({ setActive, active, item, children, triggerClassName = '', href }) => {
  const label = (
    <motion.p
      transition={{ duration: 0.3 }}
      className={triggerClassName || 'cursor-pointer text-black hover:opacity-[0.9]'}
    >
      {item}
    </motion.p>
  );

  return (
    <div onMouseEnter={() => setActive(item)} className="relative">
      {href ? <Link href={href}>{label}</Link> : label}
      {active !== null && (
        <motion.div initial={{ opacity: 0, scale: 0.85, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={transition}>
          {active === item && (
            // top-full (no gap) with the breathing room as padding *inside* this
            // div, not as space above it — a real offset there would leave a
            // strip with nothing from the nav underneath the cursor, so moving
            // the mouse down from the trigger into the panel would register as
            // leaving the nav (via its onMouseLeave) and close the panel before
            // it could be reached. left-0 (instead of centering on the trigger)
            // plus a capped, scrollable width keeps a wide panel from running
            // off the edge of narrower laptop/tablet screens.
            <div className="absolute top-full left-0 pt-3">
              <motion.div
                transition={transition}
                layoutId="active" // layoutId ensures smooth animation
                className="bg-white rounded-2xl overflow-hidden border border-black/[0.2] shadow-xl"
              >
                <motion.div layout className="max-w-[min(92vw,50rem)] max-h-[70vh] overflow-auto p-4">
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({ setActive, children, className = '' }) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className={
        className ||
        'relative rounded-full border border-transparent bg-white shadow-input flex justify-center space-x-4 px-8 py-6'
      }
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({ title, description, href, src }) => {
  return (
    <Link href={href} className="flex space-x-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} width={140} height={70} alt={title} className="flex-shrink-0 rounded-md shadow-2xl object-cover" />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black">{title}</h4>
        <p className="text-neutral-700 text-sm max-w-[10rem]">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, ...rest }) => {
  return (
    <Link {...rest} className="text-neutral-700 hover:text-black transition-colors">
      {children}
    </Link>
  );
};
