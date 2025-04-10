// components/ContentEditor.jsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import VideoEmbed from './VideoEmbed';
import MCQSection from './MCQSection';
import { searchYouTubeVideo } from './GeminiAPI';

function ContentEditor({ course, currentModule, currentLesson, updateLesson }) {
  const [lessonData, setLessonData] = useState(null);
  const [activeTab, setActiveTab] = useState('slides');
  const [video, setVideo] = useState(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (currentModule && currentLesson) {
      const moduleObj = course.modules.find(m => m.id === currentModule);
      if (moduleObj) {
        const lessonObj = moduleObj.lessons.find(l => l.id === currentLesson);
        if (lessonObj) {
          setLessonData(lessonObj);
          
          // Fetch video for the lesson topic
          const fetchVideo = async () => {
            const videoData = await searchYouTubeVideo(lessonObj.videoTopic || lessonObj.title);
            setVideo(videoData);
          };
          
          fetchVideo();
        }
      }
    }
  }, [course, currentModule, currentLesson]);

  useEffect(() => {
    if (lessonData) {
      const ctx = gsap.context(() => {
        gsap.from('.editor-section', {
          opacity: 0,
          y: 20,
          duration: 0.8,
          ease: 'power3.out',
        });
        
        gsap.from('.tab-button', {
          opacity: 0,
          y: -10,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power2.out',
        });
      }, editorRef);
      
      return () => ctx.revert();
    }
  }, [lessonData, activeTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLessonData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSlideChange = (index, field, value) => {
    const updatedSlides = [...lessonData.slides];
    updatedSlides[index] = { ...updatedSlides[index], [field]: value };
    
    setLessonData(prev => ({
      ...prev,
      slides: updatedSlides
    }));
  };

  const handleMCQChange = (index, field, value, optionIndex) => {
    const updatedMCQs = [...lessonData.mcqs];
    
    if (field === 'option' && optionIndex !== undefined) {
      const updatedOptions = [...updatedMCQs[index].options];
      updatedOptions[optionIndex] = value;
      updatedMCQs[index] = { ...updatedMCQs[index], options: updatedOptions };
    } else {
      updatedMCQs[index] = { ...updatedMCQs[index], [field]: value };
    }
    
    setLessonData(prev => ({
      ...prev,
      mcqs: updatedMCQs
    }));
  };

  const saveChanges = () => {
    if (lessonData && currentModule && currentLesson) {
      updateLesson(currentModule, currentLesson, lessonData);
      
      // Show success animation
      gsap.to('.save-button', {
        backgroundColor: '#10b981',
        scale: 1.05,
        duration: 0.3,
        onComplete: () => {
          gsap.to('.save-button', {
            backgroundColor: '#4f46e5',
            scale: 1,
            duration: 0.3,
            delay: 0.5
          });
        }
      });
    }
  };

  if (!lessonData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Select a lesson to edit</p>
      </div>
    );
  }

  return (
    <div ref={editorRef} className="content-editor">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">{lessonData.title}</h2>
        <button 
          onClick={saveChanges}
          className="save-button bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300"
        >
          Save Changes
        </button>
      </div>
      
      <div className="editor-section mb-8">
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Lesson Title</label>
          <input
            type="text"
            name="title"
            value={lessonData.title}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={lessonData.description}
            onChange={handleInputChange}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
            />
          </div>
        </div>
        
        <div className="tabs-container mb-6">
          <div className="flex border-b border-gray-200">
            {['slides', 'learning-outcomes', 'mcqs', 'video', 'summary'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`tab-button px-6 py-3 font-medium transition-colors ${
                  activeTab === tab 
                    ? 'text-indigo-600 border-b-2 border-indigo-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              </button>
            ))}
          </div>
        </div>
        
        <div className="tab-content editor-section">
          {activeTab === 'slides' && (
            <div className="slides-editor">
              <h3 className="text-xl font-semibold mb-4">Content Slides</h3>
              <div className="space-y-6">
                {lessonData.slides.map((slide, index) => (
                  <div key={index} className="slide-item p-4 border border-gray-200 rounded-lg">
                    <div className="mb-3">
                      <label className="block text-gray-700 font-medium mb-2">Slide {index + 1} Title</label>
                      <input
                        type="text"
                        value={slide.title}
                        onChange={(e) => handleSlideChange(index, 'title', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Slide Content</label>
                      <textarea
                        value={slide.content}
                        onChange={(e) => handleSlideChange(index, 'content', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'learning-outcomes' && (
            <div className="learning-outcomes-editor">
              <h3 className="text-xl font-semibold mb-4">Learning Outcomes</h3>
              <div className="space-y-4">
                {lessonData.learningOutcomes.map((outcome, index) => (
                  <div key={index} className="outcome-item flex">
                    <input
                      type="text"
                      value={outcome}
                      onChange={(e) => {
                        const updated = [...lessonData.learningOutcomes];
                        updated[index] = e.target.value;
                        setLessonData(prev => ({...prev, learningOutcomes: updated}));
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                ))}
                <button 
                  onClick={() => {
                    setLessonData(prev => ({
                      ...prev, 
                      learningOutcomes: [...prev.learningOutcomes, "After this lesson, students will be able to..."]
                    }));
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Learning Outcome
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'mcqs' && (
            <div className="mcqs-editor">
              <h3 className="text-xl font-semibold mb-4">Multiple Choice Questions</h3>
              <div className="space-y-6">
                {lessonData.mcqs.map((mcq, index) => (
                  <div key={index} className="mcq-item p-4 border border-gray-200 rounded-lg">
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Question {index + 1}</label>
                      <input
                        type="text"
                        value={mcq.question}
                        onChange={(e) => handleMCQChange(index, 'question', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 font-medium mb-2">Options</label>
                      {mcq.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center mb-2">
                          <input
                            type="radio"
                            name={`correct-${index}`}
                            checked={mcq.correctAnswer === optIndex}
                            onChange={() => handleMCQChange(index, 'correctAnswer', optIndex)}
                            className="mr-2"
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleMCQChange(index, 'option', e.target.value, optIndex)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {activeTab === 'video' && (
            <div className="video-editor">
              <h3 className="text-xl font-semibold mb-4">Recommended Video</h3>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Video Topic</label>
                <input
                  type="text"
                  name="videoTopic"
                  value={lessonData.videoTopic}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              {video && (
                <div className="video-preview mt-4">
                  <VideoEmbed videoId={video.videoId} title={video.title} />
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'summary' && (
            <div className="summary-editor">
              <h3 className="text-xl font-semibold mb-4">Lesson Summary</h3>
              <textarea
                name="summary"
                value={lessonData.summary}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[200px]"
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  export default ContentEditor;