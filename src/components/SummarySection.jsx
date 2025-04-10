// components/SummarySection.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function SummarySection({ summary }) {
  const summaryRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation with a highlight effect
      gsap.from('.summary-title', {
        opacity: 0,
        y: -30,
        duration: 0.7,
        ease: 'power3.out',
      });
      
      // Create a highlight effect on the title
      gsap.fromTo('.summary-title-highlight', 
        { width: '0%' },
        { 
          width: '100%', 
          duration: 0.8, 
          delay: 0.3,
          ease: 'power2.inOut'
        }
      );
      
      // Card reveal animation
      gsap.from('.summary-card', {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.4,
        ease: 'power3.out',
      });
      
      // Text animation with a typewriter-like effect
      const summaryText = summaryRef.current.querySelector('.summary-text');
      const text = summaryText.innerHTML;
      
      // Animated bullet points if summary includes list items
      gsap.from('.summary-bullet', {
        opacity: 0,
        x: -20,
        stagger: 0.2,
        duration: 0.5,
        delay: 0.8,
        ease: 'power2.out',
      });
    }, summaryRef);
    
    return () => ctx.revert();
  }, [summary]);

  // Process summary to add bullet points if it contains line breaks
  const processSummary = () => {
    if (!summary) return 'No summary available for this lesson.';
    
    // Check if summary has bullet points format (lines starting with - or *)
    if (summary.match(/^[-*]\s/gm)) {
      const bullets = summary.split(/\n/).map((line, i) => {
        if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
          return `<li class="summary-bullet mb-2">${line.replace(/^[-*]\s/, '')}</li>`;
        }
        return `<p class="mb-3">${line}</p>`;
      }).join('');
      
      return `<ul class="list-disc pl-5 space-y-2">${bullets}</ul>`;
    }
    
    // Otherwise, return paragraphs
    return summary;
  };

  return (
    <div ref={summaryRef} className="summary-section">
      <div className="relative mb-6">
        <h3 className="summary-title text-2xl md:text-3xl font-bold relative inline-block">
          Lesson Summary
          <div className="summary-title-highlight absolute bottom-0 left-0 h-1 bg-indigo-500 rounded"></div>
        </h3>
      </div>
      
      <div className="summary-card bg-gradient-to-br from-indigo-50 to-white p-6 md:p-8 rounded-lg border border-indigo-100 shadow-sm">
        <div className="summary-text text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: processSummary() }}></div>
      </div>
    </div>
  );
}

export default SummarySection;