from flask import Blueprint, jsonify, request
import os
from ai_helper import get_ai_response, generate_itinerary

ai_bp = Blueprint('ai_bp', __name__)

@ai_bp.route("/api/ai/chat", methods=["POST"])
def ai_chat():
    """AI chatbot endpoint with conversation history and location support"""
    data = request.json or {}
    prompt = data.get("message", "")
    api_key = data.get("api_key")  # Optional API key
    conversation_history = data.get("conversation_history", [])  # Support conversation context
    user_location = data.get("user_location")  # {lat, lon} for location-based suggestions
    
    # Validate conversation history format
    if conversation_history:
        # Ensure it's a list of dicts with 'role' and 'content'
        valid_history = []
        for msg in conversation_history:
            if isinstance(msg, dict) and "role" in msg and "content" in msg:
                if msg["role"] in ["user", "assistant", "system"]:
                    valid_history.append({
                        "role": msg["role"],
                        "content": str(msg["content"])
                    })
        conversation_history = valid_history[-10:]  # Keep last 10 messages for context
    
    response = get_ai_response(prompt, api_key, conversation_history, user_location)
    
    return jsonify({
        "response": response,
        "prompt": prompt,
        "model": "chatgpt" if os.getenv("OPENAI_API_KEY") else "gemini" if os.getenv("GOOGLE_API_KEY") else "mock",
        "location_enhanced": bool(user_location)
    })

@ai_bp.route("/api/ai/itinerary", methods=["POST"])
def generate_travel_itinerary():
    """Generate a travel itinerary"""
    data = request.json
    budget = data.get("budget", 1000)
    location = data.get("location", "Unknown")
    duration = data.get("duration", "1 day")
    
    itinerary = generate_itinerary(budget, location, duration)
    
    return jsonify({
        "itinerary": itinerary,
        "budget": budget,
        "location": location,
        "duration": duration
    })

@ai_bp.route("/api/ai/event-create", methods=["POST"])
def ai_event_create():
    """AI-assisted event creation"""
    data = request.json
    user_description = data.get("description", "")
    
    # AI would parse and structure the event
    # For now, return a structured format
    return jsonify({
        "suggested_title": f"Event: {user_description[:50]}...",
        "suggested_description": user_description,
        "suggested_tags": "community,travel,meetup",
        "message": "AI has structured your event. Review and submit!"
    })

