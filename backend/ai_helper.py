import os
import random

MOCK_AI_RESPONSES = {
    "greeting": [
        "Hello! I'm your AI travel companion. How can I help you explore today?",
        "Hi traveler! Ready for an adventure? What would you like to know?",
        "Welcome! I'm here to help make your journey amazing. What do you need?"
    ],
    "directions": [
        "Head north for about 500 meters, then turn left at the main intersection.",
        "Walk straight for 2 blocks, you'll see it on your right.",
        "It's just a 10-minute walk from your current location."
    ],
    "events": [
        "I found some exciting events near you! Check out the Events page.",
        "There's a music night happening tonight near the beach!",
        "You might enjoy the cultural festival happening this weekend."
    ],
    "culture": [
        "The locals here love their traditional cuisine, especially the spicy fish curry!",
        "This area is known for its beautiful temples and rich history.",
        "Did you know this region has a unique festival every monsoon?"
    ]
}

GOOGLE_MODEL_NAME = os.getenv("GOOGLE_AI_MODEL", "gemini-1.5-flash")


def get_ai_response(prompt, api_key=None):
    """
    Try Google Generative AI (Gemini) first, then OpenAI, else mock replies.
    """
    prompt = prompt or "Hello!"

    google_key = os.getenv("GOOGLE_API_KEY")
    if google_key:
        response = _get_google_response(prompt, google_key)
        if response:
            return response

    openai_key = api_key or os.getenv("OPENAI_API_KEY")
    if openai_key:
        response = _get_openai_response(prompt, openai_key)
        if response:
            return response

    return get_mock_response(prompt)


def _get_google_response(prompt, api_key):
    """Send the prompt to Google Generative AI."""
    try:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(
            model_name=GOOGLE_MODEL_NAME,
            system_instruction=(
                "You are a cheerful yet concise travel companion for SmartStay Navigator. "
                "Offer practical tips, local insights, and helpful cultural etiquette."
            ),
        )

        response = model.generate_content(
            [
                {
                    "role": "user",
                    "parts": [
                        {
                            "text": prompt
                        }
                    ],
                }
            ],
            safety_settings=[
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_LOW_AND_ABOVE"},
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_LOW_AND_ABOVE"},
            ],
        )

        if response and getattr(response, "text", None):
            return response.text.strip()

        if response and response.candidates:
            for candidate in response.candidates:
                content = getattr(candidate, "content", None)
                if content and content.parts:
                    texts = [part.text for part in content.parts if hasattr(part, "text")]
                    if texts:
                        return " ".join(texts).strip()
    except Exception as exc:
        print(f"Google AI error: {exc}")
    return None


def _get_openai_response(prompt, api_key):
    """Send the prompt to OpenAI ChatCompletion if configured."""
    try:
        import openai

        openai.api_key = api_key
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful AI travel assistant for SmartStay Navigator. Provide friendly, informative, and concise travel advice."
                },
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:
        print(f"OpenAI error: {exc}")
    return None

def get_mock_response(prompt):
    """Generate mock AI response based on prompt keywords"""
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ["hello", "hi", "hey", "greeting"]):
        return random.choice(MOCK_AI_RESPONSES["greeting"])
    elif any(word in prompt_lower for word in ["direction", "how to get", "route", "where is"]):
        return random.choice(MOCK_AI_RESPONSES["directions"])
    elif any(word in prompt_lower for word in ["event", "activity", "happening"]):
        return random.choice(MOCK_AI_RESPONSES["events"])
    elif any(word in prompt_lower for word in ["culture", "local", "tradition", "custom"]):
        return random.choice(MOCK_AI_RESPONSES["culture"])
    else:
        return "I'm here to help! Try asking about places to visit, events, directions, or local culture."

def generate_event_suggestion(user_interest, location):
    """Generate event suggestion based on user interest"""
    suggestions = [
        f"Based on your interest in {user_interest}, I suggest checking out the cultural events happening in {location} this week!",
        f"There's a {user_interest} themed meetup near {location} tomorrow evening.",
        f"Travelers interested in {user_interest} are organizing a group activity in {location}. Check the Events board!"
    ]
    return random.choice(suggestions)

def moderate_content(content):
    """Simple content moderation (can be enhanced with actual AI)"""
    inappropriate_words = ["spam", "advertisement", "scam"]
    content_lower = content.lower()
    for word in inappropriate_words:
        if word in content_lower:
            return False, "Content contains inappropriate material"
    return True, "Content approved"

def generate_travel_story(place_name):
    """Generate a short travel story about a place"""
    stories = {
        "default": [
            f"{place_name} has a rich history dating back centuries. Legends say it was once a sacred ground where travelers would rest.",
            f"Visitors to {place_name} often remark about its stunning architecture and peaceful atmosphere.",
            f"Local folklore tells tales of {place_name} being a meeting point for ancient traders."
        ]
    }
    
    if place_name.lower() in stories:
        return random.choice(stories[place_name.lower()])
    return random.choice(stories["default"])

def generate_itinerary(budget, location, duration="1 day"):
    """Generate a travel itinerary"""
    return f"Here's your {duration} itinerary for {location} within ₹{budget}:\n\n" \
           f"Morning: Visit local temples and cultural sites (Free entry)\n" \
           f"Afternoon: Enjoy local street food (₹100-200)\n" \
           f"Evening: Beach walk and sunset viewing (Free)\n" \
           f"Night: Local music event or cultural performance (₹100-300)\n\n" \
           f"Total estimated cost: ₹{budget}"

