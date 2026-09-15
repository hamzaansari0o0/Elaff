'use client';

import React, { Suspense, useEffect, useMemo, useRef, useState, createContext, useContext } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Html, Plane, Sphere } from '@react-three/drei';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { X } from 'lucide-react';

/* =========================
   Card Context
   ========================= */

const CardContext = createContext(undefined);

function useCard() {
  const ctx = useContext(CardContext);
  if (!ctx) throw new Error('useCard must be used within CardProvider');
  return ctx;
}

function CardProvider({ cards, children }) {
  const [selectedCard, setSelectedCard] = useState(null);

  return <CardContext.Provider value={{ selectedCard, setSelectedCard, cards }}>{children}</CardContext.Provider>;
}

/* =========================
   Starfield Background
   ========================= */

// `absolute inset-0`, not `fixed` — this is one section among several on the
// page, not the whole app. `fixed` would keep it pinned to the viewport for
// the entire scroll session, painting over the sticky nav above it and
// bleeding into every section that scrolls past underneath.
function StarfieldBackground({ starCount = 10000 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 1);
    mount.appendChild(renderer.domElement);

    const starsGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, sizeAttenuation: true });
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

    camera.position.z = 10;

    let animationId = 0;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      stars.rotation.y += 0.0001;
      stars.rotation.x += 0.00005;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starsGeometry.dispose();
      starsMaterial.dispose();
    };
  }, [starCount]);

  return <div ref={mountRef} className="absolute inset-0 z-0 bg-black" />;
}

/* =========================
   Floating Card
   ========================= */

function FloatingCard({ card, position }) {
  const meshRef = useRef(null);
  const groupRef = useRef(null);
  const [hovered, setHovered] = useState(false);
  const { setSelectedCard } = useCard();

  useFrame(({ camera }) => {
    if (groupRef.current) {
      groupRef.current.lookAt(camera.position);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    setSelectedCard(card);
  };
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };
  const handlePointerOut = (e) => {
    e.stopPropagation();
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  return (
    <group ref={groupRef} position={[position.x, position.y, position.z]}>
      <Plane ref={meshRef} args={[4.5, 6]} onClick={handleClick} onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
        <meshBasicMaterial transparent opacity={0} />
      </Plane>

      <Html
        transform
        distanceFactor={10}
        position={[0, 0, 0.01]}
        style={{
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.15)' : 'scale(1)',
          pointerEvents: 'none',
        }}
      >
        <div
          className="w-40 h-52 rounded-lg overflow-hidden shadow-2xl bg-[#1F2121] p-3 select-none"
          style={{
            boxShadow: hovered
              ? '0 25px 50px rgba(49, 184, 198, 0.5), 0 0 30px rgba(49, 184, 198, 0.3)'
              : '0 15px 30px rgba(0, 0, 0, 0.6)',
            border: hovered ? '2px solid rgba(49, 184, 198, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          {/* White backing so transparent-background logos read clearly against the dark card */}
          <div className="w-full h-40 rounded-md bg-white flex items-center justify-center p-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={card.imageUrl}
              alt={card.alt}
              className="max-w-full max-h-full object-contain"
              loading="lazy"
              draggable={false}
            />
          </div>
          <div className="mt-1 text-center">
            <p className="text-white text-xs font-medium truncate">{card.title}</p>
          </div>
        </div>
      </Html>
    </group>
  );
}

/* =========================
   Card Modal
   ========================= */

function CardModal() {
  const { selectedCard, setSelectedCard } = useCard();
  const cardRef = useRef(null);

  if (!selectedCard) return null;

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 15;
    const rotateY = (centerX - x) / 15;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.5s ease-out';
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }
  };

  const handleClose = () => setSelectedCard(null);
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={handleBackdropClick}>
      <div className="relative max-w-md w-full mx-4">
        <button onClick={handleClose} className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors z-10">
          <X className="w-8 h-8" />
        </button>

        <div style={{ perspective: '1000px' }} className="w-full">
          <div
            ref={cardRef}
            className="relative cursor-pointer rounded-[16px] bg-[#1F2121] p-4 transition-all duration-500 ease-out w-full"
            style={{
              transformStyle: 'preserve-3d',
              boxShadow:
                'rgba(0, 0, 0, 0.01) 0px 520px 146px 0px, rgba(0, 0, 0, 0.04) 0px 333px 133px 0px, rgba(0, 0, 0, 0.26) 0px 83px 83px 0px, rgba(0, 0, 0, 0.29) 0px 21px 46px 0px',
            }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="relative w-full mb-4 rounded-[16px] bg-white flex items-center justify-center p-8"
              style={{ aspectRatio: '3 / 4' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img loading="lazy" className="max-w-full max-h-full object-contain" alt={selectedCard.alt} src={selectedCard.imageUrl} />
            </div>

            <h3 className="text-white text-lg font-semibold text-center">{selectedCard.title}</h3>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =========================
   Card Galaxy
   ========================= */

function CardGalaxy() {
  const { cards } = useCard();

  const cardPositions = useMemo(() => {
    const positions = [];
    const numCards = cards.length;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;

    for (let i = 0; i < numCards; i++) {
      const y = 1 - (i / (numCards - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = (2 * Math.PI * i) / goldenRatio;
      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;
      const layerRadius = 12 + (i % 3) * 4;

      positions.push({
        x: x * layerRadius,
        y: y * layerRadius,
        z: z * layerRadius,
      });
    }
    return positions;
  }, [cards.length]);

  return (
    <>
      <Sphere args={[2, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#1a1a2e" transparent opacity={0.15} wireframe />
      </Sphere>
      <Sphere args={[12, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.05} wireframe />
      </Sphere>
      <Sphere args={[16, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.03} wireframe />
      </Sphere>
      <Sphere args={[20, 32, 32]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#31b8c6" transparent opacity={0.02} wireframe />
      </Sphere>

      {cards.map((card, i) => (
        <FloatingCard key={card.id} card={card} position={cardPositions[i]} />
      ))}
    </>
  );
}

/* =========================
   Scroll-driven zoom
   ========================= */

// Ties the camera's distance from the galaxy to page scroll progress (0 =
// close/initial, 1 = fully pulled back) instead of the mouse wheel — the
// wheel stays free for normal page scrolling. Only touches the *distance*
// component of the camera's current position, so it composes correctly with
// any rotation the user has dragged in via OrbitControls.
function ScrollZoomRig({ progressRef, controlsRef, minDistance, maxDistance }) {
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const camera = controls?.object;
    if (!camera || !controls) return;

    const target = controls.target;
    const dir = camera.position.clone().sub(target);
    const currentDistance = dir.length() || minDistance;
    const desired = THREE.MathUtils.lerp(minDistance, maxDistance, progressRef.current);
    const nextDistance = THREE.MathUtils.damp(currentDistance, desired, 4, delta);

    dir.setLength(nextDistance);
    camera.position.copy(target).add(dir);
    controls.update();
  });

  return null;
}

function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(pointer: coarse)');
    const read = () => setIsTouch(mq.matches);
    read();
    mq.addEventListener('change', read);
    return () => mq.removeEventListener('change', read);
  }, []);
  return isTouch;
}

/* =========================
   Component Export
   ========================= */

const MIN_DISTANCE = 12;
const MAX_DISTANCE = 30;
// Extra scroll runway the section is pinned for while the camera pulls back —
// once scrolled through, the pin releases and the next section scrolls in
// normally, so "the zoom finishing" and "scroll continuing" are the same
// mechanism rather than two things to keep in sync by hand.
const SCROLL_RUNWAY = 250; // vh

export default function StellarCardGallery({ cards, title = 'Explore Our Partners' }) {
  const isTouch = useIsTouchDevice();
  const containerRef = useRef(null);
  const controlsRef = useRef(null);
  const progressRef = useRef(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    progressRef.current = v;
  });

  // Mobile keeps the scroll-driven zoom (no dragging needed) but drops
  // orbit/pan — a touch-drag there needs to scroll the page like every other
  // section on the site, not spin the camera. Card/star counts are trimmed
  // too, since this is a lot of simultaneous HTML-overlaid WebGL content for
  // a phone GPU.
  const visibleCards = isTouch ? cards.slice(0, 12) : cards;
  const subtitle = isTouch ? 'Scroll to reveal · Tap a logo for a closer look' : 'Scroll to reveal · Drag to look around · Click a logo for a closer look';

  return (
    <CardProvider cards={visibleCards}>
      <div ref={containerRef} className="relative" style={{ height: `${SCROLL_RUNWAY}vh` }}>
        <div className="sticky top-0 h-svh w-full overflow-hidden bg-black">
          <StarfieldBackground starCount={isTouch ? 3000 : 10000} />

          <Canvas
            camera={{ position: [0, 0, MIN_DISTANCE], fov: 60 }}
            className="absolute inset-0 z-10"
            onCreated={({ gl }) => {
              gl.domElement.style.pointerEvents = 'auto';
            }}
          >
            <Suspense fallback={null}>
              <Environment preset="night" />
              <ambientLight intensity={0.4} />
              <pointLight position={[10, 10, 10]} intensity={0.6} />
              <pointLight position={[-10, -10, -10]} intensity={0.3} />
              <CardGalaxy />
              <ScrollZoomRig progressRef={progressRef} controlsRef={controlsRef} minDistance={MIN_DISTANCE} maxDistance={MAX_DISTANCE} />
              <OrbitControls
                ref={controlsRef}
                enablePan={!isTouch}
                enableZoom={false}
                enableRotate={!isTouch}
                autoRotate={false}
                rotateSpeed={0.5}
                panSpeed={0.8}
                target={[0, 0, 0]}
              />
            </Suspense>
          </Canvas>

          <CardModal />

          <div className="absolute top-4 left-4 right-4 z-20 text-white pointer-events-none">
            <h1 className="text-xl sm:text-2xl font-bold mb-1.5 sm:mb-2">{title}</h1>
            <p className="text-xs sm:text-sm opacity-70 max-w-[28rem]">{subtitle}</p>
          </div>
        </div>
      </div>
    </CardProvider>
  );
}
