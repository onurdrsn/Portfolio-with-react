// Portfolio data generator function that uses i18n translations
export default function getPortfolioData(t) {
    return [
        {
            title: t('projects.items.chronaMesh.title'),
            imgUrl: '/assets/chronamesh.png',
            stack: ['Vite', 'React', 'TypeScript', 'Tailwind CSS', 'Hono', 'Cloudflare Workers', 'Cloudflare D1', 'WebSockets'],
            link: 'https://chronamesh.onurd.com.tr',
            github: 'https://github.com/onurdrsn/ChronaMesh',
            description: t('projects.items.chronaMesh.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.boardra.title'),
            imgUrl: '/assets/Boardra.png',
            stack: [
                'TypeScript',
                'React Native',
                'Expo',
                'Vite',
                'Tailwind CSS',
                'Zustand',
                'Cloudflare Workers',
                'Cloudflare Durable Objects',
                'Hono',
                'PostgreSQL',
                'WebSockets'
            ],
            link: 'https://boardra.onurd.com.tr',
            github: 'https://github.com/onurdrsn/Boardra',
            description: t('projects.items.boardra.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.orbitEdge.title'),
            imgUrl: '/assets/orbitedge.png',
            stack: ['Vite', 'TypeScript', 'Hono', 'Cloudflare Workers', 'PostgreSQL (Neon)', 'Tailwind CSS'],
            link: 'https://orbitedge.onurd.com.tr',
            github: 'https://github.com/onurdrsn/OrbitEdge',
            description: t('projects.items.orbitEdge.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.nexusERP.title'),
            imgUrl: '/assets/nexus-erp.png',
            stack: ['Vite', 'TypeScript', 'Hono', 'Cloudflare Workers', 'PostgreSQL (Neon)', 'Tailwind CSS'],
            link: 'https://nexuserp.onurd.com.tr',
            github: 'https://github.com/onurdrsn/NexusERP',
            description: t('projects.items.nexusERP.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.tenant.title'),
            imgUrl: '/assets/tenant.png',
            stack: ['Vite', 'TypeScript', 'Hono', 'Cloudflare Workers', 'PostgreSQL (Neon)', 'Tailwind CSS', 'Makefile', 'WebSocket'],
            link: 'https://tenant.onurd.com.tr',
            github: 'https://github.com/onurdrsn/MultiTenant',
            description: t('projects.items.tenant.description'),
            category: 'Full Stack',
            featured: true
        },
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
            stack: ['Vite', 'TypeScript', 'Hono', 'Cloudflare Workers', 'PostgreSQL (Neon)', 'Tailwind CSS'],
            link: 'https://qrcode.onurd.com.tr',
            github: 'https://github.com/onurdrsn/qr-manager',
            description: t('projects.items.qrManager.description'),
            category: 'Full Stack',
            featured: true
        },
        // {
        //     title: 'Game Collection',
        //     imgUrl: '/assets/games.png',
        //     stack: ['Vite', 'JavaScript', 'Canvas API'],
        //     link: 'games',
        //     github: 'https://github.com/onurdrsn',
        //     description: 'A collection of classic games built with Vite including Minesweeper, Tic-Tac-Toe, Hangman, Memory Game, Tower Defense, Flappy Bird, and Breakout. All games feature smooth animations and responsive controls.',
        //     category: 'Frontend',
        //     featured: false
        // },
        {
            title: t('projects.items.terminalWebsite.title'),
            imgUrl: '/assets/termui.png',
            stack: ['HTML', 'CSS', 'JavaScript'],
            link: 'https://termui.onurd.com.tr',
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
            stack: ['TypeScript', 'Vite', 'Data Visualization'],
            link: 'https://footprintco2.onurd.com.tr',
            github: 'https://github.com/onurdrsn/FootprintCO2',
            description: t('projects.items.footprintCO2.description'),
            category: 'Full Stack',
            featured: false
        },
        {
            title: t('projects.items.interactivePDF.title'),
            imgUrl: '/assets/interactive-pdf.png',
            stack: ['TypeScript', 'Vite', 'PDF.js'],
            link: '#',
            github: 'https://github.com/onurdrsn/interactive-pdf-book-frontend',
            description: t('projects.items.interactivePDF.description'),
            category: 'Frontend',
            featured: false
        },
        {
            title: t('projects.items.nexora.title'),
            imgUrl: '/assets/nexora.png',
            stack: ['Cloudflare Workers', 'Durable Objects', 'Cloudflare R2', 'libsodium', 'TypeScript', 'Vite', 'React'],
            link: 'https://nexora.onurd.com.tr',
            github: 'https://github.com/onurdrsn/ChatApp',
            description: t('projects.items.nexora.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.devDiff.title'),
            imgUrl: '/assets/devdiff.png',
            stack: ['Cloudflare Workers AI', 'Llama 3.3', 'Vite', 'React', 'Tailwind CSS', 'TypeScript'],
            link: 'https://devdiff.onurd.com.tr',
            github: 'https://github.com/onurdrsn/DevDiff',
            description: t('projects.items.devDiff.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.listify.title'),
            imgUrl: '/assets/listify.png',
            stack: ['React', 'Vite', 'Tailwind CSS', 'TypeScript', 'Rest APIs', 'Web Notifications'],
            link: 'https://listify.onurd.com.tr',
            github: 'https://github.com/onurdrsn/Listify',
            description: t('projects.items.listify.description'),
            category: 'Frontend',
            featured: true
        },
        {
            title: t('projects.items.pdfusionCloud.title'),
            imgUrl: '/assets/pdfusion-cloud.svg',
            stack: ['Cloudflare Workers', 'Drizzle ORM', 'Stripe', 'React', 'Tailwind CSS', 'TypeScript'],
            link: 'https://pdfusion.onurd.com.tr',
            github: 'https://github.com/onurdrsn/PDFusion-Cloud',
            description: t('projects.items.pdfusionCloud.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.pasteBoard.title'),
            imgUrl: '/assets/pasteboard.png',
            stack: ['Cloudflare Workers AI', 'Vectorize', 'Drizzle ORM', 'JWT', 'React', 'TypeScript'],
            link: 'https://pasteboard.onurd.com.tr',
            github: 'https://github.com/onurdrsn/PasteBoard',
            description: t('projects.items.pasteBoard.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.steadPay.title'),
            imgUrl: '/assets/steadpay.png',
            stack: ['Next.js', 'PostgreSQL', 'Drizzle ORM', 'Shopier API', 'AES-256-GCM', 'TypeScript'],
            link: 'https://steadpay.onurd.com.tr',
            github: 'https://github.com/onurdrsn/PayVault',
            description: t('projects.items.steadPay.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.reconCore.title'),
            imgUrl: '/assets/reconcore.png',
            stack: ['Next.js', 'Cloudflare Workers AI', 'pdf-lib', 'Tailwind CSS', 'TypeScript'],
            link: 'https://reconcore.onurd.com.tr',
            github: 'https://github.com/onurdrsn/ReconCore',
            description: t('projects.items.reconCore.description'),
            category: 'Full Stack',
            featured: true
        },
        {
            title: t('projects.items.gitReadme.title'),
            imgUrl: '/assets/gitreadme.svg',
            stack: ['React 18', 'TypeScript', 'Tailwind CSS', 'Cloudflare D1', 'Vite'],
            link: 'https://gitstats.onurd.com.tr',
            github: 'https://github.com/onurdrsn/YourGithub',
            description: t('projects.items.gitReadme.description'),
            category: 'Full Stack',
            featured: false
        },
        {
            title: t('projects.items.latexCompiler.title'),
            imgUrl: '/assets/latex-compiler.png',
            stack: ['Cloudflare Workers', 'Fly.io', 'Docker', 'Monaco Editor', 'React', 'TypeScript'],
            link: 'https://latexcompile.onurd.com.tr',
            github: 'https://github.com/onurdrsn/fly-latex-compiler',
            description: t('projects.items.latexCompiler.description'),
            category: 'Full Stack',
            featured: true
        }
    ];
}
