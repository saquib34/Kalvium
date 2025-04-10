// components/CoursePreview.jsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import CourseSlide from './CourseSlide';
import VideoEmbed from './VideoEmbed';
import MCQSection from './MCQSection';
import SummarySection from './SummarySection';
import { searchYouTubeVideo } from '../utils/youtubeSearch';

function CoursePreview({ course }) {
  const [currentModule, setCurrentModule] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMCQs, setShowMCQs] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [videoData, setVideoData] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // New state to track transitions
  const previewRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (course && course.modules && course.modules.length > 0) {
      setCurrentModule(course.modules[0].id);
      if (course.modules[0].lessons && course.modules[0].lessons.length > 0) {
        setCurrentLesson(course.modules[0].lessons[0].id);
      }
    }
  }, [course]);

  useEffect(() => {
    console.log("CoursePreview mounted");
    
    // Only run animations if DOM elements exist
    if (previewRef.current) {
      const ctx = gsap.context(() => {
        // Limit animations to prevent potential issues
        try {
          // Main section animation only
          gsap.from('.preview-section', {
            opacity: 0,
            y: 30,
            duration: 0.8,
            ease: 'power3.out',
          });
          
          // Title animations
          gsap.from('.course-title', {
            opacity: 0,
            y: -20,
            duration: 0.7,
            ease: 'power2.out',
          });
        } catch (error) {
          console.error("Animation error:", error);
        }
      }, previewRef);
      
      return () => {
        console.log("Cleaning up animations");
        ctx.revert();
      };
    }
  }, []);

  const getCurrentLessonData = () => {
    if (!currentModule || !currentLesson || !course || !course.modules) return null;
    
    const moduleObj = course.modules.find(m => m.id === currentModule);
    if (!moduleObj || !moduleObj.lessons) return null;
    
    return moduleObj.lessons.find(l => l.id === currentLesson) || null;
  };

  const lessonData = getCurrentLessonData();

  // Validate MCQ data before trying to show it
  const validateMCQs = () => {
    if (!lessonData) return false;
    if (!lessonData.mcqs) return false;
    return Array.isArray(lessonData.mcqs) && lessonData.mcqs.length > 0;
  };

  const hasMCQs = validateMCQs();
  
  // Log state changes for debugging
  useEffect(() => {
    console.log("Course state changed:", {
      currentModule,
      currentLesson,
      currentSlide,
      showMCQs,
      showSummary,
      hasMCQs,
      isTransitioning
    });
  }, [currentModule, currentLesson, currentSlide, showMCQs, showSummary, hasMCQs, isTransitioning]);

  // Fetch YouTube video when entering summary section
  useEffect(() => {
    if (showSummary && lessonData && !videoData && !loadingVideo) {
      const fetchVideo = async () => {
        try {
          setLoadingVideo(true);
          const videoTopic = lessonData.videoTopic || `${lessonData.title} tutorial`;
          const video = await searchYouTubeVideo(videoTopic);
          setVideoData(video);
        } catch (error) {
          console.error("Error fetching video:", error);
          // Set fallback video data
          setVideoData({
            videoId: "dQw4w9WgXcQ",
            title: lessonData.videoTopic || `${lessonData.title} Tutorial`,
            thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg",
            duration: 0,
            views: 0,
            channelName: "Unknown",
            description: `${lessonData.title} Tutorial`
          });
        } finally {
          setLoadingVideo(false);
        }
      };
      
      fetchVideo();
    }
  }, [showSummary, lessonData, videoData, loadingVideo]);

  // Reset video data when lesson changes
  useEffect(() => {
    setVideoData(null);
  }, [currentLesson]);

  // Function to handle next slide with proper transitions
  const nextSlide = () => {
    if (!lessonData || !lessonData.slides || isTransitioning) return;
    
    console.log("Next button clicked");
    setIsTransitioning(true);
    
    if (currentSlide < lessonData.slides.length - 1) {
      // Animate current slide out
      gsap.to('.preview-section', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Update state
          setCurrentSlide(prev => prev + 1);
          
          // Animate new slide in
          setTimeout(() => {
            gsap.to('.preview-section', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              }
            });
          }, 50);
        }
      });
    } else if (!showMCQs) {
      // Transition to MCQs section
      gsap.to('.preview-section', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          // Check if we have MCQs to show
          if (hasMCQs) {
            setShowMCQs(true);
            
            // Wait for state update before animating back in
            setTimeout(() => {
              gsap.to('.preview-section', {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                  setIsTransitioning(false);
                }
              });
            }, 300); // Increased from 100ms to 300ms to ensure MCQ component is fully rendered
          } else {
            // Skip MCQs if none available
            setShowSummary(true);
            
            setTimeout(() => {
              gsap.to('.preview-section', {
                opacity: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out',
                onComplete: () => {
                  setIsTransitioning(false);
                }
              });
            }, 300); // Also increased here for consistency
          }
        }
      });
    } else if (!showSummary) {
      // Transition to summary section
      gsap.to('.preview-section', {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowMCQs(false);
          setShowSummary(true);
          
          setTimeout(() => {
            gsap.to('.preview-section', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              }
            });
          }, 300); // Increased timeout for consistency
        }
      });
    } else {
      setIsTransitioning(false);
    }
  };

  // Function to handle previous slide with proper transitions
  const prevSlide = () => {
    if (!lessonData || isTransitioning) return;
    
    console.log("Previous button clicked");
    setIsTransitioning(true);
    
    if (showSummary) {
      // Transition from summary back to MCQs
      gsap.to('.preview-section', {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowSummary(false);
          
          // Go back to MCQs if we have them, or to last slide
          if (hasMCQs) {
            setShowMCQs(true);
          } else {
            setCurrentSlide(lessonData.slides.length - 1);
          }
          
          setTimeout(() => {
            gsap.to('.preview-section', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              }
            });
          }, 300); // Increased timeout
        }
      });
    } else if (showMCQs) {
      // Transition from MCQs back to last slide
      gsap.to('.preview-section', {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setShowMCQs(false);
          setCurrentSlide(lessonData.slides.length - 1);
          
          setTimeout(() => {
            gsap.to('.preview-section', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              }
            });
          }, 300); // Increased timeout
        }
      });
    } else if (currentSlide > 0) {
      // Transition to previous slide
      gsap.to('.preview-section', {
        opacity: 0,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          setCurrentSlide(prev => prev - 1);
          
          setTimeout(() => {
            gsap.to('.preview-section', {
              opacity: 1,
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              onComplete: () => {
                setIsTransitioning(false);
              }
            });
          }, 50);
        }
      });
    } else {
      setIsTransitioning(false);
    }
  };
  
  const changeLesson = (moduleId, lessonId) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    gsap.to('.preview-content', {
      opacity: 0,
      scale: 0.95,
      duration: 0.5,
      ease: 'power2.in',
      onComplete: () => {
        setCurrentModule(moduleId);
        setCurrentLesson(lessonId);
        setCurrentSlide(0);
        setShowMCQs(false);
        setShowSummary(false);
        
        // Wait for state updates to complete
        setTimeout(() => {
          gsap.to('.preview-content', {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
              setIsTransitioning(false);
            }
          });
        }, 300); // Increased timeout
      }
    });
  };

  const toggleMobileNav = () => {
    if (mobileNavOpen) {
      // Animate closing
      gsap.to('.mobile-course-nav', {
        x: '-100%',
        duration: 0.4,
        ease: 'power2.inOut',
        onComplete: () => {
          setMobileNavOpen(false);
        }
      });
    } else {
      setMobileNavOpen(true);
      // Animate opening
      gsap.fromTo('.mobile-course-nav',
        { x: '-100%' },
        {
          x: '0%',
          duration: 0.5,
          ease: 'power3.out'
        }
      );
    }
  };

  return (
    <div ref={previewRef} className="course-preview">
      <h2 className="course-title text-3xl font-bold mb-6">Course Preview</h2>
      
      {/* Mobile Navigation Toggle Button */}
      <div className="lg:hidden mb-4">
        <button 
          onClick={toggleMobileNav}
          className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Course Modules
        </button>
      </div>
      
      {/* Mobile Navigation Menu - Fixed position overlay */}
      {mobileNavOpen && course && course.modules && (
        <div className="mobile-course-nav fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={toggleMobileNav}></div>
          <div className="absolute top-0 left-0 h-full w-3/4 max-w-xs bg-white shadow-lg p-4 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Course Modules</h3>
              <button onClick={toggleMobileNav} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="module-list">
              {!course.modules || course.modules.length === 0 ? (
                <p className="text-gray-500">No modules created yet</p>
              ) : (
                course.modules.map(module => (
                  <div key={module.id} className="module-nav-item mb-4">
                    <h4 className="font-medium mb-2 bg-gray-100 p-2 rounded">{module.title}</h4>
                    <ul className="pl-4">
                      {module.lessons && module.lessons.map(lesson => (
                        <li key={lesson.id} className="mb-2">
                          <button
                            onClick={() => {
                              changeLesson(module.id, lesson.id);
                              toggleMobileNav();
                            }}
                            className={`lesson-button text-left text-sm w-full px-2 py-1 rounded ${
                              currentLesson === lesson.id
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            {lesson.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="flex flex-wrap">
        {/* Desktop Navigation - Hidden on mobile */}
        <div className="hidden lg:block lg:w-1/4 pr-4 mb-4 lg:mb-0">
          <div className="course-navigation bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-4">Course Modules</h3>
            <div className="module-list">
              {!course || !course.modules || course.modules.length === 0 ? (
                <p className="text-gray-500">No modules created yet</p>
              ) : (
                course.modules.map(module => (
                  <div key={module.id} className="module-nav-item mb-4">
                    <h4 className="font-medium mb-2 bg-gray-50 p-2 rounded">{module.title}</h4>
                    <ul className="pl-4">
                      {module.lessons && module.lessons.map(lesson => (
                        <li key={lesson.id} className="mb-2">
                          <button
                            onClick={() => changeLesson(module.id, lesson.id)}
                            className={`lesson-button text-left text-sm w-full px-3 py-2 rounded transition-all duration-200 ${
                              currentLesson === lesson.id
                                ? 'bg-indigo-100 text-indigo-700 shadow-sm'
                                : 'hover:bg-gray-100'
                            }`}
                            disabled={isTransitioning}
                          >
                            {lesson.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="w-full lg:w-3/4">
          <div ref={contentRef} className="preview-content bg-white rounded-lg shadow-lg p-4 md:p-6">
            {!lessonData ? (
              <div className="text-center py-12">
                <div className="mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <p className="text-gray-500 text-lg">Select a lesson from the navigation menu to begin</p>
              </div>
            ) : (
              <>
                <div className="lesson-header mb-6">
                  <h3 className="text-2xl font-bold">{lessonData.title}</h3>
                  <p className="text-gray-600 mt-2">{lessonData.description}</p>
                </div>
                
                <div className="preview-section min-h-[400px]">
                  {!showMCQs && !showSummary && lessonData.slides && (
                    <div className="slide-content">
                      <CourseSlide 
                        slideData={lessonData.slides[currentSlide]} 
                        slideNumber={currentSlide + 1}
                        totalSlides={lessonData.slides.length}
                      />
                    </div>
                  )}
                  
                  {showMCQs && !showSummary && (
                    <div className="mcq-content">
                      <MCQSection 
                        mcqs={hasMCQs ? lessonData.mcqs : []}
                        parentControlled={true} // Added prop to disable MCQSection's own animations
                      />
                    </div>
                  )}
                  
                  {showSummary && (
                    <div className="summary-video-section">
                      <SummarySection summary={lessonData.summary} />
                      
                      <div className="video-section mt-8">
                        <h4 className="text-xl font-semibold mb-4">Recommended Video</h4>
                        
                        {loadingVideo ? (
                          <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                          </div>
                        ) : videoData ? (
                          <VideoEmbed 
                            videoId={videoData.videoId} 
                            title={videoData.title}
                            thumbnail={videoData.thumbnail}
                            duration={videoData.duration}
                            views={videoData.views}
                            channelName={videoData.channelName}
                            description={videoData.description}
                          />
                        ) : (
                          <div className="bg-gray-100 rounded-lg p-6 text-center">
                            <p className="text-gray-500">Loading recommended video...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="navigation-buttons flex justify-between mt-8" id="nav-buttons">
                  <button
                    onClick={prevSlide}
                    id="prev-button"
                    disabled={(currentSlide === 0 && !showMCQs && !showSummary) || isTransitioning}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: (currentSlide === 0 && !showMCQs && !showSummary) || isTransitioning ? '#d1d5db' : '#4b5563',
                      color: 'white',
                      cursor: (currentSlide === 0 && !showMCQs && !showSummary) || isTransitioning ? 'not-allowed' : 'pointer',
                      border: 'none',
                      margin: '0 10px',
                      opacity: isTransitioning ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span style={{marginRight: '8px'}}>⬅️</span>
                    Previous
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    id="next-button"
                    disabled={showSummary || isTransitioning}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: showSummary || isTransitioning ? '#d1d5db' : '#2563eb',
                      color: 'white',
                      cursor: showSummary || isTransitioning ? 'not-allowed' : 'pointer',
                      border: 'none',
                      margin: '0 10px',
                      opacity: isTransitioning ? 0.7 : 1,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Next
                    <span style={{marginLeft: '8px'}}>➡️</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CoursePreview;