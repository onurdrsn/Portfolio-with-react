import React from "react";
import PortfolioItem from "./PortfolioItem";

export default function ProjectSection({ title, titleHighlight, subtitle, projects, icon }) {
    if (!projects || projects.length === 0) return null;

    return (
        <div className="mb-20">
            {/* Section Header */}
            <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                    {icon && <span className="text-5xl">{icon}</span>}
                    <h2 className="text-4xl md:text-5xl font-bold text-white">
                        {title} <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">{titleHighlight}</span>
                    </h2>
                </div>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    {subtitle}
                </p>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <PortfolioItem
                        key={project.title}
                        imgUrl={project.imgUrl}
                        title={project.title}
                        stack={project.stack}
                        link={project.link}
                        github={project.github}
                        description={project.description}
                        category={project.category}
                        featured={project.featured}
                    />
                ))}
            </div>
        </div>
    );
}
