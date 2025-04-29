import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Users, Calendar, Star, Eye, AlertTriangle, Search, Check, Clock } from 'lucide-react';
import Layout from '../components/layout/Layout';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { mockCandidates } from '../mock/interviewData';
import { CandidateType } from '../types';

const AdminDashboard: React.FC = () => {
  const [candidates, setCandidates] = useState<CandidateType[]>(mockCandidates);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  const navigate = useNavigate();
  
  const filteredCandidates = candidates.filter(candidate => 
    candidate.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    candidate.jobApplied.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const handleScheduleClick = (candidateId: string) => {
    setShowDatePicker(candidateId);
  };
  
  const handleScheduleSubmit = (candidateId: string) => {
    if (selectedDate && selectedTime) {
      const dateTime = new Date(`${selectedDate}T${selectedTime}`);
      
      setCandidates(candidates.map(candidate => 
        candidate.id === candidateId 
          ? { ...candidate, status: 'scheduled', interviewDate: dateTime } 
          : candidate
      ));
      
      setShowDatePicker(null);
      setSelectedDate('');
      setSelectedTime('');
    }
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
  
  return (
    <Layout>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Manage candidates and schedule interviews."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-primary-100 text-primary-600">
              <Users className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Candidates</h3>
              <p className="text-3xl font-bold mt-1">{candidates.length}</p>
              <p className="text-sm text-gray-500 mt-1">Total applications</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-accent-100 text-accent-600">
              <Calendar className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Scheduled</h3>
              <p className="text-3xl font-bold mt-1">{candidates.filter(c => c.status === 'scheduled').length}</p>
              <p className="text-sm text-gray-500 mt-1">Upcoming interviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-success-100 text-success-600">
              <Check className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Completed</h3>
              <p className="text-3xl font-bold mt-1">{candidates.filter(c => c.status === 'completed').length}</p>
              <p className="text-sm text-gray-500 mt-1">Finished interviews</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-start">
            <div className="p-3 rounded-full bg-warning-100 text-warning-600">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Awaiting</h3>
              <p className="text-3xl font-bold mt-1">{candidates.filter(c => c.status === 'awaiting').length}</p>
              <p className="text-sm text-gray-500 mt-1">Need scheduling</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-medium text-gray-900">Upload Documents</h2>
          <p className="mt-1 text-sm text-gray-500">Upload job descriptions and CVs for AI analysis.</p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Upload Job Description</p>
              <p className="text-xs text-gray-500 mt-1">PDF format, max 5MB</p>
              <label className="mt-4">
                <span className="btn-primary cursor-pointer">
                  Select File
                </span>
                <input type="file" className="hidden" />
              </label>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">Upload Candidate CVs</p>
              <p className="text-xs text-gray-500 mt-1">PDF format, max 5MB each</p>
              <label className="mt-4">
                <span className="btn-primary cursor-pointer">
                  Select Files
                </span>
                <input type="file" multiple className="hidden" />
              </label>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-medium text-gray-900">Candidate Management</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage candidate applications and interviews.</p>
          </div>
          
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search candidates..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Applied
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {candidate.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{candidate.fullName}</div>
                        <div className="text-sm text-gray-500">{candidate.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{candidate.jobApplied}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                      {getStatusIcon(candidate.status)}
                      <span className="ml-1">{candidate.status.charAt(0).toUpperCase() + candidate.status.slice(1)}</span>
                    </div>
                    {candidate.interviewDate && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(candidate.interviewDate).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-accent-500 mr-1" />
                      <span className="text-sm font-medium">#{candidate.rank}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {showDatePicker === candidate.id ? (
                      <div className="flex flex-col space-y-2">
                        <Input
                          id={`date-${candidate.id}`}
                          name="date"
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          required
                          className="mb-0"
                        />
                        <Input
                          id={`time-${candidate.id}`}
                          name="time"
                          type="time"
                          value={selectedTime}
                          onChange={(e) => setSelectedTime(e.target.value)}
                          required
                          className="mb-0"
                        />
                        <div className="flex space-x-2 mt-2">
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleScheduleSubmit(candidate.id)}
                          >
                            Schedule
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowDatePicker(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        {candidate.status === 'awaiting' && (
                          <Button 
                            variant="primary" 
                            size="sm" 
                            onClick={() => handleScheduleClick(candidate.id)}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        )}
                        {candidate.status === 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {}}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCandidates.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-gray-500">No candidates found matching your search</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;