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


def get_location_based_suggestions(lat, lon, query):
    """Get location-based suggestions using free OpenStreetMap Nominatim API"""
    try:
        import requests
        
        # Get location name from coordinates (reverse geocoding)
        nominatim_url = f"https://nominatim.openstreetmap.org/reverse"
        params = {
            'lat': lat,
            'lon': lon,
            'format': 'json',
            'addressdetails': 1
        }
        headers = {'User-Agent': 'SmartStay-Navigator/1.0'}
        
        location_response = requests.get(nominatim_url, params=params, headers=headers, timeout=5)
        if location_response.status_code == 200:
            location_data = location_response.json()
            location_name = location_data.get('display_name', 'your location')
            
            # Search for places nearby using Overpass API (free)
            overpass_url = "https://overpass-api.de/api/interpreter"
            radius_km = 5  # 5km radius
            overpass_query = f"""
            [out:json][timeout:25];
            (
              node["tourism"](around:{radius_km * 1000},{lat},{lon});
              node["amenity"](around:{radius_km * 1000},{lat},{lon});
              node["leisure"](around:{radius_km * 1000},{lat},{lon});
            );
            out body;
            """
            
            overpass_response = requests.post(overpass_url, data=overpass_query, headers=headers, timeout=10)
            places = []
            if overpass_response.status_code == 200:
                data = overpass_response.json()
                for element in data.get('elements', [])[:10]:  # Limit to 10 places
                    tags = element.get('tags', {})
                    name = tags.get('name', 'Unnamed Place')
                    place_type = tags.get('tourism') or tags.get('amenity') or tags.get('leisure', 'place')
                    places.append(f"- {name} ({place_type})")
            
            suggestions = f"Based on your location near {location_name}, here are some nearby places:\n\n"
            if places:
                suggestions += "\n".join(places)
            else:
                suggestions += "I found your location, but couldn't find specific places nearby. Try asking about general travel tips!"
            
            return suggestions
    except Exception as e:
        print(f"[AI] Location-based suggestion error: {e}")
    return None


def get_ai_response(prompt, api_key=None, conversation_history=None, user_location=None):
    """
    Try OpenAI ChatGPT first (best for travel advice), then Google Gemini, else mock replies.
    If user_location is provided, enhance with location-based suggestions.
    """
    prompt = prompt or "Hello!"
    location_suggestions = None
    
    # If location is provided and query is location-related, use free APIs first
    if user_location and user_location.get('lat') and user_location.get('lon'):
        location_query_keywords = ['near me', 'nearby', 'around here', 'local', 'this area', 'here']
        if any(keyword in prompt.lower() for keyword in location_query_keywords):
            location_suggestions = get_location_based_suggestions(
                user_location['lat'], 
                user_location['lon'], 
                prompt
            )
            if location_suggestions:
                # Combine with AI response
                enhanced_prompt = f"{prompt}\n\nUser is located at: {user_location.get('lat')}, {user_location.get('lon')}. Provide location-specific advice."
            else:
                enhanced_prompt = f"{prompt}\n\nUser is located at: {user_location.get('lat')}, {user_location.get('lon')}. Provide location-specific travel advice."
        else:
            enhanced_prompt = prompt
    else:
        enhanced_prompt = prompt

    # Prioritize OpenAI ChatGPT for better travel advice
    openai_key = api_key or os.getenv("OPENAI_API_KEY")
    if openai_key:
        response = _get_openai_response(enhanced_prompt, openai_key, conversation_history)
        if response:
            # If we have location suggestions, append them
            if location_suggestions:
                response = f"{response}\n\n📍 Nearby Places:\n{location_suggestions}"
            return response

    # Fallback to Google Gemini
    google_key = os.getenv("GOOGLE_API_KEY")
    if google_key:
        response = _get_google_response(enhanced_prompt, google_key)
        if response:
            if location_suggestions:
                response = f"{response}\n\n📍 Nearby Places:\n{location_suggestions}"
            return response

    # If location-based suggestions available, use them
    if location_suggestions:
        return f"Here are some suggestions based on your location:\n\n{location_suggestions}\n\n💡 Tip: Add OPENAI_API_KEY to your .env file for more detailed AI-powered travel advice!"

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


def _get_openai_response(prompt, api_key, conversation_history=None):
    """Send the prompt to OpenAI ChatGPT API (modern chat completions)."""
    try:
        from openai import OpenAI

        client = OpenAI(api_key=api_key)
        
        # Build conversation messages
        messages = [
            {
                "role": "system",
                "content": (
                    "You are an expert AI travel assistant for SmartStay Navigator. "
                    "You provide personalized travel advice, trip planning suggestions, "
                    "destination recommendations, cultural insights, and practical travel tips. "
                    "Be friendly, informative, and concise. Focus on helping users have the best travel experience. "
                    "When suggesting places, consider budget, safety, local culture, and user preferences. "
                    "Always provide actionable and specific advice."
                )
            }
        ]
        
        # Add conversation history if provided
        if conversation_history:
            messages.extend(conversation_history)
        
        # Add current user message
        messages.append({"role": "user", "content": prompt})
        
        response = client.chat.completions.create(
            model="gpt-4o-mini",  # Using GPT-4o-mini for better responses at lower cost
            messages=messages,
            max_tokens=500,
            temperature=0.7,
            top_p=0.9
        )
        
        if response.choices and len(response.choices) > 0:
            return response.choices[0].message.content.strip()
    except ImportError:
        print("[AI] OpenAI library not installed. Install with: pip install openai")
    except Exception as exc:
        print(f"[AI] OpenAI ChatGPT error: {exc}")
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
    """Generate a travel itinerary using AI if available, else return template"""
    openai_key = os.getenv("OPENAI_API_KEY")
    google_key = os.getenv("GOOGLE_API_KEY")
    
    prompt = f"""Create a detailed {duration} travel itinerary for {location} with a budget of ₹{budget}. 
    Include:
    - Morning activities
    - Afternoon activities  
    - Evening activities
    - Night activities
    - Estimated costs for each activity
    - Local tips and cultural insights
    - Best places to eat
    - Transportation suggestions
    
    Format it nicely with clear sections and be specific about locations and costs."""
    
    # Try AI first
    if openai_key:
        response = _get_openai_response(prompt, openai_key)
        if response:
            return response
    
    if google_key:
        response = _get_google_response(prompt, google_key)
        if response:
            return response
    
    # Fallback template
    return f"Here's your {duration} itinerary for {location} within ₹{budget}:\n\n" \
           f"🌅 Morning: Visit local temples and cultural sites (Free entry)\n" \
           f"🍽️ Afternoon: Enjoy local street food (₹100-200)\n" \
           f"🌊 Evening: Beach walk and sunset viewing (Free)\n" \
           f"🎭 Night: Local music event or cultural performance (₹100-300)\n\n" \
           f"💰 Total estimated cost: ₹{budget}\n\n" \
           f"💡 Tip: For personalized recommendations, make sure OPENAI_API_KEY is set in your .env file!"

