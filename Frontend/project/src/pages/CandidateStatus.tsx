import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Check, Clock, ArrowRight, Calendar as CalendarIcon } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import { mockInterviewSessions } from '../mock/interviewData';
import { InterviewSessionType } from '../types';

const CandidateStatus: React.FC = () => {
  const [applications] = useState<InterviewSessionType[]>(mockInterviewSessions);
  const navigate = useNavigate();
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
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
        return <Calendar className="h-5 w-5 text-gray-400" />;
      case 'scheduled':
        return <Clock className="h-5 w-5 text-accent-500" />;
      case 'completed':
        return <Check className="h-5 w-5 text-success-500" />;
      default:
        return null;
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'awaiting':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Awaiting
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-100 text-accent-800">
            Scheduled
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
            Completed
          </span>
        );
      default:
        return null;
    }
  };
  
  const handleViewResults = (sessionId: string) => {
    navigate(`/score/${sessionId}`);
  };
  
  return (
    <Layout>
      <PageHeader
        title="Application Status"
        subtitle="Track the progress of your job applications and interviews."
      />
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Job Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {applications.map((application) => (
              <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-primary-100 text-primary-600">
                      <CalendarIcon className="h-5 w-5" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{application.jobTitle}</div>
                      <div className="text-sm text-gray-500">Application #{application.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(application.date)}</div>
                  <div className="text-sm text-gray-500">{formatTime(application.date)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {getStatusIcon(application.status)}
                    <span className="ml-2">{getStatusBadge(application.status)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {application.status === 'completed' ? (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleViewResults(application.id)}
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      View Results
                    </Button>
                  ) : (
                    <span className="text-gray-500">
                      {application.status === 'scheduled' ? 'Ready to start' : 'Waiting...'}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default CandidateStatus;