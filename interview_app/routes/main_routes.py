from flask import render_template, redirect, url_for, session, flash
from modules.AI_Bot.Components.evaluate_response import interview_evaluation
from modules.database import InterviewStatusDB, UserJobApplicationDB, JobPositionDB
from . import main_bp

@main_bp.route('/')
def index():
    return render_template('main/index.html')

@main_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        flash('Please log in to access the dashboard.', 'error')
        return redirect(url_for('auth.login'))
    
    # completed = False
    # score, completed = interview_evaluation(session['user_id'], session['title'])
    
    interviews = []
    all_statuses = InterviewStatusDB.get_all_interview_statuses()
    for status in all_statuses:
        title = JobPositionDB.get_job_title_by_id(status[2])
        interviews.append(
            {
            'Interview_id': status[0],
            'title' : title,
            'status': 'Completed' if status[2] else 'Not Completed',
            'score': status[3]
            }
        )
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
