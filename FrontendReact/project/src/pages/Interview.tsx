import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { Mic, MicOff, XCircle, AlertTriangle, Clock } from 'lucide-react';
import Button from '../components/ui/Button';
import { getInterviewById, getQuestionsBySessionId } from '../mock/interviewData';
import { QuestionType } from '../types';

const Interview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [isRecording, setIsRecording] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [showNextQuestion, setShowNextQuestion] = useState(false);
  const [stressLevel, setStressLevel] = useState(20); // 0-100 scale
  
  const webcamRef = useRef<Webcam>(null);
  const interviewSession = sessionId ? getInterviewById(sessionId) : undefined;
  
  // Load questions
  useEffect(() => {
    if (sessionId) {
      const interviewQuestions = getQuestionsBySessionId(sessionId);
      setQuestions(interviewQuestions);
    }
  }, [sessionId]);
  
  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleInterviewComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Show random feedback
  useEffect(() => {
    const feedbackInterval = setInterval(() => {
      const randomFeedback = [
        "Your pace is good, continue speaking clearly.",
        "Try to maintain more eye contact with the camera.",
        "Your energy level has dropped slightly.",
        "You're using filler words frequently.",
        null,
        null,
      ];
      
      const randomStress = Math.floor(Math.random() * 40) + 10; // Random stress between 10-50
      setStressLevel(randomStress);
      setFeedbackMessage(randomFeedback[Math.floor(Math.random() * randomFeedback.length)]);
      
      setTimeout(() => {
        setFeedbackMessage(null);
      }, 5000);
    }, 15000);
    
    return () => clearInterval(feedbackInterval);
  }, []);
  
  // Auto-advance questions
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length - 1) {
      const questionTimer = setTimeout(() => {
        setShowNextQuestion(true);
        
        setTimeout(() => {
          setCurrentQuestionIndex((prev) => prev + 1);
          setShowNextQuestion(false);
        }, 5000);
      }, 30000); // 30 seconds per question
      
      return () => clearTimeout(questionTimer);
    }
  }, [currentQuestionIndex, questions]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const toggleMicrophone = () => {
    setIsRecording(!isRecording);
  };
  
  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel this interview? Your progress will be lost.')) {
      navigate('/dashboard');
    }
  };
  
  const handleInterviewComplete = () => {
    // In a real app, we would save the recording and results
    navigate(`/score/${sessionId}`);
  };

  // Stress level indicator color
  const getStressColor = () => {
    if (stressLevel < 30) return 'bg-success-500';
    if (stressLevel < 70) return 'bg-warning-500';
    return 'bg-error-500';
  };
  
  if (!interviewSession || !questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <h2 className="mt-4 text-lg font-medium">Loading interview session...</h2>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Top status bar */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-lg font-medium">
            {interviewSession.jobTitle} Interview
          </div>
          <div className="bg-primary-800 text-primary-100 px-3 py-1 rounded-full text-sm flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {feedbackMessage && (
          <div className="bg-warning-800 text-warning-100 px-4 py-2 rounded-md flex items-center animate-fade-in">
            <AlertTriangle className="h-4 w-4 mr-2" />
            {feedbackMessage}
          </div>
        )}
        
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-300">Stress Level:</div>
          <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${getStressColor()} transition-all duration-1000`} 
              style={{ width: `${stressLevel}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left panel - Webcam */}
        <div className="w-full md:w-1/2 flex flex-col bg-black">
          <div className="flex-grow relative">
            <Webcam
              audio={isRecording}
              ref={webcamRef}
              className="absolute inset-0 w-full h-full object-cover"
              mirrored
            />
            
            {/* Recording indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center">
                <div className="h-3 w-3 bg-error-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-white text-sm">Recording</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel - Questions */}
        <div className="w-full md:w-1/2 bg-gray-800 p-8 flex flex-col">
          {showNextQuestion ? (
            <div className="flex-grow flex flex-col items-center justify-center text-white animate-fade-in">
              <div className="text-xl mb-4">Next Question in 5 seconds...</div>
              <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="flex-grow">
              <h2 className="text-xl text-gray-300 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</h2>
              <div className="bg-gray-700 rounded-lg p-6 mb-6 shadow-lg">
                <p className="text-2xl text-white font-medium">{questions[currentQuestionIndex].text}</p>
              </div>
              
              <div className="mb-8">
                <h3 className="text-lg text-gray-300 mb-3">Tips:</h3>
                <ul className="list-disc list-inside text-gray-400 space-y-2">
                  <li>Speak clearly and at a moderate pace</li>
                  <li>Maintain eye contact with the camera</li>
                  <li>Structure your answer with clear examples</li>
                  <li>Keep your answers concise (1-2 minutes)</li>
                </ul>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-white text-sm">
                  <strong className="text-primary-400">AI is analyzing:</strong> Your tone, clarity, facial expressions, confidence level, and response relevance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Bottom controls */}
      <div className="bg-gray-800 text-white p-4 flex items-center justify-between border-t border-gray-700">
        <Button 
          variant="outline" 
          onClick={toggleMicrophone}
          className="border-gray-600 text-white hover:bg-gray-700"
        >
          {isRecording ? <MicOff className="h-5 w-5 mr-1" /> : <Mic className="h-5 w-5 mr-1" />}
          {isRecording ? 'Mute' : 'Unmute'}
        </Button>
        
        <div className="text-center">
          <div className="text-sm text-gray-400">Time Remaining</div>
          <div className="text-xl font-medium">{formatTime(timeLeft)}</div>
        </div>
        
        <Button 
          variant="danger" 
          onClick={handleCancel}
        >
          <XCircle className="h-5 w-5 mr-1" />
          Cancel Interview
        </Button>
      </div>
    </div>
  );
};

export default Interview;