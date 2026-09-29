import React from "react";
import { CheckCircle2, Briefcase, Calendar } from "lucide-react";

export default function TimelineItem({ year, company, title, duration, details = [] }) {
    const detailsList = Array.isArray(details) ? details : [details].filter(Boolean);

    return (
        <div className="relative pl-8 sm:pl-10 pb-12 group">
            {/* Holographic Glowing Line */}
            <div className="absolute left-3 sm:left-4 top-4 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-purple-600 to-indigo-900 group-last:to-transparent"></div>

            {/* Glowing Pulsing Node Indicator */}
            <div className="absolute left-3 sm:left-4 top-3 -translate-x-1/2 w-6 h-6 flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-40"></span>
                <div className="w-3.5 h-3.5 bg-violet-500 rounded-full border-2 border-gray-950 group-hover:scale-125 group-hover:bg-purple-400 transition-all duration-300 shadow-lg shadow-violet-500/80"></div>
            </div>

            {/* Futuristic Glassmorphic Card */}
            <div className="bg-gradient-to-br from-gray-900/80 via-gray-900/40 to-gray-950/80 backdrop-blur-xl border border-gray-800/80 rounded-2xl p-6 hover:border-violet-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-3 py-1 bg-violet-500/10 text-violet-300 text-xs font-extrabold rounded-full border border-violet-500/20 shadow-sm flex items-center gap-1">
                                <Calendar size={11} /> {year}
                            </span>
                            <span className="text-xs font-semibold text-gray-400">· {duration}</span>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-violet-300 transition-colors">
                            {title}
                        </h3>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="px-3.5 py-1.5 bg-gray-950/80 text-violet-300 text-xs font-bold rounded-xl border border-violet-500/30 flex items-center gap-1.5 shadow-inner">
                            <Briefcase size={13} className="text-violet-400" />
                            {company}
                        </span>
                    </div>
                </div>

                {/* Bullet Points */}
                <ul className="space-y-2.5">
                    {detailsList.map((detail, index) => (
                        <li key={index} className="flex items-start gap-2.5 text-gray-300 text-xs sm:text-sm leading-relaxed">
                            <CheckCircle2 size={15} className="text-violet-400 mt-0.5 flex-shrink-0" />
                            <span>{detail}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
