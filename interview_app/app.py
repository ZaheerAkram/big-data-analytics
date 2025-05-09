from flask import Flask, render_template
from modules.interview import interview_bp
import config

def create_app():
    app = Flask(__name__)
    app.config.from_object(config.Config)
    
    # Register blueprints
    app.register_blueprint(interview_bp)
    
    @app.route('/')
    def index():
        return render_template('interview.html')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)