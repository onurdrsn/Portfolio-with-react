import React from "react";
import { useTranslation } from 'react-i18next';
import getTimelineData from "../data/timeline";
import TimelineItem from "./TimelineItem";

export default function Timeline() {
    const { t } = useTranslation();
    const timeline = getTimelineData(t);
    return (
        <div className="py-16" id="experience">
            {/* Section Header */}
            <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    {t('experience.title')} <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{t('experience.titleHighlight')}</span>
                </h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    {t('experience.subtitle')}
                </p>
            </div>

            {/* Timeline Container */}
            <div className="max-w-4xl mx-auto">
                {timeline.map((item, index) => (
                    <TimelineItem
                        key={index}
                        year={item.year}
                        company={item.company}
                        title={item.title}
                        duration={item.duration}
                        details={item.details}
                    />
                ))}
            </div>
        </div>
    );
}
