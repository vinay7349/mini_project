from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class Stay(db.Model):
    __tablename__ = 'stays'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(500))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    price_per_night = db.Column(db.Float)
    rating = db.Column(db.Float)
    description = db.Column(db.Text)
    amenities = db.Column(db.String(500))
    contact = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'price_per_night': self.price_per_night,
            'rating': self.rating,
            'description': self.description,
            'amenities': self.amenities,
            'contact': self.contact
        }

class TouristSpot(db.Model):
    __tablename__ = 'tourist_spots'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    image_url = db.Column(db.String(500))
    rating = db.Column(db.Float)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'description': self.description,
            'category': self.category,
            'image_url': self.image_url,
            'rating': self.rating
        }

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    location = db.Column(db.String(300))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    date = db.Column(db.DateTime, nullable=False)
    contact = db.Column(db.String(100))
    tags = db.Column(db.String(300))
    organizer = db.Column(db.String(200))
    interested_count = db.Column(db.Integer, default=0)
    visibility_radius_km = db.Column(db.Float, default=10.0)  # Radius in km - only people within this radius can see
    created_by = db.Column(db.String(200))  # User ID or email who created the event
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'location': self.location,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'date': self.date.isoformat() if self.date else None,
            'contact': self.contact,
            'tags': self.tags,
            'organizer': self.organizer,
            'interested_count': self.interested_count,
            'visibility_radius_km': self.visibility_radius_km,
            'created_by': self.created_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Friend(db.Model):
    __tablename__ = 'friends'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    avatar_url = db.Column(db.String(500))
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(255))
    favorite_place = db.Column(db.String(200))
    home_city = db.Column(db.String(120))
    last_checked_in = db.Column(db.DateTime, default=datetime.utcnow)
    is_online = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'avatar_url': self.avatar_url,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'status': self.status,
            'favorite_place': self.favorite_place,
            'home_city': self.home_city,
            'last_checked_in': self.last_checked_in.isoformat() if self.last_checked_in else None,
            'is_online': self.is_online,
        }

class EventComment(db.Model):
    __tablename__ = 'event_comments'
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id'), nullable=False)
    author = db.Column(db.String(100))
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    event = db.relationship('Event', backref=db.backref('comments', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'author': self.author,
            'comment': self.comment,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

