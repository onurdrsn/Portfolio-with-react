import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { apiGet } from "../lib/api";
import TimelineItem from "./TimelineItem";
import { Briefcase } from 'lucide-react';

export default function Timeline() {
    const { t } = useTranslation();
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        apiGet("/api/timeline", { silent: true })
            .then((data) => {
                if (isMounted) {
                    setTimeline(Array.isArray(data) ? data : []);
                }
            })
            .catch((err) => {
                console.error("Error fetching timeline from DB:", err);
                if (isMounted) setTimeline([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    return (
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto" id="experience">
            {/* Section Header */}
            <div className="text-center mb-14">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-widest mb-3">
                    <Briefcase size={13} className="text-violet-400" />
                    <span>{t('experience.badge') || "Profesyonel Yolculuk"}</span>
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {t('experience.title') || "Kariyer &"} <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">{t('experience.titleHighlight') || "Zaman Çizelgesi"}</span>
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto mt-3">
                    {t('experience.subtitle') || "Geliştirdiğim sistemler, yazılım mimarileri ve araştırmalar."}
                </p>
            </div>

            {/* Timeline List */}
            <div className="relative">
                {timeline.map((item, index) => (
                    <TimelineItem
                        key={item.id || index}
                        year={item.year}
                        company={item.company}
                        title={item.title}
                        duration={item.duration}
                        details={item.details}
                    />
                ))}
            </div>
        </section>
    );
}
