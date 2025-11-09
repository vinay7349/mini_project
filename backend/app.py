from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from routes.stays_routes import stays_bp
from routes.tourist_routes import tourist_bp
from routes.emergency_routes import emergency_bp
from routes.culture_routes import culture_bp
from routes.events_routes import events_bp
from routes.ai_routes import ai_bp
from routes.translator_routes import translator_bp
from models import db

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = 'your-secret-key-here'

CORS(app)
db.init_app(app)

# Register blueprints
app.register_blueprint(stays_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(emergency_bp)
app.register_blueprint(culture_bp)
app.register_blueprint(events_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(translator_bp)

@app.route('/')
def index():
    return jsonify({'message': 'SmartStay Navigator API', 'status': 'running'})

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)

