'use client';

import { motion } from 'framer-motion';

// Fades a whole home page section up into place as it nears the viewport. Animated as
// one group (not per card) because per-card scroll reveals would fight with the
// carousel's own horizontal scrolling.
export default function FadeUp({ children, className }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -80px 0px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
