// components/LessonGenerator.jsx
import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { generateLessonContent } from './GeminiAPI';
import toast, { Toaster } from 'react-hot-toast'; // Import toast from react-hot-toast

function LessonGenerator({ addModule, addLessonToModule, modules }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [topicInfo, setTopicInfo] = useState({
    topic: '',
    audience: 'college students',
    difficulty: 'intermediate'
  });
  const [newModuleName, setNewModuleName] = useState('');
  const [selectedModule, setSelectedModule] = useState('');
  const [buttonAppearance, setButtonAppearance] = useState('default'); // 'default', 'loading', 'success', 'error'
  
  const formRef = useRef(null);
  const buttonRef = useRef(null);
  const animationTimeline = useRef(null);

  // Define button styles based on appearance state
  const getButtonStyles = () => {
    const styles = {
      default: {
        backgroundColor: '#4f46e5', // indigo-600
        color: 'white'
      },
      loading: {
        backgroundColor: '#4338ca', // indigo-700
        color: 'white'
      },
      success: {
        backgroundColor: '#10b981', // green-500
        color: 'white'
      },
      error: {
        backgroundColor: '#ef4444', // red-500
        color: 'white'
      }
    };
    
    return styles[buttonAppearance];
  };

  useEffect(() => {
    // Initialize animations only once
    const ctx = gsap.context(() => {
      gsap.from('.form-element', {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, formRef);

    return () => ctx.revert();
  }, []);

  // Button hover effects using direct DOM manipulation
  useEffect(() => {
    if (!buttonRef.current) return;
    
    const enterHandler = () => {
      if (buttonAppearance === 'default') {
        gsap.to(buttonRef.current, {
          backgroundColor: '#4338ca', // darker indigo on hover
          scale: 1.03,
          boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
          duration: 0.3
        });
      }
    };
    
    const leaveHandler = () => {
      if (buttonAppearance === 'default') {
        gsap.to(buttonRef.current, {
          backgroundColor: '#4f46e5', // back to default indigo
          scale: 1,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        });
      }
    };
    
    const button = buttonRef.current;
    button.addEventListener('mouseenter', enterHandler);
    button.addEventListener('mouseleave', leaveHandler);
    
    return () => {
      button.removeEventListener('mouseenter', enterHandler);
      button.removeEventListener('mouseleave', leaveHandler);
    };
  }, [buttonAppearance, buttonRef]);

  // Update button appearance whenever state changes
  useEffect(() => {
    if (!buttonRef.current) return;
    
    const { backgroundColor, color } = getButtonStyles();
    
    // Force the style directly on the DOM element
    buttonRef.current.style.backgroundColor = backgroundColor;
    buttonRef.current.style.color = color;
    
    // Set appropriate animations based on state
    if (buttonAppearance === 'loading') {
      // Set up loading animations
      animationTimeline.current = gsap.timeline()
        .to(buttonRef.current, {
          scale: 0.98,
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
          duration: 0.3
        })
        .to(buttonRef.current, {
          boxShadow: '0 0 0 4px rgba(79, 70, 229, 0.3)',
          repeat: -1,
          yoyo: true,
          duration: 1
        });
    } else if (buttonAppearance === 'success') {
      // Set up success animations
      if (animationTimeline.current) {
        animationTimeline.current.kill();
      }
      
      animationTimeline.current = gsap.timeline()
        .to(buttonRef.current, {
          scale: 1.05,
          duration: 0.2
        })
        .to(buttonRef.current, {
          scale: 1,
          duration: 0.2
        })
        .to('.form-container', {
          borderColor: '#10b981',
          boxShadow: '0 0 0 3px rgba(16, 185, 129, 0.2)',
          duration: 0.5
        })
        .to('.form-container', {
          borderColor: '#e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          duration: 1,
          delay: 0.5
        });
        
      // Reset to default after delay
      setTimeout(() => {
        setButtonAppearance('default');
      }, 2000);
    } else if (buttonAppearance === 'error') {
      // Set up error animations
      if (animationTimeline.current) {
        animationTimeline.current.kill();
      }
      
      animationTimeline.current = gsap.timeline()
        .to(buttonRef.current, { x: -10, duration: 0.1 })
        .to(buttonRef.current, { x: 10, duration: 0.1 })
        .to(buttonRef.current, { x: -5, duration: 0.1 })
        .to(buttonRef.current, { x: 5, duration: 0.1 })
        .to(buttonRef.current, { x: 0, duration: 0.1 })
        .to('.form-container', {
          borderColor: '#ef4444',
          boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.2)',
          duration: 0.5
        })
        .to('.form-container', {
          borderColor: '#e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          duration: 1, 
          delay: 0.5
        });
        
      // Reset to default after delay
      setTimeout(() => {
        setButtonAppearance('default');
      }, 2000);
    }
    
    return () => {
      if (animationTimeline.current) {
        animationTimeline.current.kill();
      }
    };
  }, [buttonAppearance]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTopicInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setButtonAppearance('loading');

    try {
      const lessonContent = await generateLessonContent(topicInfo);
      
      if (lessonContent) {
        // Create lesson object
        const newLesson = {
          id: Date.now().toString(),
          ...lessonContent,
          createdAt: new Date().toISOString(),
        };

        // Add to existing module or create new one
        let moduleName = '';
        if (selectedModule) {
          const selectedModuleObj = modules.find(m => m.id === selectedModule);
          moduleName = selectedModuleObj ? selectedModuleObj.title : '';
          addLessonToModule(selectedModule, newLesson);
        } else if (newModuleName.trim()) {
          moduleName = newModuleName;
          const newModule = {
            id: Date.now().toString(),
            title: newModuleName,
            lessons: [newLesson],
            createdAt: new Date().toISOString(),
          };
          addModule(newModule);
        }

        // Show success toast notification
        setTimeout(() => {
          toast.success(
            <div className="flex flex-col">
              <span>Lesson successfully generated!</span>
              <span className="text-sm mt-1">
                Open the Course Preview in the sidebar to view your new content.
              </span>
            </div>,
            {
              duration: 5000,
              icon: '🎓',
              style: {
                borderRadius: '10px',
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
              },
            }
          );
        }, 500); // Small delay to ensure toast appears after state updates

        // Success state
        setButtonAppearance('success');

        // Reset form
        setTopicInfo({
          topic: '',
          audience: 'college students',
          difficulty: 'intermediate'
        });
        setNewModuleName('');
        setSelectedModule('');
      }
    } catch (error) {
      console.error("Error generating lesson:", error);
      setButtonAppearance('error');
      
      // Show error toast
      setTimeout(() => {
        toast.error("Failed to generate lesson. Please try again.", {
          duration: 4000,
        });
      }, 500); // Small delay to ensure toast appears after state updates
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div ref={formRef} className="lesson-generator">
      {/* Add Toaster component to handle toast notifications */}
      <Toaster position="top-right" />
      <h2 className="text-3xl font-bold mb-6 form-element">Create New Lesson</h2>
      <div className="form-container border border-gray-200 rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-6 form-element">
            <label className="block text-gray-700 font-medium mb-2">Lesson Topic</label>
            <input
              type="text"
              name="topic"
              value={topicInfo.topic}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Photosynthesis, Linear Algebra, Creative Writing"
              required
            />
          </div>
          
          <div className="mb-6 form-element">
            <label className="block text-gray-700 font-medium mb-2">Target Audience</label>
            <select
              name="audience"
              value={topicInfo.audience}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="elementary students">Elementary Students</option>
              <option value="middle school students">Middle School Students</option>
              <option value="high school students">High School Students</option>
              <option value="college students">College Students</option>
              <option value="adult learners">Adult Learners</option>
              <option value="professional development">Professional Development</option>
            </select>
          </div>
          
          <div className="mb-6 form-element">
            <label className="block text-gray-700 font-medium mb-2">Difficulty Level</label>
            <div className="flex space-x-4">
              {['beginner', 'intermediate', 'advanced'].map(level => (
                <label key={level} className="flex items-center">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={topicInfo.difficulty === level}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="capitalize">{level}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div className="mb-8 form-element">
            <label className="block text-gray-700 font-medium mb-2">Add to Module</label>
            <div className="flex space-x-4">
              <div className="flex-1">
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Create new module</option>
                  {modules.map(module => (
                    <option key={module.id} value={module.id}>{module.title}</option>
                  ))}
                </select>
              </div>
              
              {!selectedModule && (
                <div className="flex-1">
                  <input
                    type="text"
                    value={newModuleName}
                    onChange={(e) => setNewModuleName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="New module name"
                    required={!selectedModule}
                  />
                </div>
              )}
            </div>
          </div>
          
          <button
            ref={buttonRef}
            type="submit"
            disabled={isGenerating}
            className="generate-button w-full font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center form-element shadow-md"
            style={getButtonStyles()}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating Lesson...
              </>
            ) : "Generate Lesson with AI"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LessonGenerator;