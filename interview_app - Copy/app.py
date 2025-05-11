from flask import Flask, send_from_directory
from modules.interview import interview_bp
import config
from routes import register_routes
import os
from modules.db import db

def create_app():
    app = Flask(__name__)
    app.config.from_object(config.Config)
    db.init_app(app)
    
    # Configure static folder for uploads
    app.static_folder = 'static'
    app.static_url_path = '/static'
    
    # Add route to serve files from uploads directory
    @app.route('/uploads/<path:filename>')
    def serve_upload(filename):
        return send_from_directory(os.path.join(app.config['UPLOAD_FOLDER']), filename)
    
    # Register blueprints
    app.register_blueprint(interview_bp)
    # Register additional routes
    register_routes(app)
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)