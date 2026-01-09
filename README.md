# Design and Implementation of Intelligent Lesson Preparation Assistant System based on AI

An AI-powered system that assists teachers with lesson planning by generating structured lesson outlines, educational content, and resource recommendations using large language models. Developed as an undergraduate graduation thesis project in Computer Science and Technology.

## 🌟 Features

- **AI Chatbot**: Interactive chatbot for answering questions about Chinese language teaching
- **Syllabus Generator**: Automatically generate complete lesson plans and syllabi based on topics
- **Exercise Generator**: Create customized practice exercises for students
- **Multimedia Resources**: Search and retrieve YouTube videos and Wikipedia articles for lessons
- **Student Analysis**: Upload Excel files to analyze student performance and generate insights
- **AI Detection**: Detect AI-generated content in student submissions

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for cloning the repository)

## 🚀 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Ekhtiaj/Design-and-Implementation-of-Intelligent-Lesson-Preparation-Assistant-System-based-on-AI.git
cd Design-and-Implementation-of-Intelligent-Lesson-Preparation-Assistant-System-based-on-AI
```

### Step 2: Install Dependencies

```bash
npm install
```

This will install all required packages:
- `express` - Web server framework
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory of the project:

```bash
# On Windows (PowerShell)
New-Item -Path .env -ItemType File

# On Linux/Mac
touch .env
```

Add the following content to your `.env` file:

```env
# OpenRouter API Configuration
API_KEY=your_openrouter_api_key_here
API_URL=https://openrouter.ai/api/v1/chat/completions
MODEL=deepseek/deepseek-r1-0528:free

# YouTube API Key
YOUTUBE_API_KEY=your_youtube_api_key_here
```

#### How to Get API Keys:

1. **OpenRouter API Key**:
   - Visit [OpenRouter.ai](https://openrouter.ai/)
   - Sign up for an account
   - Navigate to your API keys section
   - Create a new API key
   - Copy the key and paste it in the `.env` file

2. **YouTube API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the YouTube Data API v3
   - Create credentials (API Key)
   - Copy the API key and paste it in the `.env` file

### Step 4: Start the Server

```bash
npm start
```

The server will:
- Load environment variables from `.env`
- Generate `js/config.js` file automatically
- Start the server on `http://localhost:3000`

You should see output like:
```
Loading .env from: [path]
.env exists: true
Parsing .env file...
  Loaded: API_KEY
  Loaded: API_URL
  Loaded: MODEL
  Loaded: YOUTUBE_API_KEY
Config.js file generated successfully
API_KEY loaded: YES
YOUTUBE_API_KEY loaded: YES
Server is running on http://localhost:3000
```

### Step 5: Open in Browser

Open your web browser and navigate to:
```
http://localhost:3000
```

## 📖 Usage

### Chatbot
- Click on the **Chatbot** tab
- Type your question about Chinese language teaching
- Press Enter or click Send
- The AI will respond with helpful information

### Syllabus Generator
- Click on the **Syllabus Generator** tab
- Enter a topic (e.g., "Chinese New Year traditions for beginners")
- Click **Generate**
- A complete lesson plan will be generated with objectives, activities, and assessment

### Exercise Generator
- Click on the **Exercises** tab
- Enter a topic (e.g., "HSK 1 vocabulary practice")
- Click **Generate**
- Customized exercises will be created

### Multimedia Resources
- Click on the **Resources** tab
- Enter a search topic
- Click **Search**
- YouTube videos and Wikipedia articles will be displayed

### Student Analysis
- Click on the **Analysis** tab
- Upload an Excel file (.xls or .xlsx) containing student data
- Click **Analyze**
- View charts and AI-generated insights about student performance

### AI Detection
- Click on the **AI Detection** tab
- Paste a paragraph of text
- Click **Detect AI**
- View the percentage likelihood that the content is AI-generated

## 📁 Project Structure

```
Design-and-Implementation-of-Intelligent-Lesson-Preparation-Assistant-System-based-on-AI/
│
├── css/                          # Stylesheet files
│   ├── style.css                 # Main styles
│   ├── responsive.css            # Responsive design
│   ├── tabs.css                  # Tab navigation styles
│   ├── chat.css                  # Chat interface styles
│   ├── recource.css              # Resource display styles
│   ├── aiDetection.css           # AI detection UI styles
│   └── analysis.css             # Analysis page styles
│
├── js/                           # JavaScript files
│   ├── config.js                 # Auto-generated config (from .env)
│   ├── chat.js                   # Chatbot functionality
│   ├── tabs.js                   # Tab navigation and main features
│   ├── prompts.js                # AI prompt templates
│   └── analysis.js               # Student analysis functionality
│
├── .env                          # Environment variables (NOT in git)
├── .gitignore                    # Git ignore rules
├── index.html                    # Main HTML file
├── package.json                  # Node.js dependencies
├── server.js                     # Express server
└── README.md                     # This file
```

## 🔧 Configuration

### Environment Variables

The `.env` file contains sensitive information and is **not** committed to git. Make sure to:

1. Create your own `.env` file
2. Never commit it to version control
3. Keep your API keys secure

### Port Configuration

By default, the server runs on port `3000`. To change it, add to your `.env`:

```env
PORT=3001
```

## 🛠️ Technologies Used

- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (Vanilla)
  - Chart.js (for data visualization)
  - Marked.js (for markdown parsing)
  - SheetJS (for Excel file reading)

- **Backend**:
  - Node.js
  - Express.js
  - dotenv

- **APIs**:
  - OpenRouter API (DeepSeek R1 0528 model)
  - YouTube Data API v3
  - Wikipedia API

## ⚠️ Important Notes

1. **API Keys Security**:
   - Never commit your `.env` file to git
   - The `js/config.js` file is auto-generated and also ignored by git
   - Keep your API keys private and secure

2. **File Generation**:
   - The `js/config.js` file is automatically generated when you start the server
   - If you delete it, restart the server to regenerate it
   - Do not manually edit `js/config.js` as it will be overwritten

3. **Browser Compatibility**:
   - Works best on modern browsers (Chrome, Firefox, Edge, Safari)
   - Requires JavaScript to be enabled

## 🐛 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Check if port 3000 is already in use
- Verify all dependencies are installed: `npm install`

### API keys not working
- Ensure your `.env` file exists in the root directory
- Check that API keys are correctly formatted (no extra spaces)
- Restart the server after modifying `.env`
- Verify API keys are valid and have proper permissions

### Config.js not loading
- Restart the server - it generates `config.js` on startup
- Check browser console for errors (F12)
- Ensure the server is running before opening the browser

### YouTube API errors
- Verify YouTube Data API v3 is enabled in Google Cloud Console
- Check API key quotas and limits
- Ensure the API key has proper permissions

## 📝 License

This project is developed as an undergraduate graduation thesis project. All rights reserved.

## 👤 Author

**Ekhtiaj**

- GitHub: [@Ekhtiaj](https://github.com/Ekhtiaj)
- Repository: [Design-and-Implementation-of-Intelligent-Lesson-Preparation-Assistant-System-based-on-AI](https://github.com/Ekhtiaj/Design-and-Implementation-of-Intelligent-Lesson-Preparation-Assistant-System-based-on-AI)

## 🙏 Acknowledgments

- OpenRouter for providing AI model access
- Google for YouTube Data API
- All open-source libraries used in this project

## 📞 Support

If you encounter any issues or have questions, please open an issue on the GitHub repository.

---

**Note**: This project is for educational purposes as part of an undergraduate thesis in Computer Science and Technology.
