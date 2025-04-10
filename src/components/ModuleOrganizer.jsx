// components/ModuleOrganizer.jsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';

gsap.registerPlugin(Draggable);

function ModuleOrganizer({ course, setCourse }) {
  const [expandedModules, setExpandedModules] = useState({});
  const modulesRef = useRef(null);

  useEffect(() => {
    // Initialize expandedModules state with all modules collapsed
    const initialExpandState = {};
    course.modules.forEach(module => {
      initialExpandState[module.id] = false;
    });
    setExpandedModules(initialExpandState);

    // Initialize GSAP animations
    const ctx = gsap.context(() => {
      gsap.from('.module-item', {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out'
      });

      // Make modules draggable
      if (course.modules.length > 0) {
        Draggable.create('.module-item', {
          type: 'y',
          bounds: '.modules-container',
          onDragEnd: function() {
            // Reorder modules based on position
            const modules = document.querySelectorAll('.module-item');
            const newOrder = Array.from(modules).map(el => el.getAttribute('data-id'));
            
            // Update course with new module order
            const reorderedModules = newOrder.map(id => 
              course.modules.find(module => module.id === id));
            
            setCourse(prev => ({...prev, modules: reorderedModules}));
          }
        });
      }
    }, modulesRef);

    return () => ctx.revert();
  }, [course.modules, setCourse]);

  const toggleModule = (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));

    // Animate the lesson list expansion/collapse
    const lessonList = document.querySelector(`.lesson-list-${moduleId}`);
    if (lessonList) {
      gsap.to(lessonList, {
        height: expandedModules[moduleId] ? 0 : 'auto',
        opacity: expandedModules[moduleId] ? 0 : 1,
        duration: 0.3,
        ease: 'power2.inOut'
      });
    }
  };

  const handleDragLesson = (moduleId, lessonId, targetModuleId) => {
    if (moduleId === targetModuleId) return;
    
    // Find the lesson to move
    const sourceModule = course.modules.find(m => m.id === moduleId);
    const lessonToMove = sourceModule.lessons.find(l => l.id === lessonId);
    
    // Remove lesson from source module
    const updatedSourceLessons = sourceModule.lessons.filter(l => l.id !== lessonId);
    
    // Add lesson to target module
    const updatedModules = course.modules.map(module => {
      if (module.id === moduleId) {
        return {...module, lessons: updatedSourceLessons};
      }
      if (module.id === targetModuleId) {
        return {...module, lessons: [...module.lessons, lessonToMove]};
      }
      return module;
    });
    
    setCourse(prev => ({...prev, modules: updatedModules}));
  };

  return (
    <div ref={modulesRef} className="module-organizer">
      <h2 className="text-3xl font-bold mb-6">Organize Course Content</h2>
      
      <div className="modules-container space-y-4">
        {course.modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">No modules created yet. Generate lessons first.</p>
          </div>
        ) : (
          course.modules.map(module => (
            <div 
              key={module.id} 
              className="module-item bg-white rounded-lg shadow border border-gray-200 cursor-grab active:cursor-grabbing" 
              data-id={module.id}
            >
              <div 
                className="module-header flex items-center justify-between p-4 bg-indigo-50 rounded-t-lg"
                onClick={() => toggleModule(module.id)}
              >
                <h3 className="text-xl font-medium">{module.title}</h3>
                <div className="flex items-center">
                  <span className="mr-3 text-sm text-gray-500">{module.lessons.length} lessons</span>
                  <button className="text-gray-500 hover:text-indigo-600 transition-colors">
                    {expandedModules[module.id] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              
              <div className={`lesson-list-${module.id} ${expandedModules[module.id] ? 'block' : 'hidden'} p-4`}>
                {module.lessons.length === 0 ? (
                  <p className="text-gray-500 text-center py-2">No lessons in this module</p>
                ) : (
                  <ul className="space-y-2">
                    {module.lessons.map(lesson => (
                      <li 
                        key={lesson.id}
                        className="lesson-item p-3 bg-gray-50 rounded border border-gray-200 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('lessonId', lesson.id);
                          e.dataTransfer.setData('moduleId', module.id);
                        }}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.preventDefault();
                          const lessonId = e.dataTransfer.getData('lessonId');
                          const sourceModuleId = e.dataTransfer.getData('moduleId');
                          handleDragLesson(sourceModuleId, lessonId, module.id);
                        }}
                      >
                        <span>{lesson.title}</span>
                        <div className="flex space-x-2">
                          <button className="text-gray-500 hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button className="text-gray-500 hover:text-red-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ModuleOrganizer;
