from flask import render_template, redirect, url_for, session, flash
from . import main_bp

@main_bp.route('/')
def index():
    return render_template('main/index.html')

@main_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in to access the dashboard.', 'error')
        return redirect(url_for('auth.login'))
    
    # Sample interview data - replace with actual data from database
    interviews = [
        {
            'title': 'Software Engineer Interview',
            'date': '2024-03-20',
            'time': '10:00 AM',
            'status': 'Completed',
            'score': 85
        },
        {
            'title': 'Data Scientist Interview',
            'date': '2024-03-25',
            'time': '2:00 PM',
            'status': 'Scheduled'
        },
        {
            'title': 'Product Manager Interview',
            'date': 'TBD',
            'time': 'TBD',
            'status': 'Awaiting Schedule'
        }
    ]
    
    return render_template('main/dashboard.html', interviews=interviews, session=session)

@main_bp.route('/application_status')
def application_status():
    if 'user_id' not in session:
        flash('Please log in to view application status.', 'error')
        return redirect(url_for('auth.login'))
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
    # return redirect(url_for('main.application_status'), applications=applications)
    return render_template('main/application_status.html', applications=applications, session=session)

@main_bp.route('/interview_menu')
def interview_menu():
    if 'user_id' not in session:
        flash('Please log in to view interview status.', 'error')
        return redirect(url_for('auth.login'))
    
    return render_template('main/interview_menu.html', session=session)
