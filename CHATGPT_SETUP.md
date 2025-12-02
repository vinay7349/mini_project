# ChatGPT Integration Setup Guide

## 🤖 AI Travel Assistant with ChatGPT

Your SmartStay Navigator now has a powerful AI travel assistant powered by ChatGPT! It provides personalized travel advice, trip planning, destination recommendations, and cultural insights.

## 📋 Setup Instructions

### Step 1: Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy your API key (starts with `sk-...`)

### Step 2: Add API Key to Backend

1. Open your backend `.env` file
2. Add the following line:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

**Example:**
```env
OPENAI_API_KEY=sk-proj-abc123xyz789...
GOOGLE_API_KEY=AIzaSyBYcFnaTm55ORqtRsRDCaMEvw-eX-awhwQ
MONGO_URI=mongodb+srv://...
```

### Step 3: Install Updated Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install the latest OpenAI library (v1.0+) that supports ChatGPT.

### Step 4: Restart Backend Server

```bash
python app.py
```

## ✨ Features

### 1. **Intelligent Travel Advice**
- Ask questions about destinations, activities, and travel tips
- Get personalized recommendations based on your preferences
- Receive cultural insights and local etiquette advice

### 2. **Conversation Context**
- The AI remembers your conversation history
- Provides contextual responses based on previous messages
- Maintains context across multiple questions

### 3. **Trip Planning**
- Create detailed itineraries with budget considerations
- Get day-by-day activity suggestions
- Receive transportation and accommodation tips

### 4. **Smart Suggestions**
- Best places to visit based on your interests
- Restaurant and food recommendations
- Event and activity suggestions
- Safety and travel tips

## 🎯 Usage Examples

### Basic Questions:
- "What are the best places to visit in Udupi?"
- "Tell me about local culture and traditions"
- "What should I pack for a beach trip?"
- "Recommend budget-friendly restaurants"

### Trip Planning:
- "Create a 3-day itinerary for Udupi with ₹5000 budget"
- "Plan a weekend trip to nearby beaches"
- "Suggest activities for a family trip"

### Cultural Insights:
- "What are local customs I should know?"
- "Tell me about traditional festivals"
- "What's the best time to visit?"

## 🔄 Fallback System

The AI assistant uses a smart fallback system:

1. **Primary: ChatGPT (OpenAI)** - Best for detailed travel advice
2. **Secondary: Google Gemini** - If ChatGPT is unavailable
3. **Tertiary: Mock Responses** - Basic responses if no API keys

## 💡 Tips

- **Better Responses**: ChatGPT provides more detailed and contextual advice
- **Cost**: OpenAI charges per token (very affordable for chat)
- **Rate Limits**: Free tier has rate limits, paid tier is recommended for production
- **Privacy**: Your conversations are sent to OpenAI - don't share sensitive information

## 🛠️ Troubleshooting

### "OpenAI library not installed"
```bash
pip install openai>=1.0.0
```

### "Invalid API key"
- Check that your API key starts with `sk-`
- Ensure there are no extra spaces in `.env` file
- Verify the key is active in OpenAI dashboard

### "Rate limit exceeded"
- You've hit OpenAI's rate limit
- Wait a few minutes or upgrade your OpenAI plan
- The system will fallback to Google Gemini if available

### "No response from AI"
- Check your internet connection
- Verify API key is correct
- Check backend logs for error messages
- System will use mock responses as last resort

## 📊 API Models Used

- **ChatGPT**: `gpt-4o-mini` (fast, cost-effective, great quality)
- **Google Gemini**: `gemini-1.5-flash` (fallback option)

## 🔐 Security Notes

- Never commit your `.env` file to version control
- Keep your API keys secret
- Rotate keys if compromised
- Monitor usage in OpenAI dashboard

## 🎉 You're All Set!

Once you've added your `OPENAI_API_KEY` to the `.env` file and restarted the backend, your AI travel assistant will be powered by ChatGPT!

Try asking: "What are the best places to visit in Udupi?" and see the difference! 🚀

