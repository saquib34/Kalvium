// src/components/AnimatedBackground.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function AnimatedBackground() {
  const bgRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const shapes = [
        { class: 'rounded-full', size: 40, x: '20%', y: '30%' }, // Circle
        { class: 'triangle', size: 50, x: '70%', y: '60%' },     // Triangle
        { class: '', size: 35, x: '50%', y: '80%' },            // Square
      ];

      shapes.forEach((shape, index) => {
        const el = document.createElement('div');
        el.className = `shape ${shape.class} w-[${shape.size}px] h-[${shape.size}px] absolute opacity-10 bg-indigo-600`;
        el.style.left = shape.x;
        el.style.top = shape.y;
        bgRef.current.appendChild(el);

        gsap.to(el, {
          y: '+=50',
          x: '+=30',
          rotation: 360,
          duration: 10 + index * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, bgRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={bgRef} className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Custom styles moved to index.css */}
    </div>
  );
}

export default AnimatedBackground;