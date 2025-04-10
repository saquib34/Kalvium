// components/CourseSlide.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function CourseSlide({ slideData, slideNumber, totalSlides }) {
  const slideRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Clear any existing animations
      gsap.killTweensOf(slideRef.current.querySelectorAll('*'));
      
      // Animate slide title with a bounce effect
      gsap.from('.slide-title', {
        opacity: 0,
        y: -40,
        duration: 0.7,
        ease: 'back.out(1.4)',
      });
      
      // Animate progress indicator with a drawing effect
      gsap.from('.slide-progress', {
        scaleX: 0,
        transformOrigin: 'left center',
        duration: 0.8,
        ease: 'power3.out',
      });
      
      // Animate slide number with a fade and scale
      gsap.from('.slide-number', {
        opacity: 0,
        scale: 0.5,
        duration: 0.6,
        delay: 0.2,
        ease: 'power2.out',
      });
      
      // Animate content paragraphs with staggered entry
      gsap.from('.slide-body p, .slide-body li, .slide-body h1, .slide-body h2, .slide-body h3', {
        opacity: 0,
        y: 30,
        stagger: 0.15,
        duration: 0.6,
        delay: 0.3,
        ease: 'power2.out',
      });
      
      // Animate any images in the content
      gsap.from('.slide-body img', {
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        delay: 0.4,
        ease: 'power2.out',
      });
    }, slideRef);
    
    return () => ctx.revert();
  }, [slideData]);

  if (!slideData) return null;

  // Parse content to handle HTML properly
  const createContentMarkup = () => {
    return { __html: slideData.content.replace(/\n/g, '<br>') };
  };

  return (
    <div ref={slideRef} className="course-slide">
      <div className="slide-header mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
          <h3 className="text-2xl md:text-3xl font-bold slide-title mb-2 sm:mb-0">{slideData.title}</h3>
          <span className="slide-number text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
            Slide {slideNumber} of {totalSlides}
          </span>
        </div>
        <div className="slide-progress-container h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="slide-progress h-full bg-indigo-600 rounded-full"
            style={{ width: `${(slideNumber / totalSlides) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="slide-body prose max-w-none bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <div dangerouslySetInnerHTML={createContentMarkup()}></div>
      </div>
    </div>
  );
}

export default CourseSlide;