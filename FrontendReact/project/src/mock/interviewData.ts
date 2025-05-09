import { InterviewSessionType, QuestionType, ScoreType, CandidateType } from '../types';

// Mock interview sessions
export const mockInterviewSessions: InterviewSessionType[] = [
  {
    id: '1',
    jobTitle: 'Frontend Developer',
    date: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
    status: 'scheduled',
    candidateId: '2',
  },
  {
    id: '2',
    jobTitle: 'UX Designer',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: 'awaiting',
    candidateId: '2',
  },
  {
    id: '3',
    jobTitle: 'Product Manager',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: 'completed',
    candidateId: '2',
    score: 85,
  },
];

// Mock questions
export const mockQuestions: QuestionType[] = [
  {
    id: '1',
    text: 'Tell me about yourself and your background in technology.',
    sessionId: '1',
  },
  {
    id: '2',
    text: 'Describe a challenging project you worked on and how you overcame obstacles.',
    sessionId: '1',
  },
  {
    id: '3',
    text: 'How do you stay updated with the latest frontend technologies?',
    sessionId: '1',
  },
  {
    id: '4',
    text: 'Can you explain how you would optimize a slow-loading website?',
    sessionId: '1',
  },
  {
    id: '5',
    text: 'Tell me about a time when you had to learn a new technology quickly.',
    sessionId: '1',
    followUp: true,
  },
];

// Mock score data
export const mockScores: ScoreType[] = [
  {
    id: '1',
    sessionId: '3',
    overallScore: 85,
    audioAnalysis: {
      tone: 78,
      clarity: 92,
    },
    facialExpression: {
      confidence: 88,
      stress: 35,
    },
    behavioralPatterns: {
      gaze: 82,
      movement: 74,
    },
    anomalyFlags: ['Looked away frequently', 'Hesitated on technical questions'],
    feedbackSummary: 'Strong communication skills and technical knowledge demonstrated. Maintain eye contact more consistently and prepare more thoroughly for technical questions to improve future performance.',
  },
];

// Mock candidates (for admin)
export const mockCandidates: CandidateType[] = [
  {
    id: '2',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phoneNumber: '123-456-7890',
    jobApplied: 'Frontend Developer',
    status: 'scheduled',
    rank: 1,
    interviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    fullName: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneNumber: '987-654-3210',
    jobApplied: 'Backend Developer',
    status: 'awaiting',
    rank: 2,
  },
  {
    id: '4',
    fullName: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    phoneNumber: '555-123-4567',
    jobApplied: 'UX Designer',
    status: 'completed',
    rank: 3,
  },
  {
    id: '5',
    fullName: 'Emily Davis',
    email: 'emily.davis@example.com',
    phoneNumber: '555-987-6543',
    jobApplied: 'Product Manager',
    status: 'awaiting',
    rank: 4,
  },
  {
    id: '6',
    fullName: 'Michael Wilson',
    email: 'michael.wilson@example.com',
    phoneNumber: '555-456-7890',
    jobApplied: 'Frontend Developer',
    status: 'completed',
    rank: 5,
  },
];

// Get interviews by candidate ID
export const getInterviewsByCandidate = (candidateId: string): InterviewSessionType[] => {
  return mockInterviewSessions.filter(session => session.candidateId === candidateId);
};

// Get interview by ID
export const getInterviewById = (id: string): InterviewSessionType | undefined => {
  return mockInterviewSessions.find(session => session.id === id);
};

// Get score by session ID
export const getScoreBySessionId = (sessionId: string): ScoreType | undefined => {
  return mockScores.find(score => score.sessionId === sessionId);
};

// Get questions by session ID
export const getQuestionsBySessionId = (sessionId: string): QuestionType[] => {
  return mockQuestions.filter(question => question.sessionId === sessionId);
};