import React from "react";
import { useTranslation } from 'react-i18next';
import getPortfolioData from "../data/portfolio";
import ProjectSection from "./ProjectSection";

export default function Portfolio() {
    const { t } = useTranslation();
    const portfolio = getPortfolioData(t);

    // Filter projects by category
    const aiProjects = portfolio.filter(p => p.category === 'Machine Learning');
    const webProjects = portfolio.filter(p =>
        p.category === 'Full Stack' || p.category === 'Frontend'
    );

    return (
        <div className="py-16" id="projects">
            {/* AI & Machine Learning Projects Section */}
            <ProjectSection
                title={t('projects.ai.title')}
                titleHighlight={t('projects.ai.titleHighlight')}
                subtitle={t('projects.ai.subtitle')}
                projects={aiProjects}
                icon="🤖"
            />

            {/* Web Development Projects Section */}
            <ProjectSection
                title={t('projects.web.title')}
                titleHighlight={t('projects.web.titleHighlight')}
                subtitle={t('projects.web.subtitle')}
                projects={webProjects}
                icon="🌐"
            />
        </div>
    );
}
