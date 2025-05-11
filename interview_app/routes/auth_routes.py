from flask import render_template, request, redirect, url_for, flash, session
from werkzeug.security import generate_password_hash
from modules.database import UserDB
import re
from . import auth_bp

def is_valid_email(email):
    pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
    return re.match(pattern, email) is not None

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        if not email or not password:
            return render_template('auth/login.html', error='Please fill in all required fields')
        
        user = UserDB.verify_user(email, password)
        
        if user:
            session['user_id'] = user['id']
            session['username'] = user['username']
            flash('Successfully logged in!', 'success')
            return redirect(url_for('main.dashboard', session=session))
        else:
            return render_template('auth/login.html', error='Invalid email or password')
    
    return render_template('auth/login.html')

@auth_bp.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        fullname = request.form.get('fullname')
        email = request.form.get('email')
        phone = request.form.get('phone')
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if not all([fullname, email, phone, password, confirm_password]):
            return render_template('auth/signup.html', error='Please fill in all required fields')
        
        if not is_valid_email(email):
            return render_template('auth/signup.html', error='Invalid email format')
        
        if password != confirm_password:
            return render_template('auth/signup.html', error='Passwords do not match')
        
        if len(password) < 6:
            return render_template('auth/signup.html', error='Password must be at least 6 characters long')
        
        # Split fullname into first and last name
        name_parts = fullname.split()
        first_name = name_parts[0]
        last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else None
        
        # Create username from email
        username = email.split('@')[0]
        
        # Check if user already exists
        existing_user = UserDB.get_user_by_email(email)
        if existing_user:
            return render_template('auth/signup.html', error='Email already registered')
        
        # Create new user
        user_id = UserDB.create_user(username, email, password, first_name, last_name)
        if user_id:
            flash('Account created successfully! Please log in.', 'success')
            return redirect(url_for('auth.login'))
        else:
            return render_template('auth/signup.html', error='Error creating account')
    
    return render_template('auth/signup.html')

@auth_bp.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'success')
    return redirect(url_for('main.index')) 