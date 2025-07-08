## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **LLM Integration**: AI SDK (Vercel)
- **LLM Provider**: Google Gemini (with multi-model fallback)
- **Speech APIs**: Web Speech API, Speech Synthesis API

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- **Google Generative AI API key** (Get one from https://makersuite.google.com/app/apikey)
- **Modern browser** with speech support (Chrome, Edge, Safari)

### Local Development

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd llm-wrapper-app
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
\`\`\`

3. **Set up environment variables**
Create a `.env.local` file in the root directory:
\`\`\`env
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
\`\`\`

4. **Run the development server**
\`\`\`bash
npm run dev
\`\`\`

5. **Open your browser**
Navigate to `http://localhost:3000`

### Speech Interface Setup

The speech interface uses browser APIs and requires:

1. **HTTPS or localhost** - Speech APIs require secure context
2. **Microphone permissions** - Browser will prompt for access
3. **Supported browser**:
   - ✅ Chrome (recommended)
   - ✅ Edge
   - ✅ Safari
   - ❌ Firefox (limited support)

## 🎤 Speech Interface Usage

### Getting Started
1. Click the **"Speech"** tab
2. Allow microphone access when prompted
3. Click **"Start Listening"** to begin voice interaction
4. Speak your question clearly
5. The AI will respond with both text and speech

### Voice Controls
- **Start/Stop Listening**: Control speech recognition
- **Auto-speak Responses**: Toggle automatic speech output
- **Voice Selection**: Choose from available system voices
- **Speech Rate**: Adjust speaking speed (0.5x to 2x)
- **Speech Pitch**: Adjust voice pitch (0.5x to 2x)

### Tips for Best Results
- Speak clearly and at normal pace
- Use a quiet environment
- Wait for the transcript to appear before speaking again
- Use the "Stop Speaking" button to interrupt AI responses


## 🔄 How to Swap Content Domains

The application is designed to make content swapping extremely easy:

### Method 1: Replace Existing Domain
1. Navigate to `/content/{domain-name}/`
2. Replace the `context.txt` file with your new content
3. Restart the application
4. The new content will be automatically loaded in both chat and speech interfaces

### Method 2: Add New Domain
1. Create a new folder in `/content/` (e.g., `/content/science/`)
2. Add a `context.txt` file with your domain-specific content
3. Update the `domains` array in `components/content-selector.tsx`
4. Restart the application

## 🔧 Configuration

### LLM Provider Configuration
The LLM service includes multi-model fallback:
- Primary: `gemini-1.5-flash`
- Fallback 1: `gemini-1.5-flash-8b`
- Fallback 2: `gemini-1.0-pro`

### Speech Configuration
Speech settings are configurable in the interface:
- Voice selection from available system voices
- Speech rate and pitch adjustment
- Auto-speak toggle for responses

**Note**: Speech features work on deployed HTTPS sites and localhost.


## 🔮 Future Extensibility

### Planned Speech Enhancements
1. **External Speech APIs**
   - AssemblyAI integration for better accuracy
   - Deepgram for real-time transcription
   - Custom wake word detection

2. **Advanced Voice Features**
   - Voice activity detection
   - Noise cancellation
   - Multi-language support
   - Voice cloning capabilities

3. **Accessibility Improvements**
   - Keyboard shortcuts for speech controls
   - Screen reader compatibility
   - Visual indicators for audio states

---

**Note**: This application now includes full speech capabilities using browser APIs, providing a complete hands-free AI interaction experience alongside the traditional chat interface.
