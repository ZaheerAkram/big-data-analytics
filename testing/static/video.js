let isRecording = false;
let videoRecorder;
let videoChunks = [];
let mediaStream;

const toggleBtn = document.getElementById('toggleBtn');
const preview = document.getElementById('preview');

async function startVideoRecording() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: true 
        });
        preview.srcObject = mediaStream;

        videoRecorder = new MediaRecorder(mediaStream, { 
            mimeType: 'video/webm;codecs=vp9,opus'
        });
        videoChunks = [];

        videoRecorder.ondataavailable = e => videoChunks.push(e.data);
        videoRecorder.onstop = sendVideoToServer;

        videoRecorder.start();
        toggleBtn.textContent = 'Stop Recording';
    } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Error accessing camera and microphone. Please ensure you have granted the necessary permissions.');
    }
}

function stopVideoRecording() {
    if (videoRecorder && videoRecorder.state !== 'inactive') {
        videoRecorder.stop();
        mediaStream.getTracks().forEach(track => track.stop());
        toggleBtn.textContent = 'Start Recording';
    }
}

async function sendVideoToServer() {
    const blob = new Blob(videoChunks, { type: 'video/webm' });
    const formData = new FormData();
    formData.append('video', blob, 'recorded_video.webm');

    try {
        const response = await fetch('/save-video', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) {
            throw new Error('Failed to save video');
        }
        
        alert('Video saved successfully!');
    } catch (error) {
        console.error('Error saving video:', error);
        alert('Error saving video. Please try again.');
    }
}

toggleBtn.onclick = async () => {
    if (!isRecording) {
        await startVideoRecording();
    } else {
        stopVideoRecording();
    }
    isRecording = !isRecording;
}; 