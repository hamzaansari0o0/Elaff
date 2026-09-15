'use client';

import * as React from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { cn } from '@/lib/utils';

const SPRING_CONFIG = {
  type: 'spring',
  stiffness: 100,
  damping: 16,
  mass: 0.75,
  restDelta: 0.005,
  duration: 0.3,
};
const blurVariants = {
  hidden: { filter: 'blur(10px)', opacity: 0 },
  visible: { filter: 'blur(0px)', opacity: 1 },
};

const ContainerScrollContext = React.createContext(undefined);
function useContainerScrollContext() {
  const context = React.useContext(ContainerScrollContext);
  if (!context) {
    throw new Error('useContainerScrollContext must be used within a ContainerScroll Component');
  }
  return context;
}

export const ContainerScroll = ({ children, className, style, ...props }) => {
  const scrollRef = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: scrollRef });
  return (
    <ContainerScrollContext.Provider value={{ scrollYProgress }}>
      <div
        ref={scrollRef}
        className={cn('relative min-h-[120vh]', className)}
        style={{
          perspective: '1000px',
          perspectiveOrigin: 'center top',
          transformStyle: 'preserve-3d',
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    </ContainerScrollContext.Provider>
  );
};
ContainerScroll.displayName = 'ContainerScroll';

export const ContainerSticky = ({ className, style, ...props }) => {
  return (
    <div
      className={cn('sticky left-0 top-0 min-h-[30rem] w-full overflow-hidden', className)}
      style={{
        perspective: '1000px',
        perspectiveOrigin: 'center top',
        transformStyle: 'preserve-3d',
        transformOrigin: '50% 50%',
        ...style,
      }}
      {...props}
    />
  );
};
ContainerSticky.displayName = 'ContainerSticky';

export const GalleryContainer = ({ children, className, style, tilt = true, ...props }) => {
  const { scrollYProgress } = useContainerScrollContext();
  // tilt=false keeps this a no-op (0deg the whole way) instead of removing
  // the transform, so callers can reuse the same gallery for a repeated,
  // untilted reveal without the 3D flip playing every time.
  const rotateX = useTransform(scrollYProgress, [0, 0.5], tilt ? [75, 0] : [0, 0]);
  const scale = useTransform(scrollYProgress, [0.5, 0.9], [1.2, 1]);

  return (
    <motion.div
      className={cn('relative grid size-full grid-cols-3 gap-2 rounded-2xl', className)}
      style={{
        rotateX,
        scale,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};
GalleryContainer.displayName = 'GalleryContainer';

export const GalleryCol = ({ className, style, yRange = ['0%', '-10%'], ...props }) => {
  const { scrollYProgress } = useContainerScrollContext();
  const y = useTransform(scrollYProgress, [0.5, 1], yRange);

  return <motion.div className={cn('relative flex w-full flex-col gap-2', className)} style={{ y, ...style }} {...props} />;
};
GalleryCol.displayName = 'GalleryCol';

export const ContainerStagger = React.forwardRef(({ className, viewport, transition, ...props }, ref) => {
  return (
    <motion.div
      className={cn('relative', className)}
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, ...viewport }}
      transition={{ staggerChildren: transition?.staggerChildren || 0.2, ...transition }}
      {...props}
    />
  );
});
ContainerStagger.displayName = 'ContainerStagger';

export const ContainerAnimated = React.forwardRef(({ className, transition, ...props }, ref) => {
  return (
    <motion.div
      ref={ref}
      className={cn(className)}
      variants={blurVariants}
      transition={transition || SPRING_CONFIG}
      {...props}
    />
  );
});
ContainerAnimated.displayName = 'ContainerAnimated';
