"""
Seed script to populate database with sample data
Run this script to add initial data for testing
"""

from app import app
from models import db, Stay, TouristSpot, Event
from datetime import datetime, timedelta

def seed_database():
    with app.app_context():
        # Clear existing data (optional - comment out if you want to keep existing data)
        # db.drop_all()
        # db.create_all()

        # Sample Stays
        stays = [
            Stay(
                name="Beachside Hostel",
                address="Malpe Beach Road, Udupi",
                latitude=13.3409,
                longitude=74.7421,
                price_per_night=500,
                rating=4.5,
                description="Cozy hostel near the beach with free WiFi",
                amenities="WiFi, Breakfast, AC",
                contact="+91-1234567890"
            ),
            Stay(
                name="Temple View Guesthouse",
                address="Near Krishna Temple, Udupi",
                latitude=13.3389,
                longitude=74.7515,
                price_per_night=800,
                rating=4.2,
                description="Traditional guesthouse with temple views",
                amenities="WiFi, Traditional Meals",
                contact="+91-9876543210"
            ),
            Stay(
                name="City Center Hotel",
                address="Main Street, Udupi",
                latitude=13.3415,
                longitude=74.7450,
                price_per_night=1200,
                rating=4.7,
                description="Modern hotel in the heart of the city",
                amenities="WiFi, AC, Restaurant, Parking",
                contact="+91-1122334455"
            )
        ]

        # Sample Tourist Spots
        tourist_spots = [
            TouristSpot(
                name="Malpe Beach",
                latitude=13.3444,
                longitude=74.7286,
                description="Beautiful sandy beach perfect for sunset views",
                category="beach",
                image_url="https://via.placeholder.com/400x200?text=Malpe+Beach",
                rating=4.8
            ),
            TouristSpot(
                name="Sri Krishna Temple",
                latitude=13.3394,
                longitude=74.7516,
                description="Historic temple dedicated to Lord Krishna",
                category="temple",
                image_url="https://via.placeholder.com/400x200?text=Krishna+Temple",
                rating=4.9
            ),
            TouristSpot(
                name="St. Mary's Island",
                latitude=13.3792,
                longitude=74.0314,
                description="Unique geological formations and pristine beaches",
                category="beach",
                image_url="https://via.placeholder.com/400x200?text=St+Mary+Island",
                rating=4.7
            ),
            TouristSpot(
                name="Kapu Beach",
                latitude=13.2519,
                longitude=74.7867,
                description="Scenic beach with lighthouse",
                category="beach",
                image_url="https://via.placeholder.com/400x200?text=Kapu+Beach",
                rating=4.6
            )
        ]

        # Sample Events
        tomorrow = datetime.now() + timedelta(days=1)
        next_week = datetime.now() + timedelta(days=7)

        events = [
            Event(
                title="Beach Cleanup Drive",
                description="Join us for a community beach cleanup at Malpe Beach. All are welcome!",
                location="Malpe Beach, Udupi",
                latitude=13.3444,
                longitude=74.7286,
                date=tomorrow.replace(hour=17, minute=0),
                contact="cleanup@example.com",
                tags="environment, community, beach",
                organizer="Local Environmental Group",
                interested_count=15
            ),
            Event(
                title="Free Temple Food Event",
                description="Traditional prasadam (temple food) available for all visitors",
                location="Sri Krishna Temple, Udupi",
                latitude=13.3394,
                longitude=74.7516,
                date=datetime.now().replace(hour=18, minute=0),
                contact="temple@example.com",
                tags="food, culture, temple",
                organizer="Temple Committee",
                interested_count=42
            ),
            Event(
                title="Music Night at Malpe",
                description="Live music performance by local artists near Malpe Beach",
                location="Malpe Beach Area",
                latitude=13.3444,
                longitude=74.7286,
                date=next_week.replace(hour=19, minute=30),
                contact="music@example.com",
                tags="music, entertainment, beach",
                organizer="Music Group Udupi",
                interested_count=28
            ),
            Event(
                title="Sunset Trek at Kudremukh",
                description="Adventure trek to witness beautiful sunset views. Beginner friendly!",
                location="Kudremukh National Park",
                latitude=13.1333,
                longitude=75.2500,
                date=next_week.replace(hour=16, minute=0),
                contact="trekking@example.com",
                tags="adventure, trekking, nature",
                organizer="Adventure Club",
                interested_count=35
            )
        ]

        # Add to database
        for stay in stays:
            existing = Stay.query.filter_by(name=stay.name).first()
            if not existing:
                db.session.add(stay)

        for spot in tourist_spots:
            existing = TouristSpot.query.filter_by(name=spot.name).first()
            if not existing:
                db.session.add(spot)

        for event in events:
            existing = Event.query.filter_by(title=event.title).first()
            if not existing:
                db.session.add(event)

        db.session.commit()
        print("✅ Sample data seeded successfully!")
        print(f"   - {len(stays)} stays added")
        print(f"   - {len(tourist_spots)} tourist spots added")
        print(f"   - {len(events)} events added")

if __name__ == '__main__':
    seed_database()

