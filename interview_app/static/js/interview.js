// interview.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const webcamElement = document.getElementById('webcam');
    const timerElement = document.getElementById('timer');
    const micToggleButton = document.getElementById('micToggle');
    const cancelButton = document.getElementById('cancelInterview');
    const notificationElement = document.getElementById('notification');

    // Initialize classes
    const timer = new InterviewTimer(timerElement);
    let recorder = null;
    let isRecording = false;
    let micMuted = true;
    let audioChunkIndex = 0;
    
    // Initialize the interview
    async function initInterview() {
        try {
            // Initialize the recorder
            recorder = new MediaRecorder();
            
            // Set up recorder callbacks
            recorder.onStart(() => {
                console.log('Recording started');
                isRecording = true;
            });
            
            recorder.onStop(async (data) => {
                console.log('Recording stopped');
                isRecording = false;
                
                // Save the final recording
                await saveRecording(data);
            });
            
            recorder.onError((error) => {
                console.error('Recording error:', error);
                showNotification('Error starting recording. Please check your camera and microphone permissions.', 'error');
            });
            
            // Set up audio chunk callback
            recorder.onAudioChunk(async (chunk) => {
                if (!micMuted) {
                    await saveAudioChunk(chunk);
                }
            });
            
            // Request permissions and start preview
            const stream = await recorder.requestPermissions();
            webcamElement.srcObject = stream;
            
            // Start recording
            recorder.startRecording();
            
            // Show notification
            showNotification('Interview started. Recording in progress...', 'success');
            
        } catch (error) {
            console.error('Error initializing interview:', error);
            showNotification('Error starting interview. Please check your camera and microphone permissions.', 'error');
        }
    }
    
    // Toggle microphone
    function toggleMicrophone() {
        if (!recorder || !recorder.stream) return;
        
        micMuted = !micMuted;
        
        // Update audio track enabled state
        recorder.stream.getAudioTracks().forEach(track => {
            track.enabled = !micMuted;
        });
        
        // Update button appearance
        micToggleButton.innerHTML = micMuted ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>Microphone Off' : 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>Microphone On';
        
        micToggleButton.className = micMuted ? 
            'flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200' : 
            'flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200';
        
        showNotification(micMuted ? 'Microphone muted' : 'Microphone enabled', micMuted ? 'bg-yellow-500' : 'bg-green-500');
    }
    
    // Save audio chunk
    async function saveAudioChunk(chunk) {
        try {
            const blob = new Blob([chunk], { type: 'audio/wav' });
            const base64 = await blobToBase64(blob);
            
            const response = await fetch('/interview/save-audio-chunk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audio: base64,
                    index: audioChunkIndex++,
                    timestamp: new Date().toISOString()
                })
            });
            
            const data = await response.json();
            if (!data.success) {
                console.error('Error saving audio chunk:', data.error);
            }
        } catch (error) {
            console.error('Error saving audio chunk:', error);
        }
    }
    
    // Save final recording
    async function saveRecording(data) {
        try {
            const videoBase64 = await recorder.getVideoAsBase64();
            const audioBase64 = await recorder.getAudioAsBase64();
            
            const response = await fetch('/interview/save-recording', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video: videoBase64,
                    audio: audioBase64,
                    isFinal: true
                })
            });
            
            const result = await response.json();
            if (result.success) {
                showNotification('Recording saved successfully', 'success');
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('Error saving recording:', error);
            showNotification('Error saving recording', 'error');
        }
    }
    
    // Convert blob to base64
    function blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        notificationElement.textContent = message;
        notificationElement.className = `mb-4 p-4 rounded-md text-white font-medium text-center ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`;
        notificationElement.classList.remove('hidden');
        
        // Hide notification after 3 seconds
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 3000);
    }
    
    // End interview
    function endInterview() {
        if (recorder && isRecording) {
            recorder.stopRecording();
        }
        
        // Disable buttons
        micToggleButton.disabled = true;
        cancelButton.disabled = true;
        
        // Show notification
        showNotification('Interview ended', 'info');
    }
    
    // Event listeners
    micToggleButton.addEventListener('click', toggleMicrophone);
    
    cancelButton.addEventListener('click', endInterview);
    
    // Start the interview
    initInterview();
});