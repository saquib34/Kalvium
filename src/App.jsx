// App.jsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import LessonGenerator from './components/LessonGenerator';
import ModuleOrganizer from './components/ModuleOrganizer';
import ContentEditor from './components/ContentEditor';
import CoursePreview from './components/CoursePreview';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AnimatedBackground from './components/AnimatedBackground';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [course, setCourse] = useState({
    title: '',
    description: '',
    modules: []
  });
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Initialize GSAP animations
    const ctx = gsap.context(() => {
      gsap.from('.app-container', {
        opacity: 0,
        duration: 1.5,
        ease: 'power3.out',
      });
    }, appRef);

    return () => ctx.revert();
  }, []);

  const handleTabChange = (tab) => {
    const tl = gsap.timeline();
    tl.to('.tab-content', {
      opacity: 0,
      y: 20,
      duration: 0.3,
      onComplete: () => setActiveTab(tab)
    });
    tl.to('.tab-content', {
      opacity: 1,
      y: 0,
      duration: 0.5
    });
  };

  const addModule = (module) => {
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, module]
    }));
  };

  const addLessonToModule = (moduleId, lesson) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { ...module, lessons: [...module.lessons, lesson] }
          : module
      )
    }));
  };

  const updateLesson = (moduleId, lessonId, updatedLesson) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => 
        module.id === moduleId 
          ? { 
              ...module, 
              lessons: module.lessons.map(lesson => 
                lesson.id === lessonId ? updatedLesson : lesson
              )
            }
          : module
      )
    }));
  };

  return (
    <div ref={appRef} className="app-wrapper min-h-screen bg-gray-50 text-gray-800">
      <AnimatedBackground />
      <Navbar />
      <div className="app-container flex min-h-[calc(100vh-64px)]">
        <Sidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          course={course}
          setCurrentModule={setCurrentModule}
          setCurrentLesson={setCurrentLesson}
        />
        <main className="flex-1 p-6 ml-64">
          <div className="tab-content bg-white rounded-lg shadow-lg p-6 min-h-[calc(100vh-96px)]">
            {activeTab === 'generator' && (
              <LessonGenerator 
                addModule={addModule} 
                addLessonToModule={addLessonToModule} 
                modules={course.modules}
              />
            )}
            {activeTab === 'organizer' && (
              <ModuleOrganizer 
                course={course} 
                setCourse={setCourse} 
              />
            )}
            {activeTab === 'editor' && (
              <ContentEditor 
                course={course} 
                currentModule={currentModule}
                currentLesson={currentLesson}
                updateLesson={updateLesson}
              />
            )}
            {activeTab === 'preview' && (
              <CoursePreview course={course} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;