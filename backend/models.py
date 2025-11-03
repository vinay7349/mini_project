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
            'created_at': self.created_at.isoformat() if self.created_at else None
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

