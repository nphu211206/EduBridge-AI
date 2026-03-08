/*-----------------------------------------------------------------
* File: UnlockAccount.jsx  
* Author: Quyen Nguyen Duc
* Date: 2025-01-19
* Description: Account unlock page with email and 2FA verification
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { authServices } from '../../services/api';

const UnlockAccount = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('verifying'); // verifying, email-verified, two-fa, unlocked, error
  const [error, setError] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [emailToken, setEmailToken] = useState('');
  const [tempToken, setTempToken] = useState('');
  const [twoFaCode, setTwoFaCode] = useState(['', '', '', '', '', '']);
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  
  // Refs for 2FA inputs
  const inputRefs = useRef([]);

  // Get token and email from URL params
  const unlockToken = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (unlockToken) {
      verifyUnlockToken();
    } else {
      setStep('error');
      setError('Liên kết không hợp lệ. Vui lòng kiểm tra email của bạn.');
    }
  }, [unlockToken]);

  const verifyUnlockToken = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authServices.verifyUnlockToken(unlockToken);
      const data = response.data;

      if (data.user && data.emailToken) {
        setUserInfo(data.user);
        setEmailToken(data.emailToken);
        setStep('email-verified');
        
        // Auto-verify email token
        setTimeout(() => {
          verifyEmailToken(data.emailToken);
        }, 1000);
      } else {
        setStep('error');
        setError(data.message || 'Token không hợp lệ');
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      setStep('error');
      setError(error.response?.data?.message || 'Liên kết không hợp lệ hoặc đã hết hạn');
    } finally {
      setLoading(false);
    }
  };

  const verifyEmailToken = async (token = emailToken) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await authServices.verifyEmailToken(token);
      const data = response.data;

      if (data.unlocked) {
        // Account unlocked successfully (no 2FA required)
        setStep('unlocked');
        toast.success('Tài khoản đã được mở khóa thành công!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Tài khoản đã được mở khóa. Bạn có thể đăng nhập ngay bây giờ.',
              email: userInfo?.email
            }
          });
        }, 3000);
      } else if (data.requiresTwoFA && data.tempToken) {
        // 2FA required
        setTempToken(data.tempToken);
        setStep('two-fa');
        toast.info('Vui lòng nhập mã 2FA để hoàn tất quá trình mở khóa.');
      } else {
        setStep('error');
        setError(data.message || 'Xác thực email thất bại');
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      setStep('error');
      setError(error.response?.data?.message || 'Xác thực email thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleTwoFaInput = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newCode = [...twoFaCode];
    newCode[index] = value;
    setTwoFaCode(newCode);

    // Auto-move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('')?.length === 6) {
      setTimeout(() => verifyTwoFA(newCode.join('')), 100);
    }
  };

  const handleTwoFaKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !twoFaCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const clearTwoFaCode = () => {
    setTwoFaCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  const verifyTwoFA = async (code = twoFaCode.join('')) => {
    if (code?.length !== 6) {
      toast.error('Vui lòng nhập đầy đủ 6 chữ số');
      return;
    }

    setTwoFaLoading(true);
    setError('');

    try {
      const response = await authServices.verifyTwoFAUnlock(code, tempToken);
      const data = response.data;

      if (data.unlocked) {
        setStep('unlocked');
        toast.success('Tài khoản đã được mở khóa thành công!');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Tài khoản đã được mở khóa. Bạn có thể đăng nhập ngay bây giờ.',
              email: userInfo?.email
            }
          });
        }, 3000);
      } else {
        setError(data.message || 'Xác thực 2FA thất bại');
        clearTwoFaCode();
      }
    } catch (error) {
      console.error('2FA verification failed:', error);
      setError(error.response?.data?.message || 'Mã 2FA không chính xác');
      clearTwoFaCode();
    } finally {
      setTwoFaLoading(false);
    }
  };

  const requestNewUnlockEmail = async () => {
    if (!email) {
      toast.error('Không tìm thấy địa chỉ email');
      return;
    }

    setLoading(true);
    try {
      const response = await authServices.requestNewUnlockEmail(email);
      if (response.data.emailSent) {
        toast.success('Email mở khóa mới đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể gửi email mới');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 'verifying':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Đang xác thực liên kết...
            </h2>
            <p className="text-gray-600">
              Vui lòng chờ trong khi chúng tôi xác thực liên kết mở khóa của bạn.
            </p>
          </motion.div>
        );

      case 'email-verified':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email đã được xác thực
            </h2>
            <p className="text-gray-600 mb-4">
              Đang tiến hành mở khóa tài khoản của bạn...
            </p>
            {userInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Tài khoản:</p>
                <p className="font-semibold">{userInfo.fullName}</p>
                <p className="text-sm text-gray-500">{userInfo.email}</p>
              </div>
            )}
          </motion.div>
        );

      case 'two-fa':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Xác thực 2FA
            </h2>
            <p className="text-gray-600 mb-6">
              Vui lòng nhập mã 6 chữ số từ ứng dụng xác thực của bạn để hoàn tất quá trình mở khóa.
            </p>

            {userInfo && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Mở khóa cho:</p>
                <p className="font-semibold">{userInfo.fullName}</p>
                <p className="text-sm text-gray-500">{userInfo.email}</p>
              </div>
            )}

            <div className="flex justify-center space-x-2 mb-6">
              {twoFaCode?.map((digit, index) => (
                <input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleTwoFaInput(index, e.target.value)}
                  onKeyDown={(e) => handleTwoFaKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  disabled={twoFaLoading}
                />
              ))}
            </div>

            <button
              onClick={() => verifyTwoFA()}
              disabled={twoFaLoading || twoFaCode.some(digit => !digit)}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {twoFaLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Đang xác thực...
                </div>
              ) : (
                'Xác thực và mở khóa'
              )}
            </button>

            <button
              onClick={clearTwoFaCode}
              className="w-full mt-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={twoFaLoading}
            >
              Xóa và nhập lại
            </button>
          </motion.div>
        );

      case 'unlocked':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 mb-6 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-900 mb-4">
              🎉 Tài khoản đã được mở khóa!
            </h2>
            <p className="text-gray-600 mb-6">
              Tài khoản của bạn đã được mở khóa thành công. Bạn có thể đăng nhập ngay bây giờ.
            </p>

            {userInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-600">Tài khoản đã mở khóa:</p>
                <p className="font-semibold text-green-900">{userInfo.fullName}</p>
                <p className="text-sm text-green-700">{userInfo.email}</p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Để tăng cường bảo mật tài khoản:</strong>
              </p>
              <ul className="text-sm text-blue-700 space-y-1 text-left">
                <li>• Sử dụng mật khẩu mạnh và duy nhất</li>
                <li>• Bật xác thực 2 bước (2FA) nếu chưa có</li>
                <li>• Thường xuyên kiểm tra hoạt động đăng nhập</li>
              </ul>
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Đang tự động chuyển hướng đến trang đăng nhập trong 3 giây...
            </p>

            <Link
              to="/login"
              state={{ 
                message: 'Tài khoản đã được mở khóa. Bạn có thể đăng nhập ngay bây giờ.',
                email: userInfo?.email
              }}
              className="inline-block bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </motion.div>
        );

      case 'error':
      default:
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="mx-auto w-16 h-16 mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Lỗi mở khóa tài khoản
            </h2>
            <p className="text-gray-600 mb-6">
              {error || 'Đã có lỗi xảy ra khi mở khóa tài khoản của bạn.'}
            </p>

            <div className="space-y-3">
              {email && (
                <button
                  onClick={requestNewUnlockEmail}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Đang gửi...
                    </div>
                  ) : (
                    'Gửi lại email mở khóa'
                  )}
                </button>
              )}

              <Link
                to="/login"
                className="block w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔓 Mở khóa tài khoản
          </h1>
          <p className="text-gray-600">
            CampusLearning
          </p>
        </div>

        <AnimatePresence mode="wait">
          {renderContent()}
        </AnimatePresence>

        {error && step !== 'error' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UnlockAccount; 