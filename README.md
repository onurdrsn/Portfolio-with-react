# Portfolio Website

Modern, responsive portfolio website showcasing full-stack development, machine learning projects, and interactive games. Built with React and featuring multi-language support (English & Turkish).

![Portfolio Preview](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- 🌐 **Multi-language Support** - Seamless switching between English and Turkish with localStorage persistence
- 🎨 **Modern Design** - Glassmorphism effects, gradient accents, and smooth animations
- 📱 **Fully Responsive** - Optimized for all devices from mobile to desktop
- 🎮 **Interactive Games** - Collection of 9 classic games built with React
- 📊 **Project Showcase** - Filterable portfolio with detailed project information
- 💼 **Professional Timeline** - Work experience and achievements
- 📬 **Contact Form** - Integrated contact form with toast notifications
- 🧮 **42 Calculator** - Specialized calculator for 42 School events

## 🚀 Tech Stack

### Core
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### Styling
- **TailwindCSS** - Utility-first CSS framework
- **Custom CSS** - Animations and special effects

### Internationalization
- **react-i18next** - React integration for i18next
- **i18next** - Internationalization framework
- **i18next-browser-languagedetector** - Language detection and persistence

### Icons & UI
- **Lucide React** - Modern icon library
- **Custom SVG** - Hand-crafted icons and graphics

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/onurdrsn/Portfolio-with-react.git
   cd Portfolio-with-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## 📁 Project Structure

```
Portfolio-with-react/
├── public/
│   └── assets/          # Images and static assets
├── src/
│   ├── Components/      # React components
│   │   ├── Intro.jsx
│   │   ├── Portfolio.jsx
│   │   ├── Timeline.jsx
│   │   ├── Contact.jsx
│   │   ├── Games.jsx
│   │   ├── LanguageSelector.jsx
│   │   └── ...
│   ├── data/           # Data files
│   │   ├── portfolio.js
│   │   └── timeline.js
│   ├── locales/        # Translation files
│   │   ├── en/
│   │   │   └── translation.json
│   │   └── tr/
│   │       └── translation.json
│   ├── styles/         # CSS files
│   │   └── tailwind.css
│   ├── i18n.js         # i18n configuration
│   ├── App.jsx         # Main app component
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## 🌍 Internationalization

The portfolio supports English and Turkish languages with automatic detection and manual switching.

### Adding a New Language

1. **Create translation file**
   ```
   src/locales/[language-code]/translation.json
   ```

2. **Add language to i18n config**
   ```javascript
   // src/i18n.js
   import translationNEW from './locales/new/translation.json';
   
   const resources = {
     // ... existing languages
     new: { translation: translationNEW }
   };
   ```

3. **Add to language selector**
   ```javascript
   // src/Components/LanguageSelector.jsx
   const languages = [
     // ... existing languages
     { code: 'new', name: 'New Language', flag: '🏳️' }
   ];
   ```

### Translation Structure

```json
{
  "nav": { "home": "Home", ... },
  "hero": { "title": "...", ... },
  "projects": { 
    "title": "...",
    "items": {
      "projectKey": {
        "title": "...",
        "description": "..."
      }
    }
  },
  "timeline": { ... },
  "contact": { ... },
  "games": { ... }
}
```

## 🎮 Games Collection

The portfolio includes 9 interactive games:

1. **Minesweeper** - Classic mine-finding puzzle
2. **Tic Tac Toe** - Two-player strategy game
3. **Hangman** - Word guessing game
4. **Memory Game** - Card matching challenge
5. **Router Game** - Network routing puzzle
6. **Tower Defense** - Strategic defense game
7. **Typing Speed** - Typing practice game
8. **Flappy Bird** - Endless flying game
9. **Breakout** - Classic brick-breaking game

## 📧 Contact Form

The contact form uses [Web3Forms](https://web3forms.com/) for email delivery. To set up:

1. Get your access key from [Web3Forms](https://web3forms.com/)
2. Update the access key in `src/Components/Contact.jsx`

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Netlify

1. Push your code to GitHub
2. Connect your repository to Netlify
3. Set build command: `npm run build`
4. Set publish directory: `dist`

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        // Add your custom colors
      }
    }
  }
}
```

### Content

- **Projects**: Edit `src/data/portfolio.js`
- **Timeline**: Edit `src/data/timeline.js`
- **Translations**: Edit files in `src/locales/`

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Onur Dursun**

- GitHub: [@onurdrsn](https://github.com/onurdrsn)
- LinkedIn: [odursun](https://linkedin.com/in/odursun)
- Email: onurdrsn55@gmail.com

## 🙏 Acknowledgments

- Icons by [Lucide](https://lucide.dev/)
- Fonts from [Google Fonts](https://fonts.google.com/)
- Inspiration from modern portfolio designs

---

⭐ If you like this project, please give it a star on GitHub!
