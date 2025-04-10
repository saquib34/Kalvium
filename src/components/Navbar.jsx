// components/Navbar.jsx
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

function Navbar() {
  const navRef = useRef(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.nav-item', {
        opacity: 0,
        y: -20,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, navRef);
    
    return () => ctx.revert();
  }, []);

  return (
    <nav ref={navRef} className="bg-indigo-700 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h1 className="text-2xl font-bold nav-item">CourseGPT</h1>
        </div>
        
        <div className="hidden md:flex items-center space-x-6">
          <a href="#" className="nav-item hover:text-indigo-200 transition-colors">Home</a>
          <a href="#" className="nav-item hover:text-indigo-200 transition-colors">Templates</a>
          <a href="#" className="nav-item hover:text-indigo-200 transition-colors">Docs</a>
          <a href="#" className="nav-item hover:text-indigo-200 transition-colors">Support</a>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors nav-item">
            Share Course
          </button>
          <div className="w-10 h-10 rounded-full bg-indigo-800 flex items-center justify-center nav-item">
            <span className="font-medium">AB</span>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
