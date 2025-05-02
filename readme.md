# URH 2.0 - Universal Resource Hub

A platform for discovering free resources across various categories including technology, design, education, business, and more. The platform automatically scrapes and aggregates resources from multiple trusted sources to provide up-to-date learning materials.

This is version 2.0 of the Universal Resource Hub, with improved scraping capabilities and bug fixes.

## ✨ Features

- **Resource Discovery**
  - Automated resource scraping from multiple sources
  - Browse resources by category
  - Real-time resource filtering
  - Clean and intuitive interface

- **Smart Scraping**
  - Scheduled resource updates every 15 minutes
  - Intelligent duplicate detection
  - Fallback scraping mechanisms using Cheerio and Axios
  - Error handling and retry logic
  - URL validation and fallback generation

- **User Experience**
  - Light/dark theme toggle
  - Mobile-responsive design
  - Loading states and error handling
  - Fast and efficient resource loading

## 🛠️ Tech Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** Supabase
- **Scraping:** Custom scraper with Scrapfly API integration and Cheerio/Axios fallback
- **Deployment:** Render/Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
   ```
   git clone https://github.com/SK3CHI3/URH-2.0.git
   cd URH-2.0
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the root directory
   - Add the following variables:
     ```
     PORT=3000
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     NODE_ENV=development
     SCRAPFLY_API_KEY=your_scrapfly_api_key (optional)
     ```

4. Start the server
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📁 Project Structure

```
URH-2.0/
├── public/
│   ├── css/
│   │   ├── styles.css
│   │   └── dark-theme.css
│   ├── js/
│   │   ├── main.js
│   │   ├── resources.js
│   │   ├── config.js
│   │   └── auth.js
│   └── images/
├── scraper.js
├── sources.js
├── cron.js
├── server.js
├── package.json
├── .env
└── README.md
```

## 💾 Database Schema

- **Categories**
  - id (primary key)
  - name
  - slug
  - description
  - created_at

- **Resources**
  - id (primary key)
  - title
  - description
  - source_url
  - image_url
  - source
  - category_id (foreign key)
  - created_at
  - updated_at

## 🔄 Resource Sources

Currently scraping from:
- GeeksGod
- UdemyFreebies
- UdemyKing
- freeCodeCamp
- Smashing Magazine
- Entrepreneur

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and updates.

### Version 2.0 Updates
- Fixed issue with resource URLs being invalid or unavailable
- Added fallback URL generation for resources with missing URLs
- Improved scraping reliability with Cheerio and Axios fallback
- Added cache control headers to prevent caching issues
- Added diagnostic tools for URL validation

## 📄 License

MIT

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.