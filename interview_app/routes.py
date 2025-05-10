from flask import render_template, request, redirect, url_for, session
from modules.user_model import User
from modules.db import db

def register_routes(app):
    @app.route('/')
    def index():
        return render_template('interview.html')

    @app.route('/dashboard')
    def dashboard():
        # Example data, replace with real DB queries as needed
        interviews = [
            {
                'title': 'Frontend Developer',
                'date': 'Wednesday, April 30, 2025',
                'time': '1:27 PM',
                'status': 'Ready to Start',
                'score': None
            },
            {
                'title': 'UX Designer',
                'date': 'Friday, May 2, 2025',
                'time': '1:27 PM',
                'status': 'Awaiting Schedule',
                'score': None
            },
            {
                'title': 'Product Manager',
                'date': 'Sunday, April 27, 2025',
                'time': '1:27 PM',
                'status': 'Completed',
                'score': 87  # Example score
            }
        ]
        return render_template('dashboard.html', interviews=interviews)

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        error = None
        if request.method == 'POST':
            email = request.form['email']
            password = request.form['password']
            user = User.query.filter_by(email=email).first()
            if user and user.check_password(password):
                session['user'] = user.email
                return redirect(url_for('dashboard'))
            else:
                error = 'Invalid email or password.'
        return render_template('login.html', error=error)

    @app.route('/signup', methods=['GET', 'POST'])
    def signup():
        error = None
        if request.method == 'POST':
            fullname = request.form['fullname']
            email = request.form['email']
            phone = request.form['phone']
            password = request.form['password']
            confirm_password = request.form['confirm_password']

            if password != confirm_password:
                error = "Passwords do not match."
            elif not fullname or not email or not phone or not password:
                error = "Please fill in all required fields."
            elif User.query.filter_by(email=email).first():
                error = "Email already registered."
            else:
                user = User(fullname=fullname, email=email, phone=phone)
                user.set_password(password)
                db.session.add(user)
                db.session.commit()
                return redirect(url_for('login'))
        return render_template('signup.html', error=error)

    @app.route('/application_status')
    def application_status():
        applications = [
            {
                'title': 'Frontend Developer',
                'application_id': 'Application #1',
                'date': 'April 30, 2025',
                'time': '1:27 PM',
                'status': 'Scheduled'
            },
            {
                'title': 'UX Designer',
                'application_id': 'Application #2',
                'date': 'May 2, 2025',
                'time': '1:27 PM',
                'status': 'Awaiting'
            },
            {
                'title': 'Product Manager',
                'application_id': 'Application #3',
                'date': 'April 27, 2025',
                'time': '1:27 PM',
                'status': 'Completed'
            }
        ]
        return render_template('application_status.html', applications=applications)