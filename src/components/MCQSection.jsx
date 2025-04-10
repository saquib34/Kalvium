// components/MCQSection.jsx
import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Added parentControlled prop to allow disabling internal animations when used in CoursePreview
function MCQSection({ mcqs, parentControlled = false }) {
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [componentReady, setComponentReady] = useState(false);
  const mcqRef = useRef(null);
  
  // Enhanced debug log to see mcqs data structure
  console.log("MCQs data:", mcqs);
  if (mcqs && mcqs.length > 0) {
    console.log("First MCQ structure:", JSON.stringify(mcqs[0], null, 2));
  }
  console.log("MCQSection rendering, parentControlled:", parentControlled);
  
  useEffect(() => {
    // Initialize answers with empty values
    const initialAnswers = {};
    if (mcqs && mcqs.length > 0) {
      mcqs.forEach((_, index) => {
        initialAnswers[index] = null;
      });
    }
    setAnswers(initialAnswers);
    
    // Set state to ready immediately if parent is controlling animations
    if (parentControlled) {
      setComponentReady(true);
    } else {
      // Otherwise use timeout for standalone operation
      const renderTimeout = setTimeout(() => {
        setComponentReady(true);
      }, 300);
      
      return () => clearTimeout(renderTimeout);
    }
  }, [mcqs, parentControlled]);
  
  // Run animations only if not controlled by parent and component is ready
  useEffect(() => {
    if (!parentControlled && componentReady && mcqRef.current) {
      console.log("Running MCQ animations (internal)");
      
      // Make component visible before animations
      gsap.set(mcqRef.current, { 
        opacity: 1, 
        visibility: 'visible',
        display: 'block'
      });
      
      // Add a small delay before starting animations
      setTimeout(() => {
        const ctx = gsap.context(() => {
          // Regular animations from before...
          gsap.from('.mcq-title', {
            opacity: 0,
            y: -30,
            duration: 0.7,
            ease: 'back.out(1.5)',
          });
          
          gsap.from('.mcq-item', {
            opacity: 0,
            y: 50,
            scale: 0.95,
            stagger: 0.2,
            duration: 0.7,
            ease: 'power3.out',
          });
          
          gsap.from('.mcq-item p', {
            opacity: 0,
            x: -20,
            stagger: 0.3,
            duration: 0.5,
            delay: 0.2,
            ease: 'power2.out',
          });
          
          gsap.from('.option-item', {
            opacity: 0,
            x: -30,
            stagger: 0.1,
            duration: 0.5,
            delay: 0.5,
            ease: 'power2.out',
          });
          
          gsap.from('.check-button', {
            opacity: 0,
            scale: 0.8,
            y: 20,
            duration: 0.6,
            delay: 0.8,
            ease: 'elastic.out(1, 0.5)',
          });
        }, mcqRef);
      }, 50);
      
      return () => ctx.revert();
    }
  }, [componentReady, parentControlled]);

  // Function to safely get options for an MCQ
  const getOptions = (mcq) => {
    if (!mcq) {
      console.error("Missing MCQ data");
      return ["Option 1", "Option 2", "Option 3", "Option 4"];
    }
    
    if (Array.isArray(mcq.options)) {
      return mcq.options;
    }
    
    if (typeof mcq.options === 'string') {
      try {
        const parsed = JSON.parse(mcq.options);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.error("Error parsing options string:", e);
      }
    }
    
    if (mcq.correctAnswer) {
      if (Array.isArray(mcq.correctAnswer)) {
        return mcq.correctAnswer;
      }
      return [mcq.correctAnswer];
    }
    
    return ["Option 1", "Option 2", "Option 3", "Option 4"];
  };

  const handleAnswerSelect = (questionIndex, optionIndex) => {
    console.log(`Selected answer: Question ${questionIndex}, Option ${optionIndex}`);
    
    // Animate the selected option
    gsap.to(`.question-${questionIndex} .option-${optionIndex}`, {
      backgroundColor: '#e0e7ff',
      borderColor: '#6366f1',
      boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.2)',
      scale: 1.02,
      duration: 0.3,
      ease: 'power2.out',
    });
    
    // Reset styles of previously selected options
    if (answers[questionIndex] !== null && answers[questionIndex] !== optionIndex) {
      gsap.to(`.question-${questionIndex} .option-${answers[questionIndex]}`, {
        backgroundColor: '#f9fafb',
        borderColor: '#e5e7eb',
        boxShadow: 'none',
        scale: 1,
        duration: 0.3,
      });
    }
    
    setAnswers(prev => {
      const newAnswers = { ...prev };
      newAnswers[questionIndex] = optionIndex;
      console.log("Updated answers:", newAnswers);
      return newAnswers;
    });
    
    // Pulse animation for the check button if all questions are answered
    const updatedAnswers = { ...answers, [questionIndex]: optionIndex };
    const allAnswered = Object.keys(updatedAnswers).length === mcqs.length && 
                       Object.values(updatedAnswers).every(v => v !== null);
                       
    if (allAnswered) {
      gsap.to('.check-button', {
        scale: 1.1,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut',
      });
    }
  };

  const checkAnswers = () => {
    console.log("Checking answers:", answers);
    setShowResults(true);
    
    // Animation for showing results
    gsap.to('.mcq-item', {
      backgroundColor: '#f9fafb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      stagger: 0.15,
      duration: 0.4,
    });
    
    // Highlight correct answers with a glow effect
    gsap.to('.correct-answer', {
      backgroundColor: '#d1fae5',
      boxShadow: '0 0 15px rgba(16, 185, 129, 0.3)',
      scale: 1.02,
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out',
    });
    
    // Highlight incorrect answers
    gsap.to('.incorrect-answer', {
      backgroundColor: '#fee2e2',
      boxShadow: '0 0 10px rgba(239, 68, 68, 0.2)',
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out',
    });
    
    // Animate the result messages
    gsap.fromTo('.result-message',
      { opacity: 0, y: 10 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.2,
        delay: 0.5,
        ease: 'power2.out'
      }
    );
  };

  const resetQuiz = () => {
    console.log("Resetting quiz");
    
    // Animate out before state change
    gsap.to('.mcq-item', {
      opacity: 0.5,
      y: 10,
      duration: 0.3,
      stagger: 0.1,
      onComplete: () => {
        setAnswers({});
        setShowResults(false);
        
        // Animate back in after state change
        setTimeout(() => {
          gsap.to('.mcq-item', {
            opacity: 1,
            y: 0,
            backgroundColor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
            clearProps: 'backgroundColor,boxShadow,scale',
            duration: 0.4,
            stagger: 0.1,
          });
        }, 50); // Add small timeout to ensure state update has completed
      }
    });
  };

  // Function to get the correct answer text based on MCQ data
  const getCorrectAnswerText = (mcq) => {
    if (!mcq) return "Not available";
    
    if (typeof mcq.correctAnswer === 'string') {
      return mcq.correctAnswer;
    }
    
    if (typeof mcq.correctAnswer === 'number') {
      const options = getOptions(mcq);
      if (options.length > mcq.correctAnswer) {
        return options[mcq.correctAnswer];
      }
    }
    
    return "Not available";
  };

  // Handle null/undefined mcqs with a more graceful fallback
  if (!mcqs || !Array.isArray(mcqs) || mcqs.length === 0) {
    console.error("MCQs data issue:", { mcqs });
    return (
      <div className="text-gray-500 text-center py-8 bg-white rounded-lg shadow-md p-6 min-h-[300px] flex flex-col justify-center items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg">No quiz questions available for this lesson.</p>
        <p className="text-sm mt-2">Try selecting a different lesson or contact your instructor.</p>
      </div>
    );
  }

  // Calculate if all questions are answered
  const allQuestionsAnswered = mcqs.every((_, index) => answers[index] !== undefined && answers[index] !== null);
  console.log("All questions answered:", allQuestionsAnswered);

  // Show loading indicator while not ready
  if (!componentReady && !parentControlled) {
    return (
      <div className="loading-mcq p-6 bg-white rounded-lg shadow-md min-h-[300px]">
        <div className="flex justify-center h-full items-center">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-6 py-1">
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Determine the correct inline style based on whether parent controls animations
  const containerStyle = parentControlled 
    ? { opacity: 1, visibility: 'visible', display: 'block' } // Always visible when parent controlled
    : { opacity: 0.8, visibility: 'visible', display: 'block' }; // Default style for standalone use

  return (
    <div 
      ref={mcqRef} 
      className="mcq-section bg-white rounded-lg shadow-md p-6 min-h-[300px]"
      style={containerStyle}
    >
      <h3 className="mcq-title text-2xl font-bold mb-6">Knowledge Check</h3>
      
      <div className="space-y-8">
        {mcqs.map((mcq, index) => {
          // Handle potential missing data
          const questionText = mcq?.question || `Question ${index + 1}`;
          const options = getOptions(mcq);
          const correctAnswer = mcq?.correctAnswer !== undefined ? mcq.correctAnswer : 0;
          
          return (
            <div 
              key={index} 
              className={`mcq-item question-${index} p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300`}
            >
              <p className="text-lg font-medium mb-4 text-gray-800">{index + 1}. {questionText}</p>
              
              {/* Only display options if we actually have them */}
              {options && options.length > 0 ? (
                <div className="space-y-3">
                  {options.map((option, optIndex) => {
                    // Handle undefined options
                    const optionText = option || `Option ${optIndex + 1}`;
                    
                    // Determine if this option is the correct one
                    let isCorrect = false;
                    if (typeof correctAnswer === 'number') {
                      isCorrect = optIndex === correctAnswer;
                    } else if (typeof correctAnswer === 'string') {
                      isCorrect = optionText === correctAnswer;
                    }
                    
                    const isSelected = answers[index] === optIndex;
                    const showResult = showResults && (isSelected || isCorrect);
                    
                    let optionClassName = "option-item option-" + optIndex + " flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 border";
                    
                    if (showResults) {
                      if (isCorrect) {
                        optionClassName += " correct-answer bg-green-100 border-green-500 shadow-md";
                      } else if (isSelected) {
                        optionClassName += " incorrect-answer bg-red-100 border-red-500";
                      } else {
                        optionClassName += " bg-gray-50 opacity-70";
                      }
                    } else {
                      if (isSelected) {
                        optionClassName += " bg-indigo-100 border-indigo-500 shadow-sm";
                      } else {
                        optionClassName += " bg-gray-50 hover:bg-gray-100 hover:border-gray-300";
                      }
                    }
                    
                    return (
                      <div 
                        key={optIndex}
                        className={optionClassName}
                        onClick={() => !showResults && handleAnswerSelect(index, optIndex)}
                      >
                        <div className="flex items-center w-full">
                          <div className="flex-shrink-0 mr-3">
                            {showResults ? (
                              isCorrect ? (
                                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">✓</div>
                              ) : isSelected ? (
                                <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white">✗</div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>
                              )
                            ) : (
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-transparent' : 'border-2 border-gray-300'}`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                              </div>
                            )}
                          </div>
                          
                          <span className={`${(showResults && isCorrect) ? 'font-medium text-green-800' : ''} ${isSelected ? 'font-medium' : ''}`}>
                            {optionText}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-yellow-50 text-yellow-700 rounded-lg border border-yellow-200">
                  No options available for this question.
                </div>
              )}
              
              {showResults && (
                <div className="result-message mt-4 p-3 rounded-lg">
                  {answers[index] === correctAnswer ? (
                    <div className="flex items-center text-green-600 bg-green-50 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">Correct! Great job!</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">
                        Incorrect. The correct answer is: "{getCorrectAnswerText(mcq)}"
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="mt-8 flex justify-center">
        {!showResults ? (
          <button
            onClick={checkAnswers}
            className="check-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center"
            style={{ minWidth: "200px" }}
            disabled={!allQuestionsAnswered}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Check Answers
          </button>
        ) : (
          <button
            onClick={resetQuiz}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-6 py-3 rounded-lg transition-all duration-300 font-medium shadow-md hover:shadow-lg flex items-center justify-center transform hover:scale-105"
            style={{ minWidth: "200px" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

export default MCQSection;