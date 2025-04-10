// components/Sidebar.jsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';

function Sidebar({ activeTab, onTabChange, course, setCurrentModule, setCurrentLesson }) {
  const sidebarRef = useRef(null);
  const [expandedModule, setExpandedModule] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.sidebar-item', {
        opacity: 0,
        x: -20,
        stagger: 0.1,
        duration: 0.6,
        ease: 'power3.out',
      });
    }, sidebarRef);
    
    return () => ctx.revert();
  }, []);

  // Highlight animation for hovered items
  useEffect(() => {
    if (hoveredItem) {
      gsap.to(`#${hoveredItem}`, {
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        scale: 1.02,
        duration: 0.3,
        ease: 'power2.out'
      });
    }
    
    return () => {
      if (hoveredItem) {
        gsap.to(`#${hoveredItem}`, {
          backgroundColor: 'transparent',
          scale: 1,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };
  }, [hoveredItem]);

  const tabs = [
    { id: 'generator', label: 'Lesson Generator', icon: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4', description: 'Create AI-powered lessons with customizable topics and difficulty levels' },
    { id: 'organizer', label: 'Module Organizer', icon: 'M4 6h16M4 10h16M4 14h16M4 18h16', description: 'Arrange and organize your course modules and lessons' },
    { id: 'editor', label: 'Content Editor', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', description: 'Edit and refine your lesson content and materials' },
    { id: 'preview', label: 'Course Preview', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', description: 'View your course as students will see it with interactive slides' },
  ];

  const handleLessonSelect = (moduleId, lessonId) => {
    setCurrentModule(moduleId);
    setCurrentLesson(lessonId);
    
    // Animation for selection
    gsap.timeline()
      .to(`#lesson-${lessonId}`, {
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        color: 'white',
        duration: 0.3
      })
      .to(`#lesson-${lessonId}`, {
        backgroundColor: 'transparent',
        duration: 0.5,
        delay: 0.2
      });
    
    onTabChange('editor');
  };

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
    
    // Animation for expanding/collapsing
    if (expandedModule !== moduleId) {
      gsap.from(`#module-${moduleId} .lesson-item`, {
        opacity: 0,
        y: -10,
        stagger: 0.05,
        duration: 0.3,
        delay: 0.1
      });
    }
  };

  return (
    <div ref={sidebarRef} className="sidebar fixed left-0 top-16 bottom-0 w-64 bg-gray-800 text-white overflow-y-auto">
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6 sidebar-item">Course Builder</h2>
        
        <ul className="space-y-2 mb-8">
          {tabs.map(tab => (
            <li key={tab.id} className="sidebar-item">
              <button
                id={`tab-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                onMouseEnter={() => setHoveredItem(`tab-${tab.id}`)}
                onMouseLeave={() => setHoveredItem(null)}
                className={`flex items-center w-full px-4 py-3 rounded-lg transition-all relative overflow-hidden ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                <div>
                  <div className="font-medium">{tab.label}</div>
                  {activeTab === tab.id && (
                    <div className="text-xs text-indigo-200 mt-1 opacity-80">
                      {tab.description}
                    </div>
                  )}
                </div>
                {activeTab === tab.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-300"></div>
                )}
              </button>
            </li>
          ))}
        </ul>
        
        {course.modules.length > 0 && (
          <div className="sidebar-item">
            <h3 className="text-lg font-medium mb-3 text-gray-300 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Your Modules
            </h3>
            <div className="space-y-3">
              {course.modules.map(module => (
                <div 
                  key={module.id} 
                  id={`module-${module.id}`}
                  className="text-gray-300 border-l-2 border-gray-700 pl-2 py-1"
                >
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="font-medium mb-1 flex items-center justify-between w-full hover:text-indigo-300 transition-colors"
                  >
                    <span className="truncate">{module.title}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 transition-transform ${expandedModule === module.id ? 'transform rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {(expandedModule === module.id || module.lessons.length <= 3) && (
                    <ul className="pl-3 space-y-1 mt-1">
                      {module.lessons.map(lesson => (
                        <li key={lesson.id} className="lesson-item">
                          <button
                            id={`lesson-${lesson.id}`}
                            onClick={() => handleLessonSelect(module.id, lesson.id)}
                            onMouseEnter={() => setHoveredItem(`lesson-${lesson.id}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                            className="text-left text-sm text-gray-400 hover:text-white transition-colors truncate w-full py-1 px-2 rounded"
                          >
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              {lesson.title}
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-3 sidebar-item">
        <div className="text-xs text-gray-500 text-center">
          {activeTab === 'generator' && "Create AI-powered lessons"}
          {activeTab === 'organizer' && "Organize your course structure"}
          {activeTab === 'editor' && "Edit your lesson content"}
          {activeTab === 'preview' && "Preview your course presentation"}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;