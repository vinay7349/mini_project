import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from pymongo.errors import PyMongoError

load_dotenv()

from models import db  # noqa: E402
from mongo_client import get_mongo_db, test_connection  # noqa: E402
from routes.ai_routes import ai_bp  # noqa: E402
from routes.auth_routes import auth_bp  # noqa: E402
from routes.culture_routes import culture_bp  # noqa: E402
from routes.emergency_routes import emergency_bp  # noqa: E402
from routes.events_routes import events_bp  # noqa: E402
from routes.social_routes import social_bp  # noqa: E402
from routes.stays_routes import stays_bp  # noqa: E402
from routes.tourist_routes import tourist_bp  # noqa: E402
from routes.translator_routes import translator_bp  # noqa: E402

app = Flask(__name__)

# ---------------------------
# SQLALCHEMY (SQLite)
# ---------------------------
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv("SECRET_KEY")  # take from .env
app.config['AUTH_SALT'] = os.getenv('TOKEN_SALT', 'smartstay-auth')
app.config['AUTH_TOKEN_TTL'] = int(os.getenv('TOKEN_EXP_SECONDS', 60 * 60 * 24 * 7))

CORS(app)
db.init_app(app)

# ---------------------------
# Register blueprints
# ---------------------------
app.register_blueprint(stays_bp)
app.register_blueprint(tourist_bp)
app.register_blueprint(emergency_bp)
app.register_blueprint(culture_bp)
app.register_blueprint(events_bp)
app.register_blueprint(ai_bp)
app.register_blueprint(translator_bp)
app.register_blueprint(auth_bp)
app.register_blueprint(social_bp)


def _mongo_connected():
    """Return True when MongoDB is reachable."""
    try:
        get_mongo_db().command('ping')
        return True
    except PyMongoError:
        return False


@app.route('/')
def index():
    mongo_status = test_connection()
    return jsonify({
        'message': 'SmartStay Navigator API',
        'status': 'running',
        'mongodb': {
            'connected': mongo_status['connected'],
            'database': mongo_status.get('database', 'unknown'),
            'error': mongo_status.get('error') if not mongo_status['connected'] else None
        }
    })


@app.route('/api/health')
def health_check():
    """Detailed health check endpoint"""
    from mongo_client import get_users_collection
    
    mongo_status = test_connection()
    health = {
        'status': 'healthy' if mongo_status['connected'] else 'unhealthy',
        'mongodb': mongo_status,
        'flask': 'running',
    }
    
    if mongo_status['connected']:
        try:
            users = get_users_collection()
            user_count = users.count_documents({})
            health['mongodb']['user_count'] = user_count
        except Exception as e:
            health['mongodb']['error'] = str(e)
    
    return jsonify(health)

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Test MongoDB connection on startup
        print("\n" + "="*50)
        print("[STARTING] SmartStay Navigator API...")
        print("="*50)
        mongo_status = test_connection()
        if mongo_status['connected']:
            print(f"[OK] MongoDB: Connected to '{mongo_status['database']}'")
        else:
            print(f"[ERROR] MongoDB: Connection failed - {mongo_status.get('error', 'Unknown error')}")
            print("[WARNING] Authentication features may not work without MongoDB!")
        print("="*50 + "\n")
        
    app.run(debug=True, port=5000)
