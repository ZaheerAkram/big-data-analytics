# from flask import Blueprint, render_template, request, redirect, url_for, flash, session
# from werkzeug.security import generate_password_hash
# from modules.database import UserDB
# import re

# auth = Blueprint('auth', __name__)

# def is_valid_email(email):
#     pattern = r'^[\w\.-]+@[\w\.-]+\.\w+$'
#     return re.match(pattern, email) is not None

# @auth.route('/signup', methods=['GET', 'POST'])
# def signup():
#     if request.method == 'POST':
#         username = request.form.get('username')
#         email = request.form.get('email')
#         password = request.form.get('password')
#         confirm_password = request.form.get('confirm_password')
#         first_name = request.form.get('first_name')
#         last_name = request.form.get('last_name')

#         # Validation
#         if not all([username, email, password, confirm_password]):
#             flash('All fields are required', 'error')
#             return redirect(url_for('auth.signup'))

#         if not is_valid_email(email):
#             flash('Invalid email format', 'error')
#             return redirect(url_for('auth.signup'))

#         if password != confirm_password:
#             flash('Passwords do not match', 'error')
#             return redirect(url_for('auth.signup'))

#         if len(password) < 8:
#             flash('Password must be at least 8 characters long', 'error')
#             return redirect(url_for('auth.signup'))

#         # Check if user already exists
#         existing_user = UserDB.get_user_by_email(email)
#         if existing_user:
#             flash('Email already registered', 'error')
#             return redirect(url_for('auth.signup'))

#         # Create new user
#         user_id = UserDB.create_user(
#             username=username,
#             email=email,
#             password=password,
#             first_name=first_name,
#             last_name=last_name
#         )

#         if user_id:
#             flash('Registration successful! Please login.', 'success')
#             return redirect(url_for('auth.login'))
#         else:
#             flash('Registration failed. Please try again.', 'error')
#             return redirect(url_for('auth.signup'))

#     return render_template('signup.html')

# @auth.route('/login', methods=['GET', 'POST'])
# def login():
#     if request.method == 'POST':
#         email = request.form.get('email')
#         password = request.form.get('password')

#         if not all([email, password]):
#             flash('All fields are required', 'error')
#             return redirect(url_for('auth.login'))

#         user = UserDB.verify_user(email, password)
#         if user:
#             session['user_id'] = user['id']
#             session['username'] = user['username']
#             flash('Login successful!', 'success')
#             return redirect(url_for('main.dashboard'))
#         else:
#             flash('Invalid email or password', 'error')
#             return redirect(url_for('auth.login'))

#     return render_template('login.html')

# @auth.route('/logout')
# def logout():
#     session.clear()
#     flash('You have been logged out', 'info')
#     return redirect(url_for('auth.login')) 