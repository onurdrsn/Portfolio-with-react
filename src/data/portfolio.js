// Portfolio data generator function that uses i18n translations
export default function getPortfolioData(t) {
    return [
        {
            title: t('projects.items.insuranceML.title'),
            imgUrl: '/assets/insurance-ml.png',
            stack: ['Python', 'Scikit-learn', 'Pandas', 'Machine Learning'],
            link: '#',
            github: 'https://github.com/onurdrsn',
            description: t('projects.items.insuranceML.description'),
            category: 'Machine Learning',
            featured: true
        },
        {
            title: t('projects.items.urbanSound.title'),
            imgUrl: '/assets/urbansound.png',
            stack: ['Python', 'TensorFlow', 'CNN', 'Audio Processing'],
            link: '#',
            github: 'https://github.com/onurdrsn',
            description: t('projects.items.urbanSound.description'),
            category: 'Machine Learning',
            featured: true
        },
        {
            title: t('projects.items.transcendence.title'),
            imgUrl: '/assets/transcendence.png',
            stack: ['Django', 'Vite', 'PostgreSQL', 'JavaScript', 'WebSocket', 'Redis', 'Docker'],
            link: 'https://onur.pythonanywhere.com/',
            github: 'https://github.com/onurdrsn/transcendence',
            description: t('projects.items.transcendence.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.qrManager.title'),
            imgUrl: '/assets/qr-manager.png',
            stack: ['Vite', 'TypeScript', 'PostgreSQL', 'Netlify'],
            link: 'https://qrcode.onurdrsn.com.tr',
            github: 'https://github.com/onurdrsn/qr-manager',
            description: t('projects.items.qrManager.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.chatApp.title'),
            imgUrl: '/assets/chat-app.png',
            stack: ['Vite', 'TypeScript', 'WebSocket', 'Node.js'],
            link: 'https://0xchat.onurdrsn.com.tr',
            github: 'https://github.com/onurdrsn',
            description: t('projects.items.chatApp.description'),
            category: 'Full Stack',
            featured: false
        },
        // {
        //     title: 'Game Collection',
        //     imgUrl: '/assets/games.png',
        //     stack: ['Vite', 'JavaScript', 'Canvas API'],
        //     link: 'games',
        //     github: 'https://github.com/onurdrsn',
        //     description: 'A collection of classic games built with React including Minesweeper, Tic-Tac-Toe, Hangman, Memory Game, Tower Defense, Flappy Bird, and Breakout. All games feature smooth animations and responsive controls.',
        //     category: 'Frontend',
        //     featured: false
        // },
        {
            title: t('projects.items.terminalWebsite.title'),
            imgUrl: '/assets/termui.png',
            stack: ['HTML', 'CSS', 'JavaScript'],
            link: 'https://termui.onurdrsn.com.tr',
            github: 'https://github.com/onurdrsn',
            description: t('projects.items.terminalWebsite.description'),
            category: 'Frontend',
            featured: false
        },
        // {
        //     title: '42 Event Calculator',
        //     imgUrl: '/assets/42calculator.png',
        //     stack: ['Vite', 'JavaScript'],
        //     link: '/42calculator',
        //     github: 'https://github.com/onurdrsn',
        //     description: 'A specialized calculator for 42 School events and project deadlines. Helps students track their progress and manage time effectively.',
        //     category: 'Frontend',
        //     featured: false
        // },
        {
            title: 'Old Portfolio Website',
            imgUrl: '/assets/oldportfolio.png',
            stack: ['PHP', 'CSS', 'JavaScript'],
            link: 'https://onur-dursun.epizy.com',
            github: 'https://github.com/onurdrsn',
            description: 'My previous personal portfolio website built with PHP. Features project showcase, contact form, and responsive design.',
            category: 'Full Stack',
            featured: false
        },
        // New AI/ML Projects
        {
            title: t('projects.items.airbnbNYC.title'),
            imgUrl: '/assets/airbnb-nyc.png',
            stack: ['Python', 'Pandas', 'Jupyter', 'Data Analysis'],
            link: '#',
            github: 'https://github.com/onurdrsn/AirBnb_NYC_19',
            description: t('projects.items.airbnbNYC.description'),
            category: 'Machine Learning',
            featured: false
        },
        {
            title: t('projects.items.akbankML.title'),
            imgUrl: '/assets/akbank-ml.png',
            stack: ['Python', 'Scikit-learn', 'Pandas', 'Machine Learning'],
            link: '#',
            github: 'https://github.com/onurdrsn/Akbank_Machine_Learning',
            description: t('projects.items.akbankML.description'),
            category: 'Machine Learning',
            featured: false
        },
        {
            title: t('projects.items.aygazML.title'),
            imgUrl: '/assets/aygaz-ml.png',
            stack: ['Python', 'Machine Learning', 'Jupyter'],
            link: '#',
            github: 'https://github.com/onurdrsn/Aygaz-Makine-Ogrenmesi',
            description: t('projects.items.aygazML.description'),
            category: 'Machine Learning',
            featured: false
        },
        {
            title: t('projects.items.depthAI.title'),
            imgUrl: '/assets/depth-ai.png',
            stack: ['Python', 'TensorFlow', 'Neural Networks', 'Video Processing'],
            link: '#',
            github: 'https://github.com/onurdrsn/Depth',
            description: t('projects.items.depthAI.description'),
            category: 'AI',
            featured: false
        },
        {
            title: t('projects.items.globalAI.title'),
            imgUrl: '/assets/global-ai.png',
            stack: ['Python', 'CNN', 'TensorFlow', 'Audio Processing'],
            link: '#',
            github: 'https://github.com/onurdrsn/Global-AI-Project',
            description: t('projects.items.globalAI.description'),
            category: 'AI',
            featured: false
        },
        {
            title: t('projects.items.pythonDataScience.title'),
            imgUrl: '/assets/python-ds.png',
            stack: ['Python', 'Pandas', 'NumPy', 'Matplotlib'],
            link: '#',
            github: 'https://github.com/onurdrsn/Python-For-Data-Science',
            description: t('projects.items.pythonDataScience.description'),
            category: 'Data Science',
            featured: false
        },
        {
            title: t('projects.items.cliAnnotation.title'),
            imgUrl: '/assets/cli-annotation.png',
            stack: ['Python', 'NLP', 'CLI'],
            link: '#',
            github: 'https://github.com/onurdrsn/Cli-Annotation',
            description: t('projects.items.cliAnnotation.description'),
            category: 'NLP',
            featured: false
        },
        // New Web Projects
        {
            title: t('projects.items.footprintCO2.title'),
            imgUrl: '/assets/footprint-co2.png',
            stack: ['TypeScript', 'React', 'Data Visualization'],
            link: 'https://footprintco2.onurdrsn.com.tr',
            github: 'https://github.com/onurdrsn/FootprintCO2',
            description: t('projects.items.footprintCO2.description'),
            category: 'Full Stack',
            featured: false
        },
        {
            title: t('projects.items.interactivePDF.title'),
            imgUrl: '/assets/interactive-pdf.png',
            stack: ['TypeScript', 'React', 'PDF.js'],
            link: '#',
            github: 'https://github.com/onurdrsn/interactive-pdf-book-frontend',
            description: t('projects.items.interactivePDF.description'),
            category: 'Frontend',
            featured: false
        },
        {
            title: t('projects.items.pdfProcessing.title'),
            imgUrl: '/assets/pdf-processing.png',
            stack: ['TypeScript', 'Python', 'PDF Processing'],
            link: 'https://flipbook.onurdrsn.com.tr',
            github: 'https://github.com/onurdrsn/PDFVeriIsleme',
            description: t('projects.items.pdfProcessing.description'),
            category: 'Full Stack',
            featured: false
        }
    ];
}
