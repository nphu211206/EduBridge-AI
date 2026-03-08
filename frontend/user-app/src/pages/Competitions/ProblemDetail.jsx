/*-----------------------------------------------------------------
* File: ProblemDetail.jsx
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getProblemDetails, submitSolution, getSubmissionDetails, getCompetitionDetails, startCompetition } from '@/api/competitionService';
import { toast } from 'react-toastify';
import Editor from '@monaco-editor/react';
import { format } from 'date-fns';
import Avatar from '../../components/common/Avatar';

const ProblemDetail = () => {
  const { competitionId, problemId } = useParams();
  const navigate = useNavigate();
  const [competitionData, setCompetitionData] = useState(null);
  const [problem, setProblem] = useState(null);
  const [problemList, setProblemList] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('cpp');
  const [tabActive, setTabActive] = useState('problem'); // 'problem', 'submissions'
  const [results, setResults] = useState(null);
  const [viewingSubmission, setViewingSubmission] = useState(null);
  const editorRef = useRef(null);
  // Whether we are currently inspecting a past submission
  const isViewingSubmission = viewingSubmission !== null;

  // Dynamic editor height: larger when no results displayed to avoid empty blank area
  const editorHeight = results ? '500px' : '700px';

  // Language options
  const languages = [
    { id: 'cpp', name: 'C++', extension: 'cpp' },
    { id: 'c', name: 'C', extension: 'c' },
    { id: 'java', name: 'Java', extension: 'java' },
    { id: 'python', name: 'Python', extension: 'py' },
    { id: 'javascript', name: 'JavaScript', extension: 'js' },
  ];

  // Language-specific starter code
  const starterCodes = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    // Viết code của bạn tại đây
    
    return 0;
}`,
    c: `#include <stdio.h>

int main() {
    // Viết code của bạn tại đây
    
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Viết code của bạn tại đây
    }
}`,
    python: `# Viết code của bạn tại đây
`,
    javascript: `// Viết code của bạn tại đây
`
  };

  // Fetch competition details for problem list and data
  useEffect(() => {
    const fetchCompetitionDetails = async () => {
      try {
        const response = await getCompetitionDetails(competitionId);
        if (response.success && response.data.problems) {
          setProblemList(response.data.problems);
          setCompetitionData(response.data);
        } else {
          console.error('Không thể tải danh sách bài tập');
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết cuộc thi:', err);
      }
    };

    fetchCompetitionDetails();
  }, [competitionId]);

  // Determine if competition has ended
  const isCompetitionEnded = competitionData && new Date() > new Date(competitionData.EndTime);

  useEffect(() => {
    const fetchProblemDetails = async () => {
      try {
        setLoading(true);
        const response = await getProblemDetails(competitionId, problemId);
        
        // Handle different error types
        if (!response.success) {
          if (response.isAuthError) {
            toast.error('Vui lòng đăng nhập để xem chi tiết bài tập');
            navigate('/login', { state: { from: `/competitions/${competitionId}/problems/${problemId}` } });
            setLoading(false);
            return;
          }
          
          if (response.isPermissionError) {
            toast.error(response.message || 'Bạn không có quyền xem bài tập này');
            setLoading(false);
            return;
          }
          
          if (response.isServerError) {
            toast.error(response.message || 'Lỗi máy chủ xảy ra');
            setLoading(false);
            return;
          }
          
          // Handle any other error
          toast.error(response.message || 'Không thể tải chi tiết bài tập');
          setLoading(false);
          return;
        }
        
        setProblem(response.data);
        
        // Set submissions from the correct location in the response
        if (response.userSubmissions) {
          setSubmissions(response.userSubmissions);
        }
        
        // Set initial code from starter code or language template
        if (response.data.StarterCode) {
          setCode(response.data.StarterCode);
        } else {
          setCode(starterCodes[language]);
        }

        // Parse test cases if available
        try {
          if (response.data.TestCasesVisible) {
            try {
              // Try to parse as JSON
              const visibleTestCases = JSON.parse(response.data.TestCasesVisible);
              response.data.TestCasesVisible = Array.isArray(visibleTestCases) ? visibleTestCases : [];
            } catch (error) {
              console.error('Lỗi phân tích test case hiển thị:', error);
              response.data.TestCasesVisible = [];
            }
          }
        } catch (error) {
          console.error('Lỗi xử lý test case:', error);
          response.data.TestCasesVisible = [];
        }
        
      } catch (err) {
        console.error('Lỗi khi tải chi tiết bài tập:', err);
        toast.error('Đã xảy ra lỗi khi tải chi tiết bài tập');
      } finally {
        setLoading(false);
      }
    };

    fetchProblemDetails();
  }, [competitionId, problemId, language, navigate]);

  // Handle language change
  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    
    // If user hasn't written any code yet, set the starter code for the new language
    if (!code || code === starterCodes[language]) {
      setCode(starterCodes[newLanguage]);
    }
  };

  // Handle editor mount
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  // Submit solution
  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.warning('Vui lòng viết code trước khi nộp bài');
      return;
    }

    try {
      setSubmitting(true);
      setResults(null);
      
      let response = await submitSolution(competitionId, problemId, code, language);
      
      // If backend indicates competition hasn't started, attempt to start automatically then retry ONCE
      if (!response.success && response.message && response.message.toLowerCase().includes('not started')) {
        console.warn('Detected "not started" error, attempting to start competition automatically...');
        const startRes = await startCompetition(competitionId);
        if (startRes.success) {
          console.log('Competition started programmatically. Retrying submission...');
          response = await submitSolution(competitionId, problemId, code, language);
        } else {
          toast.error(startRes.message || 'Không thể bắt đầu cuộc thi.');
        }
      }
      
      if (response.success) {
        toast.success('Nộp bài thành công');
        
        // Polling for submission results
        let submissionStatus = 'pending';
        let attempts = 0;
        const maxAttempts = 10;
        const pollingInterval = 2000; // 2 seconds
        
        const checkSubmissionStatus = async () => {
          try {
            attempts++;
            console.log(`Kiểm tra trạng thái bài nộp (lần ${attempts}/${maxAttempts})...`);
            
            // Fetch the latest problem data including submissions
            const problemData = await getProblemDetails(competitionId, problemId);
            
            if (problemData.isServerError) {
              toast.error(problemData.message || 'Lỗi máy chủ xảy ra');
              setSubmitting(false);
              return;
            }
            
            if (!problemData.success) {
              toast.error(problemData.message || 'Không thể kiểm tra trạng thái bài nộp');
              setSubmitting(false);
              return;
            }
            
            // Find the latest submission
            const latestSubmission = problemData.userSubmissions?.[0];
            
            if (!latestSubmission) {
              console.error('Không tìm thấy bài nộp nào sau khi gửi code');
              setSubmitting(false);
              return;
            }
            
            console.log('Trạng thái bài nộp mới nhất:', latestSubmission.Status);
            submissionStatus = latestSubmission.Status.toLowerCase();
            
            // Update UI with the latest submission
            setSubmissions(problemData.userSubmissions || []);
            
            // If still pending/running and we haven't exceeded max attempts, poll again
            if (['pending', 'running', 'compiling'].includes(submissionStatus) && attempts < maxAttempts) {
              setTimeout(checkSubmissionStatus, pollingInterval);
            } else {
              // Final status update
              setSubmitting(false);
              
              // Handle the final submission status
              if (submissionStatus === 'accepted') {
                toast.success('Bài làm được chấp nhận! 🎉');
              } else if (submissionStatus === 'wrong_answer') {
                toast.error('Sai đáp án. Hãy thử lại!');
              } else if (submissionStatus === 'compilation_error') {
                toast.error('Lỗi biên dịch. Kiểm tra cú pháp code của bạn.');
              } else if (submissionStatus === 'runtime_error') {
                toast.error('Lỗi thực thi. Kiểm tra logic code của bạn.');
              } else if (submissionStatus === 'time_limit_exceeded') {
                toast.error('Quá thời gian giới hạn. Hãy tối ưu giải pháp của bạn.');
              } else if (submissionStatus === 'memory_limit_exceeded') {
                toast.error('Quá bộ nhớ giới hạn. Hãy tối ưu giải pháp của bạn.');
              } else {
                toast.error('Đã xảy ra lỗi khi chấm bài của bạn.');
              }
              
              // Display detailed results
              setResults({
                status: submissionStatus,
                message: latestSubmission.ErrorMessage || null,
                score: latestSubmission.Score,
                executionTime: latestSubmission.ExecutionTime,
                memoryUsed: latestSubmission.MemoryUsed
              });
            }
          } catch (error) {
            console.error('Lỗi khi kiểm tra trạng thái bài nộp:', error);
            setSubmitting(false);
            toast.error('Không thể kiểm tra trạng thái bài nộp');
          }
        };
        
        // Start polling
        setTimeout(checkSubmissionStatus, 1000);
      } else {
        toast.error(response.message || 'Nộp bài không thành công');
        setSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi khi nộp code:', error);
      toast.error(error.response?.data?.message || 'Lỗi khi nộp code');
      setSubmitting(false);
    }
  };

  // View a specific submission
  const handleViewSubmission = async (submissionId) => {
    try {
      const response = await getSubmissionDetails(submissionId);
      if (response.success) {
        setViewingSubmission(response.data);
        setTabActive('submissions');
      } else {
        toast.error('Không thể tải chi tiết bài nộp');
      }
    } catch (err) {
      console.error('Lỗi khi tải chi tiết bài nộp:', err);
      toast.error('Lỗi khi tải chi tiết bài nộp');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Đạt</span>;
      case 'wrong_answer':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Sai đáp án</span>;
      case 'compilation_error':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Lỗi biên dịch</span>;
      case 'runtime_error':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">Lỗi thực thi</span>;
      case 'time_limit_exceeded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">Quá thời gian</span>;
      case 'memory_limit_exceeded':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-100 text-indigo-800">Quá bộ nhớ</span>;
      case 'pending':
      case 'running':
      case 'compiling':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 flex items-center">
          <svg className="w-3 h-3 mr-1 animate-spin" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {status === 'pending' ? 'Đang chờ' : status === 'running' ? 'Đang chạy' : 'Đang biên dịch'}
        </span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDateTime = (dateTime) => {
    try {
      if (!dateTime) return '-';
      return format(new Date(dateTime), 'HH:mm:ss dd/MM/yyyy');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          Không tìm thấy bài tập
        </div>
        <div className="mt-4">
          <Link to={`/competitions/${competitionId}`} className="text-blue-600 hover:text-blue-800">
            ← Quay lại cuộc thi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to={`/competitions/${competitionId}`} className="text-blue-600 hover:text-blue-800">
          ← Quay lại cuộc thi
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Problem description - now 35% */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex border-b">
            <button
              className={`flex-1 py-3 px-4 text-center ${
                tabActive === 'problem'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setTabActive('problem')}
            >
              Đề bài
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center ${
                tabActive === 'submissions'
                  ? 'border-b-2 border-blue-500 font-medium text-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setTabActive('submissions')}
            >
              Bài nộp
            </button>
          </div>
          
          <div className="p-4 overflow-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
            {tabActive === 'problem' ? (
              <>
                <div className="flex justify-between items-start mb-4">
                  <h1 className="text-2xl font-bold">{problem.Title}</h1>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                      problem.Difficulty === 'Dễ' ? 'bg-green-100 text-green-800' : 
                      problem.Difficulty === 'Trung bình' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {problem.Difficulty}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">{problem.Points} điểm</span>
                  </div>
                </div>
                
                {/* Add problem list section to allow selection */}
                <div className="mb-6 border-b pb-4">
                  <h3 className="text-md font-semibold mb-2">Danh sách bài tập</h3>
                  <div className="flex flex-wrap gap-2">
                    {problemList && problemList?.map((p) => (
                      <button
                        key={p.ProblemID}
                        onClick={() => p.ProblemID !== parseInt(problemId) && navigate(`/competitions/${competitionId}/problems/${p.ProblemID}`)}
                        className={`px-3 py-1 text-sm rounded-full ${
                          p.ProblemID === parseInt(problemId)
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {p.Title}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="prose max-w-none">
                  <div className="mb-6">
                    <p>{problem.Description}</p>
                  </div>
                  
                  {problem.InputFormat && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Định dạng đầu vào</h3>
                      <p>{problem.InputFormat}</p>
                    </div>
                  )}
                  
                  {problem.OutputFormat && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Định dạng đầu ra</h3>
                      <p>{problem.OutputFormat}</p>
                    </div>
                  )}
                  
                  {problem.Constraints && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Ràng buộc</h3>
                      <p>{problem.Constraints}</p>
                    </div>
                  )}
                  
                  {(problem.SampleInput || problem.SampleOutput) && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Ví dụ</h3>
                      <div className="grid grid-cols-1 gap-4">
                        {problem.SampleInput && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Đầu vào mẫu</h4>
                            <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">{problem.SampleInput}</pre>
                          </div>
                        )}
                        
                        {problem.SampleOutput && (
                          <div>
                            <h4 className="text-sm font-medium mb-2">Đầu ra mẫu</h4>
                            <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">{problem.SampleOutput}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {problem.Explanation && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Giải thích</h3>
                      <p>{problem.Explanation}</p>
                    </div>
                  )}
                  
                  {problem.TestCasesVisible && problem.TestCasesVisible?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold mb-2">Test Case</h3>
                      <div className="space-y-4">
                        {problem.TestCasesVisible?.map((testCase, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <h4 className="text-sm font-medium mb-2">Đầu vào</h4>
                                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">{testCase.input}</pre>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium mb-2">Đầu ra mong đợi</h4>
                                <pre className="bg-gray-50 p-3 rounded-md text-sm overflow-x-auto">{testCase.output}</pre>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold mb-4">Bài nộp của bạn</h2>
                
                {viewingSubmission ? (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <Avatar 
                          src={viewingSubmission.UserImage} 
                          alt={viewingSubmission.UserName || "Người dùng"} 
                          name={viewingSubmission.UserName || "Người dùng"}
                          size="small" 
                          className="mr-3" 
                        />
                        <h3 className="text-lg font-semibold">Bài nộp #{viewingSubmission.SubmissionID}</h3>
                      </div>
                      <button 
                        onClick={() => setViewingSubmission(null)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        Quay lại danh sách
                      </button>
                    </div>
                    
                    <div className="mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-500">Trạng thái:</span>
                        <div className="mt-1">{getStatusBadge(viewingSubmission.Status)}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Điểm:</span>
                        <div className="mt-1 font-medium">{viewingSubmission.Score} điểm</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Thời gian:</span>
                        <div className="mt-1">{viewingSubmission.ExecutionTime ? `${viewingSubmission.ExecutionTime} giây` : '-'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Bộ nhớ:</span>
                        <div className="mt-1">{viewingSubmission.MemoryUsed ? `${viewingSubmission.MemoryUsed} KB` : '-'}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Ngôn ngữ:</span>
                        <div className="mt-1">{viewingSubmission.Language}</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Thời gian nộp:</span>
                        <div className="mt-1">{formatDateTime(viewingSubmission.SubmittedAt)}</div>
                      </div>
                    </div>
                    
                    {viewingSubmission.ErrorMessage && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-red-600 mb-2">Lỗi:</h4>
                        <pre className="bg-red-50 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap text-red-700">
                          {viewingSubmission.ErrorMessage}
                        </pre>
                      </div>
                    )}
                  </div>
                ) : submissions?.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Chưa có bài nộp</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Điểm
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngôn ngữ
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Bộ nhớ
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đã nộp
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {submissions?.map((submission) => (
                          <tr key={submission.SubmissionID} 
                              className="hover:bg-gray-50 cursor-pointer" 
                              onClick={() => handleViewSubmission(submission.SubmissionID)}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <Avatar 
                                  src={submission.UserImage} 
                                  alt={submission.UserName || "Người dùng"} 
                                  name={submission.UserName || "Người dùng"}
                                  size="small" 
                                  className="mr-2" 
                                />
                                {submission.SubmissionID}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(submission.Status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {submission.Score}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {submission.Language}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {submission.ExecutionTime ? `${submission.ExecutionTime} s` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {submission.MemoryUsed ? `${submission.MemoryUsed} KB` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDateTime(submission.SubmittedAt)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        
        {/* Code editor - now 65% */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <label htmlFor="language" className="text-sm font-medium text-gray-700">Ngôn ngữ:</label>
              <select
                id="language"
                value={isViewingSubmission ? viewingSubmission.Language : language}
                onChange={handleLanguageChange}
                disabled={isViewingSubmission || isCompetitionEnded}
                className="block w-32 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {languages?.map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={handleSubmit}
              disabled={submitting || isViewingSubmission || isCompetitionEnded}
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {submitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Đang nộp...
                </>
              ) : (
                'Nộp bài'
              )}
            </button>
          </div>
          
          <div className="border-b">
            <Editor
              height={editorHeight}
              language={isViewingSubmission ? viewingSubmission.Language : language}
              value={isViewingSubmission ? viewingSubmission.SourceCode : code}
              onChange={isViewingSubmission || isCompetitionEnded ? undefined : setCode}
              onMount={handleEditorDidMount}
              options={{
                readOnly: isViewingSubmission || isCompetitionEnded,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
              }}
            />
          </div>
          
          {/* Results */}
          {results && (
            <div className="p-4" style={{ marginTop: '-10px' }}>
              <h3 className="text-lg font-semibold mb-2">Kết quả</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Trạng thái:</span>
                  {getStatusBadge(results.status)}
                </div>
                
                <div className="flex items-center">
                  <span className="text-sm font-medium mr-2">Điểm:</span>
                  <span className="text-sm font-medium">{results.score} / {problem.Points}</span>
                </div>
                
                {results.executionTime && (
                  <div>
                    <span className="text-sm font-medium mr-2">Thời gian thực thi:</span>
                    <span className="text-sm">{results.executionTime} giây</span>
                  </div>
                )}
                
                {results.memoryUsed && (
                  <div>
                    <span className="text-sm font-medium mr-2">Bộ nhớ sử dụng:</span>
                    <span className="text-sm">{results.memoryUsed} KB</span>
                  </div>
                )}
                
                {results.message && (
                  <div>
                    <span className="text-sm font-medium text-red-600 mb-1 block">Lỗi:</span>
                    <pre className="bg-red-50 p-3 rounded-md text-sm overflow-x-auto whitespace-pre-wrap text-red-700">
                      {results.message}
                    </pre>
                    
                    {/* Display detailed comparison info if available */}
                    {results.message.includes('Outputs differ') && results.diffInfo && (
                      <div className="mt-2 border-t border-red-200 pt-2">
                        <h4 className="text-sm font-medium text-red-600 mb-1">Chi tiết lỗi so sánh:</h4>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div>
                            <div className="text-xs font-medium text-red-700 mb-1">Kết quả mong đợi:</div>
                            <pre className="bg-green-50 p-2 rounded-md text-xs overflow-x-auto whitespace-pre-wrap text-green-800">
                              {results.diffInfo.expectedContext}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-medium text-red-700 mb-1">Kết quả của bạn:</div>
                            <pre className="bg-red-50 p-2 rounded-md text-xs overflow-x-auto whitespace-pre-wrap text-red-800">
                              {results.diffInfo.actualContext}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail; 
