/*-----------------------------------------------------------------
* File: index.jsx
* Author: Quyen Nguyen Duc
* Date: 2025-01-27
* Description: Simple, clean educational homepage for EduBridge AI platform
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
"use client"

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchEnrolledCourses, addEnrolledCourse, loadCachedAllCourses, preloadAllCourses } from '@/store/slices/courseSlice';
import courseApi from '@/api/courseApi';
import postService from '@/services/postService';

import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from "framer-motion"
import SEOHelmet from '@/components/SEO/SEOHelmet';
// Removed unused icon imports for better performance
import { setUser } from '@/store/slices/authSlice';
import { injectJsonLdScript, removeJsonLdScript } from '../../utils/safeScriptInjection';

const Home = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, isAuthenticated } = useAuth()
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)
  const [popularCourses, setPopularCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [blogPosts, setBlogPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const dispatch = useDispatch();
  const userFromRedux = useSelector(state => state.auth.user);
  const [authChecked, setAuthChecked] = useState(false);

  // Check if user is coming from verification
  useEffect(() => {
    if (location.state?.fromVerification && location.state?.verified) {
      // Show welcome message
      toast.success(`Chào mừng ${currentUser?.fullName || currentUser?.username || 'bạn'} đã đến với EduBridge AI!`, {
        autoClose: 6000,
        position: "top-center",
        className: "welcome-toast",
        icon: "🎉"
      });

      // Clear the state to prevent showing the message again on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, currentUser, navigate]);

  // SEO structured data for homepage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "EduBridge AI - Trang chủ",
    "description": "Nền tảng học lập trình trực tuyến hàng đầu Việt Nam với 500+ khóa học chất lượng cao",
    "url": "https://campuslearning.online/",
    "isPartOf": {
      "@type": "WebSite",
      "name": "EduBridge AI",
      "url": "https://campuslearning.online"
    },
    "about": {
      "@type": "Thing",
      "name": "Học lập trình trực tuyến"
    },
    "audience": {
      "@type": "Audience",
      "audienceType": "Students, Developers, IT Professionals"
    },
    "provider": {
      "@type": "EducationalOrganization",
      "name": "EduBridge AI",
      "url": "https://campuslearning.online"
    }
  };

  // SEO Meta tags dynamic update
  useEffect(() => {
    // Update meta description dynamically
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content',
        'EduBridge AI - Nền tảng học hỏi hàng đầu. AI cá nhân hóa, thực hành trực tuyến, mentor 1-1. Tham gia 50,000+ học viên thành công!'
      );
    }

    // Update page title
    document.title = 'EduBridge AI - Nền tảng Công nghệ Giáo dục hàng đầu | 500+ khóa học chất lượng';

    // Add breadcrumb structured data
    const breadcrumbData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Trang chủ",
          "item": "https://campuslearning.online/"
        }
      ]
    };
    injectJsonLdScript(breadcrumbData, 'data-breadcrumb', 'home');

    // Add FAQ structured data
    const faqData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "EduBridge AI có miễn phí không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "EduBridge AI cung cấp nhiều khóa học miễn phí và có phí. Bạn có thể đăng ký miễn phí để truy cập các khóa học cơ bản và nâng cấp để học các khóa học premium."
          }
        },
        {
          "@type": "Question",
          "name": "Tôi có thể học kỹ năng mới từ đầu tại EduBridge AI không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Hoàn toàn có thể! EduBridge AI có các khóa học từ cơ bản đến nâng cao, phù hợp cho người mới bắt đầu với lộ trình học cá nhân hóa và mentor hỗ trợ 1-1."
          }
        },
        {
          "@type": "Question",
          "name": "EduBridge AI có cấp chứng chỉ không?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Có, EduBridge AI cấp chứng chỉ hoàn thành khóa học được công nhận bởi các công ty công nghệ hàng đầu như Google, Microsoft, Amazon."
          }
        }
      ]
    };
    injectJsonLdScript(faqData, 'data-faq', 'home');

    return () => {
      // Cleanup scripts on unmount
      removeJsonLdScript('data-breadcrumb', 'home');
      removeJsonLdScript('data-faq', 'home');
    };
  }, []);

  // Load user data from localStorage if not in Redux - only once
  useEffect(() => {
    if (!userFromRedux || Object.keys(userFromRedux)?.length === 0) {
      const userDataString = localStorage.getItem('user');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          dispatch(setUser(userData));
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
  }, [dispatch, userFromRedux]);

  // Authentication check - removed redirect logic to allow viewing home without login
  useEffect(() => {
    setAuthChecked(true);
  }, []);

  const famousQuotes = [
    {
      quote: "Mọi người nghĩ rằng khoa học máy tính là nghệ thuật của những thiên tài, nhưng thực tế ngược lại, chỉ là nhiều người làm việc cùng nhau, giống như xây dựng một bức tường gạch nhỏ.",
      author: "Alan Kay",
      role: "Nhà khoa học máy tính",
    },
    {
      quote: "Đoạn code đầu tiên mà bạn viết sẽ luôn là đoạn code tồi tệ nhất.",
      author: "Jeff Atwood",
      role: "Đồng sáng lập Stack Overflow",
    },
    {
      quote: "Học lập trình không phải là học ngôn ngữ, mà là học cách giải quyết vấn đề.",
      author: "Edsger W. Dijkstra",
      role: "Nhà khoa học máy tính",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex((prevIndex) => (prevIndex === famousQuotes?.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const fetchPopularCourses = async () => {
      try {
        // Fetch courses without requiring authentication for public viewing
        const response = await courseApi.getAllCourses()
        if (response.data && response.data.success) {
          // Lọc và sắp xếp các khóa học theo số lượng học viên
          const courses = response.data.data || []
          const sortedCourses = courses
            .sort((a, b) => (b.EnrolledCount || 0) - (a.EnrolledCount || 0))
            .slice(0, 6) // Lấy 6 khóa học cho homepage

          setPopularCourses(sortedCourses)
        }
      } catch (error) {
        console.error('Error fetching popular courses:', error)
        // Still set loading to false even if API fails, so page can render
      } finally {
        setLoading(false)
      }
    }

    fetchPopularCourses()
  }, [])

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        // Fetch posts without requiring authentication for public viewing
        const token = localStorage.getItem('token');
        const headers = {};

        // Only add Authorization header if token exists
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
        const response = await fetch('/api/posts?limit=3', {
          headers
        });

        if (!response.ok) {
          // If unauthorized but we're in public mode, just show empty state
          if (response.status === 401) {
            console.log('No authentication provided, showing public view');
            setBlogPosts([]);
            setPostsLoading(false);
            return;
          }
          throw new Error('Không thể tải bài viết');
        }

        const contentType = response.headers.get('content-type') || '';
        let data;
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          throw new Error('Server returned non-JSON response');
        }

        const postsWithDefaults = (data.posts || [])?.map(post => ({
          ...post,
          IsLiked: post.IsLiked !== undefined ? post.IsLiked : false,
          IsBookmarked: post.IsBookmarked !== undefined ? post.IsBookmarked : false,
          LikesCount: post.LikesCount !== undefined ? post.LikesCount : 0,
          BookmarksCount: post.BookmarksCount !== undefined ? post.BookmarksCount : 0,
          CommentsCount: post.CommentsCount !== undefined ? post.CommentsCount : 0
        }));

        // Sắp xếp theo thời gian tạo (mới nhất trước) và lấy 3 bài đầu
        const sortedPosts = postsWithDefaults
          .sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt))
          .slice(0, 3);

        setBlogPosts(sortedPosts);
      } catch (error) {
        console.error('Error fetching blog posts:', error)
        // Fallback to empty array if API fails - still allow page to render
        setBlogPosts([])
      } finally {
        setPostsLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Educational categories for EduBridge AI
  const educationalCategories = [
    {
      title: "Frontend",
      image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop",
      courses: "25+"
    },
    {
      title: "Backend",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      courses: "30+"
    },
    {
      title: "Mobile",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop",
      courses: "20+"
    },
    {
      title: "AI & ML",
      image: "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=400&h=300&fit=crop",
      courses: "15+"
    },
  ]

  // Hàm xử lý navigation - cho phép xem public content, yêu cầu login cho chi tiết
  const handleNavigation = (path) => {
    // Allow navigation to public pages without authentication
    const publicPaths = ['/courses', '/posts'];
    const isPublicPath = publicPaths.some(publicPath => path.startsWith(publicPath));

    if (!isAuthenticated && !isPublicPath) {
      // For non-public paths, redirect to login
      navigate("/login");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (!isAuthenticated && isPublicPath) {
      // For public paths when not authenticated, go to login first
      navigate("/login", {
        state: {
          from: path,
          message: "Vui lòng đăng nhập để xem chi tiết"
        }
      });
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // User is authenticated, navigate normally
      navigate(path);
    }
  }

  // Hàm navigation cho các link public (không yêu cầu login ngay)
  const handlePublicNavigation = (path) => {
    navigate(path);
  }

  // Hàm helper để navigate với scroll to top
  const navigateWithScrollToTop = (path) => {
    navigate(path);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  return (
    <>
      <SEOHelmet
        title="EduBridge AI - Nền tảng Công nghệ Giáo dục hàng đầu | 500+ khóa học chất lượng"
        description="EduBridge AI - Nền tảng đào tạo công nghệ trực tuyến. AI cá nhân hóa, thực hành trực tuyến, mentor 1-1."
        keywords="học online, khóa học công nghệ, frontend, backend, mobile app, AI machine learning, edubridge ai"
        image="https://campuslearning.online/images/campus-learning-homepage.jpg"
        url="https://campuslearning.online/"
        type="website"
        structuredData={structuredData}
      />

      {/* Main Container */}
      <main className="min-h-screen bg-white overflow-x-hidden">

        {/* Hero Section - Coursera Style */}
        <section className="py-24 text-white relative overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
            }}
          >
          </div>

          {/* Background Graphics */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Main sphere */}
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Content */}
              <motion.div
                className="text-left"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.h1
                  className="text-3xl lg:text-4xl font-bold mb-6 leading-tight"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                >
                  Nâng cao kỹ năng lập trình để phát triển sự nghiệp
                </motion.h1>
                <motion.p
                  className="text-lg mb-8 opacity-90 leading-relaxed"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                >
                  Tham gia cộng đồng học viên hàng đầu Việt Nam
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                >
                  <motion.button
                    onClick={() => handlePublicNavigation("/register")}
                    className="bg-white text-blue-900 px-8 py-4 font-semibold rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Tham gia miễn phí
                  </motion.button>
                  <motion.button
                    onClick={() => handlePublicNavigation("/courses")}
                    className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 font-semibold rounded-lg transition-all shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Xem khóa học
                  </motion.button>
                </motion.div>
              </motion.div>

              {/* Right side - Visual elements */}
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.p
              className="text-center text-gray-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Chúng tôi hợp tác với 50+ trường đại học và công ty hàng đầu
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center items-center gap-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {[
                { src: "https://upload.wikimedia.org/wikipedia/commons/5/51/RMIT_University_Logo.svg", alt: "RMIT" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png", alt: "Google" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png", alt: "Microsoft" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/IBM_logo.svg/200px-IBM_logo.svg.png", alt: "IBM" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png", alt: "Amazon" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/200px-Apple_logo_black.svg.png", alt: "Apple" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/200px-Meta_Platforms_Inc._logo.svg.png", alt: "Meta" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Intel_logo_%282006-2020%29.svg/200px-Intel_logo_%282006-2020%29.svg.png", alt: "Intel" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Cisco_logo_blue_2016.svg/200px-Cisco_logo_blue_2016.svg.png", alt: "Cisco" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Dell_logo_2016.svg/200px-Dell_logo_2016.svg.png", alt: "Dell" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/HP_logo_2012.svg/200px-HP_logo_2012.svg.png", alt: "HP" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/200px-Netflix_2015_logo.svg.png", alt: "Netflix" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/200px-React-icon.svg.png", alt: "React" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Laravel.svg/200px-Laravel.svg.png", alt: "Laravel" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Ubuntu-logo-2022.svg/2560px-Ubuntu-logo-2022.svg.png", alt: "Ubuntu" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue.js_Logo_2.svg/200px-Vue.js_Logo_2.svg.png", alt: "Vue.js" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/200px-Node.js_logo.svg.png", alt: "Node.js" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/GraphQL_Logo.svg/200px-GraphQL_Logo.svg.png", alt: "GraphQL" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/MongoDB_Logo.svg/1280px-MongoDB_Logo.svg.png", alt: "MongoDB" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Postgresql_elephant.svg/200px-Postgresql_elephant.svg.png", alt: "PostgreSQL" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Docker_%28container_engine%29_logo.svg/200px-Docker_%28container_engine%29_logo.svg.png", alt: "Docker" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Jupyter_logo.svg/200px-Jupyter_logo.svg.png", alt: "Jupyter" }
              ]?.map((logo, index) => (
                <motion.img
                  key={index}
                  src={logo.src}
                  alt={logo.alt}
                  className="h-12 object-contain hover:scale-110 transition-transform"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.1 }}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.h2
              className="text-2xl font-bold text-center mb-8"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Chọn vai trò của bạn
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {educationalCategories.slice(0, 3)?.map((category, index) => (
                <motion.div
                  key={index}
                  className="bg-white border cursor-pointer hover:shadow-md rounded-lg overflow-hidden"
                  onClick={() => handlePublicNavigation("/courses")}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="relative h-48 bg-gradient-to-br from-yellow-400 to-orange-500">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover opacity-80"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Phát triển kỹ năng {category.title.toLowerCase()} chuyên nghiệp
                    </p>
                    <button className="text-blue-600 font-semibold text-sm">
                      Tìm hiểu thêm →
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.button
                onClick={() => handlePublicNavigation("/courses")}
                className="bg-blue-600 text-white px-6 py-2 font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Filter Buttons */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {[
                { text: "Mới", active: true },
                { text: "Sơ cấp", active: false },
                { text: "Phổ biến", active: false },
                { text: "Công cụ", active: false }
              ]?.map((button, index) => (
                <motion.button
                  key={index}
                  className={`px-6 py-2 rounded-full text-sm font-medium ${button.active
                    ? "bg-gray-800 text-white"
                    : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-50"
                    }`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {button.text}
                </motion.button>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Popular Certificates Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Chứng chỉ phổ biến nhất
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Khám phá các chương trình phổ biến nhất của chúng tôi, sẵn sàng cho công việc trong những ngành nghề đang được săn đón.
              </motion.p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              {/* Google Data Analytics */}
              <motion.div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.8 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop"
                    alt="Google Data Analytics"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      Dùng thử miễn phí
                    </span>
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      ⭐ Kỹ năng AI
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"
                      alt="Google"
                      className="h-6 w-auto mr-2"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Phân tích dữ liệu của Google</h3>
                  <div className="flex items-center text-blue-600 text-sm mb-2">
                    <span className="mr-1">🎓</span>
                    Xây dựng hướng tới một bằng cấp
                  </div>
                  <p className="text-gray-500 text-sm">Chứng chỉ Chuyên môn</p>
                </div>
              </motion.div>

              {/* Google Project Management */}
              <motion.div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.0 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop"
                    alt="Google Project Management"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      Dùng thử miễn phí
                    </span>
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      ⭐ Kỹ năng AI
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"
                      alt="Google"
                      className="h-6 w-auto mr-2"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Quản lý dự án của Google</h3>
                  <div className="flex items-center text-blue-600 text-sm mb-2">
                    <span className="mr-1">🎓</span>
                    Xây dựng hướng tới một bằng cấp
                  </div>
                  <p className="text-gray-500 text-sm">Chứng chỉ Chuyên môn</p>
                </div>
              </motion.div>

              {/* Google IT Support */}
              <motion.div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src="https://vbee.vn/blog/wp-content/uploads/2025/03/Lich-su-phat-trien-cua-Google-AI.webp"
                    alt="Google IT Support"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      Dùng thử miễn phí
                    </span>
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      ⭐ Kỹ năng AI
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"
                      alt="Google"
                      className="h-6 w-auto mr-2"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Hỗ trợ CNTT của Google</h3>
                  <div className="flex items-center text-blue-600 text-sm mb-2">
                    <span className="mr-1">🎓</span>
                    Xây dựng hướng tới một bằng cấp
                  </div>
                  <p className="text-gray-500 text-sm">Chứng chỉ Chuyên môn</p>
                </div>
              </motion.div>

              {/* Google UX Design */}
              <motion.div
                className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.4 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&h=200&fit=crop"
                    alt="Google UX Design"
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                      Dùng thử miễn phí
                    </span>
                    <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      ⭐ Kỹ năng AI
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-3">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/200px-Google_2015_logo.svg.png"
                      alt="Google"
                      className="h-6 w-auto mr-2"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Thiết kế UX của Google</h3>
                  <div className="flex items-center text-blue-600 text-sm mb-2">
                    <span className="mr-1">🎓</span>
                    Xây dựng hướng tới một bằng cấp
                  </div>
                  <p className="text-gray-500 text-sm">Chứng chỉ Chuyên môn</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 1.6 }}
            >
              <motion.button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hiển thị thêm 8
              </motion.button>
              <motion.button
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả →
              </motion.button>
            </motion.div>
          </div>
        </section>


        {/* EduBridge AI Ecosystem Section (Added in Phase 6) */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

          <div className="max-w-7xl mx-auto px-4 relative z-10">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="bg-indigo-100 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm inline-block mb-4">
                🌟 MỚI: TÍCH HỢP TRÍ TUỆ NHÂN TẠO
              </span>
              <motion.h2
                className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight flex items-center justify-center gap-3"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Hệ sinh thái <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">EduBridge AI</span>
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Trải nghiệm 5 công cụ đột phá ứng dụng AI, được thiết kế độc quyền giúp bạn học tập, định hướng nghề nghiệp và phát triển bản thân vượt trội.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1: Learning Path */}
              <motion.div
                onClick={() => handleNavigation('/learning-path')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-indigo-100/50 cursor-pointer group relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-indigo-200">
                  🗺️
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">Lộ trình Ứng biến (AI)</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Tự động điều chỉnh lộ trình học theo thời gian thực dựa trên tiến độ và khả năng tiếp thu của riêng bạn.</p>
                <div className="flex items-center text-indigo-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Trải nghiệm ngay</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </motion.div>

              {/* Feature 2: Skill DNA */}
              <motion.div
                onClick={() => handleNavigation('/skill-dna')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-purple-100/50 cursor-pointer group relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-purple-200">
                  🧬
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">Bản đồ Kỹ năng (DNA)</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Phân tích đa chiều các kỹ năng hiện tại, trực quan hóa bằng Radar Chart và phát hiện ngay lỗ hổng kiến thức.</p>
                <div className="flex items-center text-purple-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Khám phá bản thân</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </motion.div>

              {/* Feature 3: Achievements */}
              <motion.div
                onClick={() => handleNavigation('/achievements')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-yellow-100/50 cursor-pointer group relative overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-yellow-200">
                  🏆
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-yellow-600 transition-colors">Thành tựu & Huy hiệu</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">Hệ thống Gamification theo dõi chuỗi ngày học tập (Streak) và vinh danh bạn qua các huy hiệu độc quyền động lực cao.</p>
                <div className="flex items-center text-yellow-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Xem thành tích</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </motion.div>

              {/* Feature 4: Team Builder */}
              <motion.div
                onClick={() => handleNavigation('/team-builder')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-emerald-100/50 cursor-pointer group relative overflow-hidden lg:col-start-1 lg:col-span-1"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white text-3xl mb-6 shadow-lg shadow-emerald-200">
                  🤝
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">Ghép đội Hình (Matching)</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">AI tự động phân tích kỹ năng để gợi ý và định hướng bạn với những teammate hoàn hảo nhất cho các dự án nhóm.</p>
                <div className="flex items-center text-emerald-600 font-semibold group-hover:gap-2 transition-all">
                  <span>Tìm đồng đội</span>
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </motion.div>

              {/* Feature 5: Industry Insights */}
              <motion.div
                onClick={() => handleNavigation('/insights')}
                className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl transition-all duration-300 border border-blue-100/50 cursor-pointer group relative overflow-hidden lg:col-start-2 lg:col-span-2"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110"></div>
                <div className="flex flex-col md:flex-row gap-6 items-start h-full">
                  <div className="w-16 h-16 shrink-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-3xl shadow-lg shadow-blue-200">
                    📈
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">Phân tích Ngành nghề (Real-time)</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed max-w-lg">Cập nhật xu hướng công nghệ nóng hổi nhất, lương thưởng thị trường và biểu đồ nhu cầu tuyển dụng từ dữ liệu thực tế.</p>
                    <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
                      <span>Xem Insight thị trường</span>
                      <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* New Courses Section */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.h2
                className="text-3xl font-bold text-gray-900 mb-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Mới trên CampusLearning
              </motion.h2>
              <motion.p
                className="text-lg text-gray-600 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Khám phá những khóa học mới nhất được cập nhật hàng tuần, mang đến cho bạn kiến thức và kỹ năng mới nhất trong lĩnh vực công nghệ.
              </motion.p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {loading ? (
                Array(4).fill(0)?.map((_, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                    <div className="bg-gray-200 h-40"></div>
                    <div className="p-4">
                      <div className="bg-gray-200 h-4 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 rounded mb-2"></div>
                      <div className="bg-gray-200 h-3 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : (
                popularCourses.slice(0, 4)?.map((course, index) => (
                  <div
                    key={course.CourseID || index}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (!isAuthenticated) {
                        navigate("/login");
                      } else {
                        handleNavigation(`/courses/${course.CourseID}`);
                      }
                    }}
                  >
                    <div className="relative">
                      <img
                        src={course.ImageUrl || `https://images.unsplash.com/photo-${1461749280684 + index}-dccba630e2f6?w=400&h=200&fit=crop`}
                        alt={course.Title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                          Mới
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                          ⭐ Hot
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center mb-3">
                        <span className="text-lg font-bold text-blue-600 mr-2">&lt;/&gt;</span>
                        <span className="text-sm text-gray-600">CampusLearning</span>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {course.Title || `Khóa học ${index + 1}`}
                      </h3>
                      <div className="flex items-center text-blue-600 text-sm mb-2">
                        <span className="mr-1">🎓</span>
                        Khóa học mới nhất
                      </div>
                      <p className="text-gray-500 text-sm">Khóa học Chuyên môn</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Action Buttons */}
            <motion.div
              className="flex justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Hiển thị thêm 8
              </motion.button>
              <motion.button
                onClick={() => handlePublicNavigation("/courses")}
                className="bg-white text-blue-600 border border-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Xem tất cả →
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <motion.div
              className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {[
                { number: "50K+", label: "Học viên" },
                { number: "500+", label: "Khóa học" },
                { number: "98%", label: "Hài lòng" },
                { number: "24/7", label: "Hỗ trợ" }
              ]?.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <motion.div
                    className="text-2xl font-bold"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 + 0.3, type: "spring", stiffness: 200 }}
                  >
                    {stat.number}
                  </motion.div>
                  <div className="text-xs text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Explore Categories Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <motion.h2
              className="text-4xl font-bold text-center mb-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Khám phá CampusLearning
            </motion.h2>
            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {educationalCategories?.map((category, index) => (
                <motion.div
                  key={index}
                  className="bg-white border cursor-pointer hover:shadow-lg rounded-lg overflow-hidden transition-shadow duration-300 min-h-[280px] flex flex-col"
                  onClick={() => handlePublicNavigation("/courses")}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{ y: -10, scale: 1.05 }}
                >
                  <img
                    src={category.image}
                    alt={category.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-lg">{category.title}</h3>
                    <p className="text-base text-blue-600 mt-3">Xem tất cả</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Community Section */}
        <section className="bg-blue-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-stretch"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                className="p-8"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.h2
                  className="text-2xl font-bold mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  Kết quả học tập trên CampusLearning
                </motion.h2>
                <motion.p
                  className="text-gray-600 mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  Hơn 50,000 học viên đã thành công trong sự nghiệp lập trình với các khóa học của chúng tôi.
                  Tham gia cộng đồng và bắt đầu hành trình học tập của bạn ngay hôm nay.
                </motion.p>
                <motion.button
                  onClick={() => handlePublicNavigation("/register")}
                  className="bg-blue-600 text-white px-6 py-3 font-semibold"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Tham gia miễn phí
                </motion.button>
              </motion.div>
              <motion.div
                className="grid grid-cols-2 gap-0 overflow-hidden"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {[
                  { src: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop", alt: "Students learning" },
                  { src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop", alt: "Programming workspace" },
                  { src: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?w=400&h=300&fit=crop", alt: "Team collaboration" },
                  { src: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop", alt: "Success celebration" }
                ]?.map((image, index) => (
                  <motion.img
                    key={index}
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Testimonials Section - Infinite Scroll */}
        <section className="py-12 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 mb-8 sm:mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center"
            >
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800 px-4 mb-4">
                50,000+ người đã tham gia CampusLearning
              </h2>
              <p className="text-gray-600 text-lg">
                Những câu chuyện thành công từ học viên của chúng tôi
              </p>
            </motion.div>
          </div>

          {/* Row 1 - Scroll Left to Right */}
          <div className="relative mb-4 sm:mb-6">
            <motion.div
              animate={{ x: [0, -1920] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-3 sm:gap-6"
              style={{ width: 'max-content' }}
            >
              {[...Array(2)]?.map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  {[
                    {
                      name: "Anh Minh",
                      role: "Full Stack Developer",
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                      review: "CampusLearning đã giúp tôi có được công việc mơ ước trong lĩnh vực lập trình."
                    },
                    {
                      name: "Chị Lan",
                      role: "Frontend Developer",
                      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                      review: "Khóa học chất lượng cao với giảng viên có kinh nghiệm thực tế."
                    },
                    {
                      name: "Anh Tuấn",
                      role: "Backend Developer",
                      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                      review: "Nền tảng học tập tốt nhất cho người mới bắt đầu học lập trình."
                    },
                    {
                      name: "Chị Hương",
                      role: "Mobile Developer",
                      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                      review: "Từ con số 0 đến developer trong 6 tháng nhờ CampusLearning."
                    },
                    {
                      name: "Anh Đức",
                      role: "DevOps Engineer",
                      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                      review: "Community hỗ trợ tuyệt vời, không bao giờ cảm thấy cô đơn trong hành trình học."
                    },
                  ]?.map((testimonial, index) => (
                    <div
                      key={`${setIndex}-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 relative flex-shrink-0 w-[320px] sm:w-[400px] shadow-sm"
                    >
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 text-gray-300 text-4xl">
                        "
                      </div>

                      {/* User Info Section */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-gray-500 text-xs">{testimonial.role}</p>
                        </div>
                      </div>


                      {/* Review Text */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        "{testimonial.review}"
                      </p>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          {/* Row 2 - Scroll Right to Left */}
          <div className="relative mb-4 sm:mb-6">
            <motion.div
              animate={{ x: [-1920, 0] }}
              transition={{
                duration: 40,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-3 sm:gap-6"
              style={{ width: 'max-content' }}
            >
              {[...Array(2)]?.map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  {[
                    {
                      name: "Chị Mai",
                      role: "UI/UX Designer",
                      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                      review: "Giá cả hợp lý, chất lượng không thua kém các khóa học đắt tiền."
                    },
                    {
                      name: "Anh Nam",
                      role: "Tech Lead",
                      avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
                      review: "Sau khóa học, tôi đã tự tin apply vào các công ty lớn và được nhận."
                    },
                    {
                      name: "Chị Linh",
                      role: "Product Manager",
                      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
                      review: "Học theo dự án thực tế giúp tôi có portfolio ấn tượng khi xin việc."
                    },
                    {
                      name: "Anh Hùng",
                      role: "Data Scientist",
                      avatar: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
                      review: "Chương trình học được thiết kế rất khoa học và thực tế."
                    },
                    {
                      name: "Chị Thu",
                      role: "QA Engineer",
                      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
                      review: "Đội ngũ hỗ trợ nhiệt tình, luôn sẵn sàng giải đáp mọi thắc mắc."
                    },
                  ]?.map((testimonial, index) => (
                    <div
                      key={`${setIndex}-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 relative flex-shrink-0 w-[320px] sm:w-[400px] shadow-sm"
                    >
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 text-gray-300 text-4xl">
                        "
                      </div>

                      {/* User Info Section */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-gray-500 text-xs">{testimonial.role}</p>
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        "{testimonial.review}"
                      </p>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>

          {/* Row 3 - Scroll Left to Right (different speed) */}
          <div className="relative">
            <motion.div
              animate={{ x: [0, -1920] }}
              transition={{
                duration: 35,
                repeat: Infinity,
                ease: "linear",
              }}
              className="flex gap-3 sm:gap-6"
              style={{ width: 'max-content' }}
            >
              {[...Array(2)]?.map((_, setIndex) => (
                <React.Fragment key={setIndex}>
                  {[
                    {
                      name: "Anh Long",
                      role: "System Admin",
                      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
                      review: "Kiến thức học được áp dụng ngay vào công việc thực tế."
                    },
                    {
                      name: "Chị Nga",
                      role: "Business Analyst",
                      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
                      review: "Cách giảng dạy dễ hiểu, phù hợp với người mới bắt đầu."
                    },
                    {
                      name: "Anh Quang",
                      role: "Cloud Engineer",
                      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face",
                      review: "Được học từ những chuyên gia có kinh nghiệm trong ngành."
                    },
                    {
                      name: "Chị Phương",
                      role: "Security Engineer",
                      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
                      review: "Nội dung cập nhật liên tục theo xu hướng công nghệ mới."
                    },
                    {
                      name: "Anh Tùng",
                      role: "AI Engineer",
                      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
                      review: "Đầu tư vào học tập tại CampusLearning là quyết định đúng đắn nhất."
                    },
                  ]?.map((testimonial, index) => (
                    <div
                      key={`${setIndex}-${index}`}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-lg transition-all duration-300 relative flex-shrink-0 w-[320px] sm:w-[400px] shadow-sm"
                    >
                      {/* Quote Icon */}
                      <div className="absolute top-4 right-4 text-gray-300 text-4xl">
                        "
                      </div>

                      {/* User Info Section */}
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200">
                          <img
                            src={testimonial.avatar}
                            alt={testimonial.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <div>
                          <p className="text-gray-800 font-semibold text-sm">{testimonial.name}</p>
                          <p className="text-gray-500 text-xs">{testimonial.role}</p>
                        </div>
                      </div>

                      {/* Review Text */}
                      <p className="text-gray-600 text-sm leading-relaxed">
                        "{testimonial.review}"
                      </p>
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Become an Instructor Section */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-indigo-800 text-white">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <motion.div
                className="md:w-1/2"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-3xl font-bold mb-4">Trở thành Giảng viên</h2>
                <p className="text-lg text-blue-100 mb-6 font-medium">
                  Chia sẻ kiến thức, kinh nghiệm của bạn và giúp học viên trên toàn cầu đạt được mục tiêu học tập.
                </p>
                <p className="text-blue-200 mb-8 max-w-lg">
                  CampusLearning cung cấp cho bạn nền tảng, công cụ và sự hỗ trợ cần thiết để giảng dạy và quản lý các khóa học một cách chuyên nghiệp nhất.
                </p>
                <motion.a
                  href="http://localhost:5006"
                  className="inline-block bg-white text-blue-900 px-8 py-4 font-bold rounded-lg hover:bg-yellow-50 hover:text-blue-800 transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Bắt đầu giảng dạy
                </motion.a>
              </motion.div>
              <motion.div
                className="md:w-1/2 flex justify-center"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <img
                  src="https://images.unsplash.com/photo-1573164713988-8665fc963095?w=500&h=400&fit=crop"
                  alt="Instructor teaching"
                  className="rounded-xl shadow-2xl border-4 border-blue-800/50"
                />
              </motion.div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.h2
              className="text-2xl font-bold mb-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Thực hiện bước tiếp theo trong sự nghiệp của bạn
            </motion.h2>
            <motion.p
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Tham gia hàng nghìn học viên đã thành công với CampusLearning
            </motion.p>
            <motion.button
              onClick={() => {
                if (isAuthenticated) {
                  handleNavigation("/courses");
                } else {
                  navigateWithScrollToTop("/register");
                }
              }}
              className="bg-white text-blue-600 px-8 py-3 font-semibold"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tham gia miễn phí
            </motion.button>
          </div>
        </section>
      </main>
    </>
  )
}

export default Home
