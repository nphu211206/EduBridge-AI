// File: client/src/components/jobs/JobCard.jsx
// PHIÊN BẢN v2.0 - RESILIENT DATA HANDLING

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, DollarSign, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận';
    if (typeof salary === 'string' && salary.toLowerCase() === 'thỏa thuận') return 'Thỏa thuận';
    return salary;
};

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

// Component nhận onApplyClick và isApplied từ component cha
export default function JobCard({ job, onApplyClick, isApplied }) {
    // Handle both nested (job.company.name) and flat (job.companyName) data formats
    const companyName = job.company?.name || job.companyName || 'Công ty';
    const companyLogoUrl = job.company?.logoUrl || job.companyLogoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`;
    const companySlug = job.company?.slug || job.companySlug || '';
    const skills = Array.isArray(job.skills) ? job.skills : [];
    const dateField = job.postedDate || job.createdAt || job.updatedAt;

    let timeAgo = 'Mới đăng';
    try {
        if (dateField) {
            timeAgo = formatDistanceToNow(new Date(dateField), { addSuffix: true, locale: vi });
        }
    } catch (e) {
        timeAgo = 'Mới đăng';
    }

    return (
        <motion.div
            variants={cardVariants}
            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-400 hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col sm:flex-row items-start gap-6"
        >
            <img
                src={companyLogoUrl}
                alt={`${companyName} logo`}
                className="w-16 h-16 rounded-md object-contain border p-1 flex-shrink-0"
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companyName)}&background=random`; }}
            />

            <div className="flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors">
                            <Link to={`/jobs/${job.id}`}>{job.title}</Link>
                        </h2>
                        {companySlug ? (
                            <Link to={`/companies/${companySlug}`} className="text-md text-gray-600 hover:underline">
                                {companyName}
                            </Link>
                        ) : (
                            <span className="text-md text-gray-600">{companyName}</span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 mt-2 sm:mt-1 flex items-center flex-shrink-0">
                        <Clock className="h-3.5 w-3.5 mr-1.5" /> {timeAgo}
                    </span>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-700 mb-4">
                    <div className="flex items-center" title="Địa điểm">
                        <MapPin className="h-4 w-4 mr-1.5 text-gray-500" />
                        <span>{job.location || 'Không xác định'}</span>
                    </div>
                    <div className="flex items-center" title="Mức lương">
                        <DollarSign className="h-4 w-4 mr-1.5 text-gray-500" />
                        <span>{formatSalary(job.salary)}</span>
                    </div>
                    {job.jobType && (
                        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                            {job.jobType}
                        </span>
                    )}
                </div>

                {skills?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 4)?.map(skill => (
                            <span key={skill} className="bg-blue-50 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-200">
                                {skill}
                            </span>
                        ))}
                        {skills?.length > 4 && (
                            <span className="bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-gray-200">
                                +{skills?.length - 4}
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="w-full sm:w-auto mt-4 sm:mt-0 sm:self-center">
                <button
                    onClick={() => onApplyClick && onApplyClick(job)}
                    disabled={isApplied}
                    className="w-full sm:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isApplied ? 'Đã ứng tuyển' : 'Ứng tuyển'}
                </button>
            </div>
        </motion.div>
    );
};