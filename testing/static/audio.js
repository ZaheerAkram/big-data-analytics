let isRecording = false;
let audioRecorder;
let audioChunks = [];
let stream;

const toggleBtn = document.getElementById('toggleBtn');

async function startAudioRecording() {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioRecorder = new MediaRecorder(stream);
    audioChunks = [];

    audioRecorder.ondataavailable = e => audioChunks.push(e.data);
    audioRecorder.onstop = sendAudioToServer;

    audioRecorder.start();
    toggleBtn.textContent = 'Stop Recording';
}

function stopAudioRecording() {
    audioRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    toggleBtn.textContent = 'Start Recording';
}

async function sendAudioToServer() {
    const blob = new Blob(audioChunks, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', blob, 'recorded_audio.webm');

    await fetch('/save-audio', {
        method: 'POST',
        body: formData
    });
}

toggleBtn.onclick = async () => {
    if (!isRecording) {
        await startAudioRecording();
    } else {
        stopAudioRecording();
    }
    isRecording = !isRecording;
}; 