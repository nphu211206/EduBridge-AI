/*-----------------------------------------------------------------
* File: index.jsx
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  PaperAirplaneIcon, 
  ArrowPathIcon,
  AcademicCapIcon,
  LightBulbIcon, 
  CodeBracketIcon,
  BookOpenIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  BookOpenIcon as LibraryIcon,
  SparklesIcon,
  MicrophoneIcon,
  TrashIcon,
  StopIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { initChat, sendMessage } from '../../services/aiService';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chat, setChat] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isTemporaryChat, setIsTemporaryChat] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Suggested questions by category
  const suggestedQuestions = [
    {
      category: "Lập Trình",
      questions: [
        "Giải thích về nguyên tắc SOLID trong lập trình hướng đối tượng?",
        "So sánh giữa JavaScript và TypeScript?", 
        "Cách tối ưu hiệu suất cho ứng dụng React?",
        "Phân biệt giữa REST API và GraphQL?"
      ]
    },
    {
      category: "Công Nghệ",
      questions: [
        "Machine Learning là gì và ứng dụng thực tế?",
        "Blockchain hoạt động như thế nào?", 
        "Cách bảo mật website từ các cuộc tấn công XSS?",
        "Docker và Kubernetes khác nhau như thế nào?"
      ]
    },
    {
      category: "Mạng & Hệ Thống",
      questions: [
        "Cách khắc phục lỗi mất kết nối Internet?",
        "Cài đặt mạng VPN riêng như thế nào?", 
        "So sánh giữa IPv4 và IPv6?",
        "Cấu hình tường lửa cơ bản cho server?"
      ]
    },
  ];

  // Load conversations from localStorage on component mount
  useEffect(() => {
    try {
      const savedConversations = JSON.parse(localStorage.getItem('chatConversations')) || [];
      setConversations(savedConversations);

      // Get the last active conversation ID
      const lastActiveId = localStorage.getItem('activeConversationId');
      if (lastActiveId && savedConversations.find(conv => conv.id === lastActiveId)) {
        setActiveConversationId(lastActiveId);
        setIsTemporaryChat(false);
      }
    } catch (err) {
      console.error('Error loading conversations from localStorage:', err);
    }
  }, []);

  // Khởi tạo chat khi component mount
  useEffect(() => {
    const setupChat = async () => {
      try {
        const chatInstance = await initChat();
        setChat(chatInstance);
        
        if (activeConversationId && !isTemporaryChat) {
          // Load existing conversation if available
          const activeConversation = conversations.find(conv => conv.id === activeConversationId);
          if (activeConversation) {
            setMessages(activeConversation.messages || []);
            return;
          }
        }
        
        // Create a temporary chat session (not saved to history yet)
        setMessages([{ 
          role: 'assistant',
          content: 'Xin chào! Tôi là trợ lý AI chuyên về IT của CampusLearning. Tôi sẽ giúp bạn trả lời các câu hỏi về lập trình, công nghệ và thông tin. Hãy đặt câu hỏi về lĩnh vực công nghệ thông tin để tôi có thể hỗ trợ tốt nhất.' 
        }]);
        setIsTemporaryChat(true);
      } catch (err) {
        console.error('Failed to initialize chat:', err);
        setError('Không thể kết nối đến AI. Vui lòng kiểm tra API key và thử lại sau.');
      } finally {
        setInitializing(false);
        // Focus input after initialization
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    };

    setupChat();
  }, [activeConversationId, conversations]);

  // Update localStorage when conversations change
  useEffect(() => {
    // Always save conversations to localStorage, even if empty array
    // This ensures we maintain an empty array rather than null/undefined
    localStorage.setItem('chatConversations', JSON.stringify(conversations));
  }, [conversations]);

  // Update active conversation in localStorage
  useEffect(() => {
    if (activeConversationId) {
      localStorage.setItem('activeConversationId', activeConversationId);
    } else {
      // Don't remove activeConversationId from localStorage when it becomes null
      // Just set it to an empty string to indicate no active conversation
      localStorage.setItem('activeConversationId', '');
    }
  }, [activeConversationId]);

  // Update the active conversation with new messages
  useEffect(() => {
    if (isTemporaryChat || !activeConversationId || !messages?.length || initializing) return;

    setConversations(prevConversations => {
      const updatedConversations = prevConversations?.map(conv => {
        if (conv.id === activeConversationId) {
          return {
            ...conv,
            messages,
            updatedAt: new Date().toISOString(),
            title: getConversationTitle(messages)
          };
        }
        return conv;
      });
      return updatedConversations;
    });
  }, [messages, activeConversationId, isTemporaryChat]);

  // Helper to generate a title from messages
  const getConversationTitle = (msgs) => {
    if (!msgs?.length) return "New Chat";
    
    // Find the first user message
    const firstUserMessage = msgs.find(m => m.role === 'user');
    if (!firstUserMessage) return "New Chat";
    
    // Use first 30 chars of the message as title
    const title = firstUserMessage.content.substring(0, 30);
    return title?.length < firstUserMessage.content?.length ? `${title}...` : title;
  };

  // Convert a temporary chat to a permanent one
  const saveTemporaryChat = (messagesWithUserQuery) => {
    // Use provided messages or current state
    const messagesToSave = messagesWithUserQuery || messages;
    
    // Don't save empty chats
    if (messagesToSave?.length <= 1) return;
    
    // Only save if user has asked something
    if (!messagesToSave.find(m => m.role === 'user')) return;
    
    const newConversation = {
      id: Date.now().toString(),
      title: getConversationTitle(messagesToSave),
      messages: [...messagesToSave],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to conversations and save to localStorage
    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    setActiveConversationId(newConversation.id);
    setIsTemporaryChat(false);
    
    return newConversation.id;
  };

  // Create a new conversation
  const createNewChat = () => {
    setMessages([{
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý AI chuyên về IT của CampusLearning. Tôi sẽ giúp bạn trả lời các câu hỏi về lập trình, công nghệ và thông tin. Hãy đặt câu hỏi về lĩnh vực công nghệ thông tin để tôi có thể hỗ trợ tốt nhất.'
    }]);
    setActiveConversationId(null);
    setIsTemporaryChat(true);
  };

  // Delete a conversation
  const deleteConversation = (id) => {
    // Update conversations state - localStorage will update via useEffect
    const updatedConversations = conversations?.filter(conv => conv.id !== id);
    setConversations(updatedConversations);
    
    // If we deleted the active conversation, create a new one
    if (id === activeConversationId) {
      createNewChat();
    }
  };

  // Clear chat history - only place where localStorage for conversations should be cleared
  const clearAllHistory = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả lịch sử trò chuyện? Hành động này không thể hoàn tác.')) {
      setConversations([]);
      // We'll still save an empty array to localStorage via the useEffect
      // Don't use removeItem as it could cause inconsistency
      localStorage.setItem('chatConversations', JSON.stringify([]));
      localStorage.setItem('activeConversationId', '');
      createNewChat();
    }
  };

  // Switch to a conversation
  const switchConversation = (id) => {
    if (id === activeConversationId) return;
    
    // If we're in a temporary chat with user messages, save it first
    if (isTemporaryChat && messages?.length > 1 && messages.some(m => m.role === 'user')) {
      saveTemporaryChat();
    }
    
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setMessages(conversation.messages || []);
      setActiveConversationId(id);
      setIsTemporaryChat(false);
    }
  };

  // Handle suggested question click
  const handleSuggestedQuestion = (question) => {
    setInput(question);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if ((!input.trim() && !selectedImage)) return;
    if (!chat) {
      setError('Chưa kết nối được với AI. Vui lòng tải lại trang.');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    
    // Chuẩn bị message content dựa trên loại tin nhắn
    let userContent = userMessage;
    let hasImage = false;
    
    // Nếu có ảnh, hiển thị ảnh trong tin nhắn
    if (selectedImage) {
      hasImage = true;
      // Nếu không có text, chỉ hiển thị ảnh
      userContent = userMessage || "Phân tích ảnh này";
    }
    
    // Tạo message object với ảnh nếu có
    const userMessageObj = { 
      role: 'user', 
      content: userContent,
      image: selectedImage
    };
    
    // Cập nhật messages state với tin nhắn người dùng
    const updatedMessages = [...messages, userMessageObj];
    setMessages(updatedMessages);
    
    // Hiển thị trạng thái đang tải
    setLoading(true);
    
    // Reset trạng thái ảnh
    const imageToSend = selectedImage;
    setSelectedImage(null);
    setShowImagePreview(false);
    
    try {
      // Nếu là tin nhắn đầu tiên trong chat tạm thời, lưu vào lịch sử
      if (isTemporaryChat) {
        saveTemporaryChat(updatedMessages);
      }
      
      // Gửi tin nhắn đến AI (kèm ảnh nếu có)
      const response = await sendMessage(chat, userMessage, imageToSend);
      
      // Thêm phản hồi từ AI vào state
      const messagesWithResponse = [...updatedMessages, { role: 'assistant', content: response }];
      setMessages(messagesWithResponse);
      
      // Cập nhật cuộc hội thoại trong localStorage
      if (!isTemporaryChat) {
        setConversations(prevConversations => {
          const updatedConversations = prevConversations?.map(conv => {
            if (conv.id === activeConversationId) {
              return {
                ...conv,
                messages: messagesWithResponse,
                updatedAt: new Date().toISOString(),
                title: conv.title || getConversationTitle(messagesWithResponse)
              };
            }
            return conv;
          });
          
          // Đảm bảo lưu vào localStorage ngay lập tức để tránh mất dữ liệu khi điều hướng
          localStorage.setItem('chatConversations', JSON.stringify(updatedConversations));
          
          return updatedConversations;
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    try {
      setInitializing(true);
      const chatInstance = await initChat();
      setChat(chatInstance);
      createNewChat();
      setError(null);
    } catch (err) {
      console.error('Failed to reset chat:', err);
      setError('Không thể khởi tạo lại cuộc trò chuyện. Vui lòng tải lại trang.');
    } finally {
      setInitializing(false);
      // Focus input after reset
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const isEmptyChat = messages?.length === 1 && 
                     messages[0].role === 'assistant' && 
                     messages[0].content === 'Xin chào! Tôi là trợ lý AI chuyên về IT của CampusLearning. Tôi sẽ giúp bạn trả lời các câu hỏi về lập trình, công nghệ và thông tin. Hãy đặt câu hỏi về lĩnh vực công nghệ thông tin để tôi có thể hỗ trợ tốt nhất.';

  // Suggestion actions
  const suggestedActions = [
    { icon: "🎨", label: "Tạo hình ảnh" },
    { icon: "📋", label: "Lập kế hoạch" },
    { icon: "📄", label: "Tóm tắt văn bản" },
    { icon: "💡", label: "Brainstorm ý tưởng" }
  ];

  // Speech Recognition setup
  const setupSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('Speech recognition not supported in this browser');
      return null;
    }

    // Initialize speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    // Configure for Vietnamese
    recognition.lang = 'vi-VN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    
    // Set up event handlers
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + ' ' + transcript.trim());
      stopListening();
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopListening();
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    return recognition;
  };
  
  // Start listening
  const startListening = () => {
    if (!recognitionRef.current) {
      recognitionRef.current = setupSpeechRecognition();
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (error) {
        console.error('Speech recognition error:', error);
      }
    }
  };
  
  // Stop listening
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Handle microphone click
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Update the active conversation with new messages - now only used for switching conversations
  useEffect(() => {
    // Skip the automatic update from messages changes
    // We'll handle updates explicitly in the handleSubmit function
    if (isTemporaryChat || !activeConversationId || !messages?.length || initializing || loading) return;
  }, [messages, activeConversationId, isTemporaryChat, initializing, loading]);

  // Restore the handleNewChat function that was removed in the previous edit
  const handleNewChat = () => {
    // If current chat has user messages, ask to save it
    if (isTemporaryChat && messages.some(m => m.role === 'user')) {
      saveTemporaryChat();
    }
    handleReset();
  };

  // Xử lý sự kiện chọn file ảnh
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }
    
    // Chỉ chấp nhận hình ảnh
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file hình ảnh');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
      setShowImagePreview(true);
    };
    reader.readAsDataURL(file);
  };
  
  // Xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setShowImagePreview(false);
    fileInputRef.current.value = '';
  };

  return (
    <div className="h-[calc(100vh-84px)] bg-white text-gray-950 overflow-hidden flex flex-col md:flex-row">
      {/* Chat History Panel */}
      <div className="hidden md:block md:w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-3 h-full flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Lịch sử</h3>
            <div className="flex items-center gap-2">
              {conversations?.length > 0 && (
                <button
                  onClick={clearAllHistory}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Xóa tất cả
                </button>
              )}
              <button
                onClick={handleNewChat}
                className="flex items-center justify-center w-7 h-7 text-white bg-theme-primary hover:bg-theme-hover rounded-full transition-colors"
                title="Tạo cuộc trò chuyện mới"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {conversations?.length === 0 ? (
              <p className="text-sm text-gray-500">Chưa có cuộc trò chuyện</p>
            ) : (
              conversations?.map((conv) => (
                <div
                  key={conv.id}
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 ${conv.id === activeConversationId ? 'bg-gray-100' : ''}`}
                >
                  <button
                    className={`truncate text-left flex-1 text-sm ${conv.id === activeConversationId ? 'font-medium text-theme-primary' : 'text-gray-700 dark:text-gray-300'}`}
                    onClick={() => switchConversation(conv.id)}
                  >
                    {conv.title}
                  </button>
                  <button
                    onClick={() => deleteConversation(conv.id)}
                    className="p-0.5 text-gray-400 hover:text-gray-600"
                  >
                    <TrashIcon className="h-2.5 w-2.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative bg-gray-50 overflow-hidden">
        {error && (
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10 bg-red-50 border-l-4 border-red-400 p-2 rounded-lg shadow-sm text-sm animate-fadeIn max-w-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {initializing ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-9 w-9 border-2 border-gray-600 border-t-transparent"></div>
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Messages Area - scrollable */}
            <div className={`flex-1 overflow-y-auto min-h-0 ${isEmptyChat ? 'flex items-center justify-center' : ''}`}>
              {isEmptyChat ? (
                <div className="text-center p-5 -mt-24">
                  <h1 className="text-2xl font-medium text-gray-800 mb-4">Hãy đặt câu hỏi liên quan đến IT.</h1>
                </div>
              ) : (
                <div className="py-2 px-4 max-w-3xl mx-auto">
                  {messages?.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex mb-2 px-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[90%] ${message.role === 'assistant' ? 'whitespace-pre-wrap' : ''}`}>
                        <div className="flex items-start gap-2">
                          {message.role === 'assistant' ? (
                            <div className="w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs">
                              <span>AI</span>
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs">
                              <span>U</span>
                            </div>
                          )}
                          <div className={`text-sm ${message.role === 'user' ? '' : 'prose prose-sm max-w-none dark:prose-invert prose-headings:font-medium prose-headings:text-gray-900 dark:prose-headings:text-white prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-p:text-gray-700 dark:prose-p:text-gray-300 prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-code:text-gray-800 dark:prose-code:text-gray-200 prose-strong:text-gray-900 dark:prose-strong:text-white prose-ul:my-1 prose-li:my-0.5 prose-li:marker:text-gray-400 prose-a:text-theme-primary hover:prose-a:text-theme-hover'}`}>
                            {/* Hiển thị ảnh nếu có */}
                            {message.image && message.role === 'user' && (
                              <div className="mb-2">
                                <img 
                                  src={message.image} 
                                  alt="Uploaded content" 
                                  className="max-h-48 rounded-lg shadow-sm border border-gray-200"
                                />
                              </div>
                            )}
                            
                            {message.role === 'user' ? (
                              <p>{message.content}</p>
                            ) : (
                              <ReactMarkdown
                                components={{
                                  pre: ({ node, ...props }) => (
                                    <div className="relative group">
                                      <pre {...props} className="rounded-lg p-3 overflow-x-auto" />
                                    </div>
                                  ),
                                  code: ({ node, inline, ...props }) => (
                                    inline ? 
                                    <code {...props} className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm" /> :
                                    <code {...props} />
                                  ),
                                  ul: ({ node, ...props }) => (
                                    <ul {...props} className="list-disc pl-4" />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol {...props} className="list-decimal pl-4" />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li {...props} className="marker:text-gray-400" />
                                  )
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="flex mb-2 px-3">
                      <div className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-700 text-white flex items-center justify-center flex-shrink-0 mt-1 text-xs">
                          <span>AI</span>
                        </div>
                        <div className="flex space-x-1 items-center">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* Input Area with Suggestions - fixed at bottom */}
            <div className={`flex-shrink-0 px-4 pb-3 pt-1 bg-gray-50 ${isEmptyChat ? 'absolute bottom-0 left-0 right-0' : ''}`}>
              {/* Suggestion buttons */}
              <div className="flex justify-center space-x-2 mb-1.5">
                {suggestedActions?.map((action, idx) => (
                  <button 
                    key={idx} 
                    className="flex items-center gap-1 px-2.5 py-0.5 bg-white border border-gray-200 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                    onClick={() => setInput(action.label)}
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
              
              {/* Input form */}
              <div className="max-w-3xl mx-auto relative">
                <form onSubmit={handleSubmit} className="relative">
                  <button
                    type="button"
                    onClick={handleNewChat}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 z-10"
                    title="Tạo cuộc trò chuyện mới"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                  
                  {/* Hiển thị preview ảnh nếu có */}
                  {showImagePreview && selectedImage && (
                    <div className="absolute bottom-full left-0 p-2 mb-2 bg-white rounded-lg shadow-md border border-gray-200 flex items-start gap-2">
                      <img 
                        src={selectedImage} 
                        alt="Preview" 
                        className="h-16 rounded-md" 
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="p-1 bg-red-50 rounded-full text-red-500 hover:bg-red-100"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Hỏi bất cứ điều gì về IT..."
                    className="w-full py-2 pl-10 pr-24 border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:border-gray-300 focus:ring-0 text-sm bg-white"
                    disabled={loading || initializing}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
                    {/* Nút upload ảnh */}
                    <input 
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      ref={fileInputRef}
                      disabled={loading || initializing}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`p-1 text-gray-400 hover:text-gray-600 cursor-pointer mr-1 ${selectedImage ? 'text-theme-primary' : ''}`}
                      title="Tải lên hình ảnh"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                      </svg>
                    </label>
                    
                    <button
                      type="button"
                      onClick={handleMicClick}
                      className={`p-1 ${isListening ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-gray-500'} mr-1`}
                      title={isListening ? "Dừng ghi âm" : "Ghi âm giọng nói (Tiếng Việt)"}
                    >
                      {isListening ? <StopIcon className="h-4 w-4" /> : <MicrophoneIcon className="h-4 w-4" />}
                    </button>
                    <button
                      type="submit"
                      disabled={loading || initializing || (!input.trim() && !selectedImage)}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:hover:text-gray-300"
                    >
                      <PaperAirplaneIcon className="h-4 w-4" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions Panel */}
      <div className="hidden md:block md:w-80 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center mb-3">
            <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-2" />
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Câu hỏi gợi ý</h3>
          </div>

          {suggestedQuestions?.map((category, idx) => (
            <div key={idx} className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{category.category}</h4>
              <div className="space-y-2">
                {category.questions?.map((question, qIdx) => (
                  <button
                    key={qIdx}
                    onClick={() => handleSuggestedQuestion(question)}
                    className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors text-gray-700 dark:text-gray-300"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIChat; 
