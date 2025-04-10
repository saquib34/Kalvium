// components/GeminiAPI.js
const API_KEY = import.meta.env.VITE_GEMINI;  
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

// Import our new YouTube search utility
import { searchYouTubeVideo } from '../utils/youtubeSearch';

export async function generateLessonContent(topicInfo) {
  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Create an educational lesson about ${topicInfo.topic} for ${topicInfo.audience}.
            
            Include the following:
            1. A compelling title
            2. A brief description (5-7 sentences)
            3. 3-5 learning outcomes (starting with "After this lesson, students will be able to...")
            4. Key concepts and terminology (5-7 terms with definitions)
            5. Content for 5 distinct slides with teaching points[Each slide must have 500 word detailed explanation with proper example and each slide have proper deatiled analysis]
            6. 5 multiple choice questions with answers
            7. A brief summary paragraph
            8. A relevant YouTube video recommendation (just the topic, not an actual URL)
            
            Format the response as a JSON object with these keys: title, description, learningOutcomes (array), keyConcepts (array of {term, definition}), slides (array of {title, content}), mcqs (array of {question, options, correctAnswer}), summary, videoTopic.`
          }]
        }]
      })
    });

    const data = await response.json();
    console.log(data);
    
    // Extract the generated text from the response
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the text
    const startIdx = generatedText.indexOf('{');
    const endIdx = generatedText.lastIndexOf('}') + 1;
    const jsonStr = generatedText.substring(startIdx, endIdx);
    
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Error generating lesson content:", error);
    return null;
  }
}

// We can keep this function signature for backward compatibility
// but now it uses our new implementation
export { searchYouTubeVideo };