from flask import Flask
from modules.interview import interview_bp
import config
from routes import register_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(config.Config)
    
    # Register blueprints
    app.register_blueprint(interview_bp)
    # Register additional routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)