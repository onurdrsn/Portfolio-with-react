import { useTranslation } from 'react-i18next';

export default function PortfolioItem({ title, imgUrl, stack = [], link, github, description, category, featured }) {
    const { t } = useTranslation();

    // Translate category
    const getCategoryTranslation = (cat) => {
        const categoryMap = {
            'Full Stack': t('projects.categories.fullStack'),
            'Frontend': t('projects.categories.frontend'),
            'Machine Learning': t('projects.categories.machineLearning')
        };
        return categoryMap[cat] || cat;
    };
    return (
        <div className="group relative bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-violet-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-violet-500/20 hover:-translate-y-2">
            {/* Featured Badge */}
            {featured && (
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    {t('projects.featured')}
                </div>
            )}

            {/* Image Container with Overlay */}
            <div className="relative w-full aspect-video overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/1920x1080/1F2937/8B5CF6?text=' + encodeURIComponent(title);
                    }}
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>

                {/* Category Badge */}
                {category && (
                    <div className="absolute bottom-4 left-4 bg-gray-900/80 backdrop-blur-sm text-violet-400 text-xs font-semibold px-3 py-1 rounded-full border border-violet-500/30">
                        {getCategoryTranslation(category)}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Title */}
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-violet-400 transition-colors duration-300">
                    {title}
                </h3>

                {/* Description */}
                <p className="text-gray-400 text-sm mb-4 line-clamp-3 leading-relaxed">
                    {description}
                </p>

                {/* Tech Stack */}
                {stack.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {stack.map((item, index) => (
                            <span
                                key={index}
                                className="inline-block px-3 py-1 text-xs font-semibold bg-violet-500/10 text-violet-300 border border-violet-500/30 rounded-md hover:bg-violet-500/20 transition-colors duration-200"
                            >
                                {item}
                            </span>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-4">
                    {link && link !== '#' && (
                        <a
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-violet-500/50 transform hover:scale-105"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                {t('projects.liveDemo')}
                            </span>
                        </a>
                    )}
                    {github && (
                        <a
                            href={github}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 text-center bg-gray-700/50 hover:bg-gray-600/50 text-gray-200 font-semibold py-2 px-4 rounded-lg border border-gray-600/50 hover:border-gray-500 transition-all duration-300 hover:shadow-lg transform hover:scale-105"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                                {t('projects.viewGithub')}
                            </span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}