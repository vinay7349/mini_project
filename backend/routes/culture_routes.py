import random

from flask import Blueprint, jsonify, request

from auth_utils import auth_required

culture_bp = Blueprint('culture_bp', __name__)

CULTURE_FACTS = {
    "default": [
        {
            "title": "Local Cuisine",
            "fact": "The region is famous for its spicy seafood dishes, especially the traditional fish curry served with steamed rice.",
            "category": "food"
        },
        {
            "title": "Traditional Festivals",
            "fact": "The area celebrates unique festivals during monsoon season with colorful processions and traditional music.",
            "category": "festival"
        },
        {
            "title": "Local Language",
            "fact": "The local dialect has influences from multiple languages, creating a unique linguistic blend.",
            "category": "language"
        },
        {
            "title": "Historical Significance",
            "fact": "This region has been a trading hub for centuries, connecting ancient civilizations.",
            "category": "history"
        },
        {
            "title": "Art & Craft",
            "fact": "Local artisans are known for their intricate handwoven textiles and pottery.",
            "category": "art"
        }
    ]
}

@culture_bp.route("/api/culture", methods=["GET"])
@auth_required
def get_culture_card():
    """Get a random culture fact/card"""
    location = request.args.get('location', 'default')
    facts = CULTURE_FACTS.get(location.lower(), CULTURE_FACTS["default"])
    
    random_fact = random.choice(facts)
    return jsonify({
        "location": location,
        "card": random_fact,
        "message": "Discover local culture!"
    })

@culture_bp.route("/api/culture/story/<place_name>", methods=["GET"])
@auth_required
def get_place_story(place_name):
    """Get a travel story about a specific place"""
    from ai_helper import generate_travel_story
    story = generate_travel_story(place_name)
    
    return jsonify({
        "place": place_name,
        "story": story,
        "type": "travel_story"
    })

@culture_bp.route("/api/buzz-feed", methods=["GET"])
@auth_required
def get_buzz_feed():
    """Get local buzz feed (news, weather, activities)"""
    location = request.args.get('location', 'default')
    
    return jsonify({
        "location": location,
        "feed": [
            {
                "type": "weather",
                "title": "Today's Weather",
                "content": "Sunny, 28°C. Perfect for outdoor activities!"
            },
            {
                "type": "activity",
                "title": "Happening Today",
                "content": "Beach cleanup drive at 5 PM. Join local volunteers!"
            },
            {
                "type": "news",
                "title": "Local Update",
                "content": "New cultural center opens this week with free entry."
            },
            {
                "type": "tip",
                "title": "Travel Tip",
                "content": "Best time to visit temples is early morning or late evening."
            }
        ]
    })

