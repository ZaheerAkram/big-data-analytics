from . import audio_uploads
from flask import Flask, send_from_directory







# Serve files from uploads directory
@audio_uploads.route('/uploads/<filename>')
def uploaded_file(filename):
    pass
    # return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

