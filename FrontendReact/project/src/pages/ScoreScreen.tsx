import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, Ban as Bar, Activity, AlertTriangle, ChevronLeft } from 'lucide-react';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { getScoreBySessionId, getInterviewById } from '../mock/interviewData';
import { ScoreType } from '../types';

const ScoreScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [score, setScore] = useState<ScoreType | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (sessionId) {
      // Simulate API fetch delay
      setTimeout(() => {
        const scoreData = getScoreBySessionId(sessionId);
        if (scoreData) {
          setScore(scoreData);
        }
        setLoading(false);
      }, 1000);
    }
  }, [sessionId]);
  
  const getScoreColor = (value: number) => {
    if (value >= 80) return 'text-success-500';
    if (value >= 60) return 'text-accent-500';
    return 'text-error-500';
  };
  
  const getProgressColor = (value: number) => {
    if (value >= 80) return 'bg-success-500';
    if (value >= 60) return 'bg-accent-500';
    return 'bg-error-500';
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading your interview results...</p>
        </div>
      </Layout>
    );
  }
  
  if (!score) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <MessageSquare className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No results found</h3>
          <p className="mt-1 text-sm text-gray-500">
            We couldn't find the interview results you're looking for.
          </p>
          <div className="mt-6">
            <Button 
              variant="primary" 
              onClick={() => navigate('/dashboard')}
            >
              Return to Dashboard
            </Button>
          </div>
        </div>
      </Layout>
    );
  }
  
  const interview = getInterviewById(sessionId || '');
  
  return (
    <Layout>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-heading font-bold text-gray-900">Interview Results</h1>
        <p className="mt-2 text-gray-600">
          {interview ? `${interview.jobTitle} Interview` : 'Interview'} Results & Feedback
        </p>
      </div>
      
      {/* Score summary card */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-lg">
            <div className="text-5xl font-bold mb-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className={getScoreColor(score.overallScore)}>{score.overallScore}</span>
              <span className="text-gray-400 text-xl">/100</span>
            </div>
            <p className="text-gray-500 text-sm">Overall Score</p>
          </div>
          
          <div className="md:col-span-2">
            <h2 className="text-xl font-medium mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-primary-500" />
              Feedback Summary
            </h2>
            <p className="text-gray-700">{score.feedbackSummary}</p>
            
            <div className="mt-4 flex flex-wrap gap-2">
              {score.anomalyFlags.map((flag, index) => (
                <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warning-100 text-warning-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {flag}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Detailed evaluation */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-heading font-semibold text-gray-900 flex items-center">
            <Bar className="h-5 w-5 mr-2 text-primary-500" />
            Detailed Evaluation
          </h2>
        </div>
        
        <div className="p-6">
          <div className="space-y-8">
            {/* Audio Analysis */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Audio Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Tone</span>
                    <span className={`text-sm font-medium ${getScoreColor(score.audioAnalysis.tone)}`}>
                      {score.audioAnalysis.tone}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(score.audioAnalysis.tone)}`} 
                      style={{ width: `${score.audioAnalysis.tone}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Clarity</span>
                    <span className={`text-sm font-medium ${getScoreColor(score.audioAnalysis.clarity)}`}>
                      {score.audioAnalysis.clarity}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(score.audioAnalysis.clarity)}`} 
                      style={{ width: `${score.audioAnalysis.clarity}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Facial Expression Analysis */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Facial Expression Analysis</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Confidence</span>
                    <span className={`text-sm font-medium ${getScoreColor(score.facialExpression.confidence)}`}>
                      {score.facialExpression.confidence}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(score.facialExpression.confidence)}`} 
                      style={{ width: `${score.facialExpression.confidence}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Stress Level</span>
                    <span className={`text-sm font-medium ${getScoreColor(100 - score.facialExpression.stress)}`}>
                      {score.facialExpression.stress}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(100 - score.facialExpression.stress)}`} 
                      style={{ width: `${score.facialExpression.stress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Behavioral Patterns */}
            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Behavioral Patterns</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Eye Contact/Gaze</span>
                    <span className={`text-sm font-medium ${getScoreColor(score.behavioralPatterns.gaze)}`}>
                      {score.behavioralPatterns.gaze}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(score.behavioralPatterns.gaze)}`} 
                      style={{ width: `${score.behavioralPatterns.gaze}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Movement/Posture</span>
                    <span className={`text-sm font-medium ${getScoreColor(score.behavioralPatterns.movement)}`}>
                      {score.behavioralPatterns.movement}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${getProgressColor(score.behavioralPatterns.movement)}`} 
                      style={{ width: `${score.behavioralPatterns.movement}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center">
            <ThumbsUp className="h-5 w-5 mr-2 text-primary-500" />
            Areas of Improvement
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Practice maintaining more consistent eye contact with the camera</li>
            <li>Reduce filler words such as "um" and "like" in responses</li>
            <li>Prepare more thorough technical answers with specific examples</li>
            <li>Improve posture during the interview to project more confidence</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ScoreScreen;