import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, Check, Zap, ArrowRight } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { mockInterviewSessions } from '../mock/interviewData';
import { InterviewSessionType } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [interviews] = useState<InterviewSessionType[]>(mockInterviewSessions);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };
  
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'awaiting':
        return <Calendar className="h-5 w-5 text-gray-500" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-accent-500" />;
      case 'completed':
        return <Check className="h-5 w-5 text-success-500" />;
      default:
        return null;
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'awaiting':
        return 'Awaiting Schedule';
      case 'scheduled':
        return 'Ready to Start';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'awaiting':
        return 'bg-gray-100 text-gray-700';
      case 'scheduled':
        return 'bg-accent-100 text-accent-700';
      case 'completed':
        return 'bg-success-100 text-success-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };
  
  const handleJoinInterview = (sessionId: string) => {
    navigate(`/interview/${sessionId}`);
  };
  
  const handleViewResults = (sessionId: string) => {
    navigate(`/score/${sessionId}`);
  };
  
  return (
    <Layout>
      <PageHeader
        title="Your Interviews"
        subtitle={`Welcome, ${currentUser?.fullName}. Here are your upcoming interviews.`}
      />
      
      {interviews.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <Calendar className="h-12 w-12" />
          </div>
          <h3 className="mt-2 text-lg font-medium text-gray-900">No interviews yet</h3>
          <p className="mt-1 text-sm text-gray-500">You don't have any scheduled interviews at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {interviews.map((interview) => (
            <div key={interview.id} className="card bg-white overflow-hidden">
              <div className="p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{interview.jobTitle}</h3>
                    <div className="mt-1 flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{formatDate(interview.date)}</span>
                    </div>
                    <div className="mt-1 flex items-center">
                      <Clock className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{formatTime(interview.date)}</span>
                    </div>
                  </div>
                  
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)} flex items-center`}>
                    {getStatusIcon(interview.status)}
                    <span className="ml-1">{getStatusText(interview.status)}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  {interview.status === 'scheduled' && (
                    <Button 
                      variant="primary" 
                      onClick={() => handleJoinInterview(interview.id)}
                      isFullWidth
                    >
                      <Zap className="h-4 w-4" />
                      Join Interview
                    </Button>
                  )}
                  {interview.status === 'completed' && (
                    <Button 
                      variant="outline" 
                      onClick={() => handleViewResults(interview.id)}
                      isFullWidth
                    >
                      <ArrowRight className="h-4 w-4" />
                      View Results
                    </Button>
                  )}
                  {interview.status === 'awaiting' && (
                    <p className="text-sm text-gray-500 italic">
                      Waiting for scheduling...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;