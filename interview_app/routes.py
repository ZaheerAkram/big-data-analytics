from flask import render_template, request, redirect, url_for, session

def register_routes(app):
    @app.route('/')
    def index():
        return render_template('interview.html')

    @app.route('/dashboard')
    def dashboard():
        return render_template('dashboard.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        error = None
        if request.method == 'POST':
            email = request.form['email']
            password = request.form['password']
            # Demo credentials
            demo_accounts = {
                'user@example.com': 'password',
                'admin@example.com': 'password'
            }
            if email in demo_accounts and password == demo_accounts[email]:
                session['user'] = email
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

            # Simple validation
            if password != confirm_password:
                error = "Passwords do not match."
            elif not fullname or not email or not phone or not password:
                error = "Please fill in all required fields."
            else:
                # Here you would save the user to the database
                # For demo, just redirect to login
                return redirect(url_for('login'))
        return render_template('signup.html', error=error)