import React from "react";

export default function TimelineItem({ year, company, title, duration, details }) {
    return (
        <div className="relative pl-8 pb-12 group">
            {/* Vertical Line */}
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-transparent group-last:to-transparent"></div>

            {/* Timeline Dot */}
            <div className="absolute left-0 top-2 w-4 h-4 -ml-[7px]">
                <div className="w-full h-full bg-violet-500 rounded-full border-4 border-gray-900 group-hover:scale-125 group-hover:bg-purple-400 transition-all duration-300 shadow-lg shadow-violet-500/50"></div>
            </div>

            {/* Content Card */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-violet-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-violet-500/10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-violet-400 transition-colors duration-300">
                            {title}
                        </h3>
                        <p className="text-violet-400 font-semibold text-lg">
                            {company}
                        </p>
                    </div>
                    <div className="flex flex-col items-start md:items-end gap-1">
                        <span className="inline-block bg-violet-500/10 text-violet-300 text-sm font-semibold px-3 py-1 rounded-full border border-violet-500/30">
                            {year}
                        </span>
                        <span className="text-gray-400 text-sm">
                            {duration}
                        </span>
                    </div>
                </div>

                {/* Details */}
                <ul className="space-y-2">
                    {details.map((detail, index) => (
                        <li key={index} className="flex items-start gap-3 text-gray-300 text-sm leading-relaxed">
                            <span className="text-violet-400 mt-1.5 flex-shrink-0">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            </span>
                            <span>{detail}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
