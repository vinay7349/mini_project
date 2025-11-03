import os
import json
import random

# Mock AI responses for offline mode or when API key is not set
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

def get_ai_response(prompt, api_key=None):
    """
    Get AI response from OpenAI API or use mock responses
    
    Args:
        prompt: User's input/question
        api_key: OpenAI API key (optional)
    
    Returns:
        AI generated response or mock response
    """
    if api_key:
        try:
            import openai
            openai.api_key = api_key
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a helpful AI travel assistant for SmartStay Navigator. Provide friendly, informative, and concise travel advice."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=200,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"AI API Error: {e}")
            return get_mock_response(prompt)
    else:
        return get_mock_response(prompt)

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

