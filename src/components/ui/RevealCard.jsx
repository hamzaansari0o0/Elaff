'use client';

import { motion } from 'framer-motion';

// Rises into place from below as it nears the viewport — mirrors the
// partners logo grid's reveal (see PartnersLogoGrid.jsx) so every card grid
// on the site reads as one consistent scroll language instead of a
// different effect per section. `h-full` on the wrapper keeps a card's own
// `h-full` resolving correctly inside a CSS grid cell.
export default function RevealCard({ children, index = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 56, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '0px 0px -50px 0px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className={`h-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
