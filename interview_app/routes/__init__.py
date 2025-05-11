from flask import Blueprint

# Create blueprints
auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
main_bp = Blueprint('main', __name__, url_prefix='/')
interview_bp = Blueprint('interview', __name__, url_prefix='/interview')

# route for the uploads directory
# audio_uploads = Blueprint('audio_uploads', __name__, url_prefix='/uploads/audio')


# Import routes after creating blueprints to avoid circular imports
from . import auth_routes
from . import main_routes
from modules.interview import interview_bp


def init_app(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(interview_bp) 
    # app.register_blueprint(audio_uploads)