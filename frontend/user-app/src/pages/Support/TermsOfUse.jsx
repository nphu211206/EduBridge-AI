/*-----------------------------------------------------------------
* File: TermsOfUse.jsx
* Author: Quyen Nguyen Duc
* Date: 2025-07-24
* Description: This file is a component/module for the student application.
* Apache 2.0 License - Copyright 2025 Quyen Nguyen Duc
-----------------------------------------------------------------*/
import React from 'react';
import { motion } from 'framer-motion';

const TermsOfUse = () => {
  const sections = [
    {
      title: "1. Giới thiệu",
      content: "Bằng việc sử dụng nền tảng EduBridge AI, bạn đồng ý với các điều khoản và điều kiện được nêu trong tài liệu này. Vui lòng đọc kỹ các điều khoản trước khi sử dụng dịch vụ."
    },
    {
      title: "2. Quyền sở hữu trí tuệ",
      content: "Tất cả nội dung trên nền tảng thuộc sở hữu của EduBridge AI hoặc được cấp phép sử dụng. Bạn không được:",
      items: [
        "Sao chép, phân phối hoặc sửa đổi hệ thống khóa học khi chưa được phép",
        "Sử dụng tài liệu học tập cho mục đích thương mại",
        "Chia sẻ tài khoản với người khác"
      ]
    },
    {
      title: "3. Bảo mật thông tin",
      content: "Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn theo Chính sách Bảo mật. Việc thu thập và sử dụng dữ liệu tuân thủ các quy định hiện hành."
    },
    {
      title: "4. Thanh toán và Hoàn tiền",
      content: "Các chính sách về thanh toán:",
      items: [
        "Phí khóa học phải thanh toán trước khi bắt đầu học",
        "Chính sách hoàn tiền (nếu có) sẽ theo quy định tại thời điểm đăng ký khóa học",
        "Chúng tôi không chịu trách nhiệm với các giao dịch thông qua bên thứ ba"
      ]
    },
    {
      title: "5. Hành vi người dùng",
      content: "Yêu cầu hành vi chuẩn mực trên cộng đồng:",
      items: [
        "Không dùng ngôn ngữ thù ghét, xúc phạm người hướng dẫn và các học viên khác",
        "Không spam hoặc quảng cáo trong không gian học tập chung",
        "Chịu trách nhiệm hoàn toàn về các nội dung bạn đăng tải"
      ]
    },
    {
      title: "6. Giới hạn trách nhiệm",
      content: "EduBridge AI nỗ lực để cung cấp dịch vụ xuyên suốt nhưng không đảm bảo hệ thống không bao giờ gặp gián đoạn. Chúng tôi không chịu trách nhiệm với các thiệt hại gián tiếp phát sinh từ việc sử dụng nền tảng."
    },
    {
      title: "7. Liên hệ",
      content: "Mọi thắc mắc về Điều khoản Dịch vụ, vui lòng liên hệ:",
      items: [
        "Email: contact@EduBridgeAI.vn",
        "Hotline: 1900 1234",
        "Địa chỉ: Khu Công nghệ cao, TP.HCM"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Điều khoản sử dụng</h1>
          <p className="text-lg text-gray-600">Cập nhật lần cuối: 01/01/2024</p>
        </div>

        <div className="space-y-8">
          {sections?.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.title}</h2>
              <p className="text-gray-600 mb-4">{section.content}</p>
              {section.items && (
                <ul className="space-y-2">
                  {section.items?.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-600">
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mr-2"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsOfUse; 
