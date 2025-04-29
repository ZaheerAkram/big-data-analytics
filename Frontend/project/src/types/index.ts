export type UserType = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: 'admin' | 'candidate';
};

export type InterviewSessionType = {
  id: string;
  jobTitle: string;
  date: Date;
  status: 'awaiting' | 'scheduled' | 'completed';
  candidateId: string;
  rank?: number;
  score?: number;
};

export type QuestionType = {
  id: string;
  text: string;
  sessionId: string;
  followUp?: boolean;
};

export type ScoreType = {
  id: string;
  sessionId: string;
  overallScore: number;
  audioAnalysis: {
    tone: number;
    clarity: number;
  };
  facialExpression: {
    confidence: number;
    stress: number;
  };
  behavioralPatterns: {
    gaze: number;
    movement: number;
  };
  anomalyFlags: string[];
  feedbackSummary: string;
};

export type CandidateType = {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  jobApplied: string;
  status: 'awaiting' | 'scheduled' | 'completed';
  rank?: number;
  interviewDate?: Date;
};