from flask import render_template

def register_routes(app):
    @app.route('/')
    def index():
        return render_template('interview.html')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html') 