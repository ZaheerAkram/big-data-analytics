from flask import Flask, send_from_directory
import os
from config import Config
from modules.database import DatabaseConnection, UserDB
from routes import init_app
import boto3



app = Flask(__name__)
app.config.from_object(Config)

# Initialize database connection pool
DatabaseConnection.initialize_pool()

# Create tables if they don't exist
UserDB.create_tables()

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Serve files from uploads directory
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# Serve files from uploads directory
@app.route('/uploads/questions/<path:filename>')
def serve_audio(filename):
    directory = os.path.join(app.root_path, 'uploads', 'questions')
    print(f"Serving file: {directory}")
    return send_from_directory(directory, filename)

# Initialize routes
init_app(app)

if __name__ == '__main__':
    app.run(debug=True)