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
    const recorder = new MediaRecorder(); // Initialize the recorder
    
    // Application state
    let micMuted = true; // Start with microphone muted
    let mediaStream = null;
    let isRecording = false; // Track if we're currently recording audio
    
    // Initialize the interview
    async function initInterview() {
        try {
            // Request permissions and initialize webcam
            mediaStream = await recorder.requestPermissions();
            webcamElement.srcObject = mediaStream;
            
            // Start recording
            recorder.startRecording();
            
            // Set up audio chunk handler
            recorder.onAudioChunk(async (chunk) => {
                await saveAudioChunk(chunk);
            });
            
            // Start the timer
            timer.start();
            
            showNotification('Recording started', 'bg-green-500');
            
            // Set up timer completion handler
            timer.onComplete(() => {
                endInterview('Time limit reached');
            });

            // Initialize microphone state
            const audioTracks = mediaStream.getAudioTracks();
            audioTracks.forEach(track => {
                track.enabled = false; // Start with audio disabled
            });
        } catch (error) {
            console.error('Error initializing interview:', error);
            showNotification('Error: Could not access camera/microphone', 'bg-red-500');
        }
    }
    
    // Toggle microphone mute status
    async function toggleMicrophone() {
        if (!mediaStream) return;
        
        const audioTracks = mediaStream.getAudioTracks();
        micMuted = !micMuted;
        
        audioTracks.forEach(track => {
            track.enabled = !micMuted;
        });
        
        // Start/stop audio recording based on mute status
        if (!micMuted && !isRecording) {
            // Start recording when unmuted
            recorder.startAudioRecording();
            isRecording = true;
        } else if (micMuted && isRecording) {
            // Stop recording when muted
            await recorder.stopAudioRecording();
            isRecording = false;
        }
        
        // Update button appearance
        micToggleButton.innerHTML = micMuted ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>Microphone Off' : 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>Microphone On';
        
        // Update button color
        micToggleButton.className = micMuted ? 
            'flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200' : 
            'flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200';
    }
    
    // Show notification
    function showNotification(message, bgColorClass) {
        notificationElement.textContent = message;
        notificationElement.className = `mb-4 p-4 rounded-md text-white font-medium text-center ${bgColorClass}`;
        notificationElement.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            notificationElement.classList.add('hidden');
        }, 5000);
    }
    
    // Save video recording to server
    async function saveVideoRecording() {
        try {
            const videoBase64 = await recorder.getVideoAsBase64();
            
            const response = await fetch('/interview/save-video', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    video: videoBase64
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Video saved successfully', 'bg-green-500');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving video:', error);
            showNotification('Error saving video', 'bg-red-500');
        }
    }

    // Save an audio chunk to the server
    async function saveAudioChunk(chunk) {
        try {
            const response = await fetch('/interview/save-audio-chunk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audio: chunk.audio,
                    index: chunk.index,
                    timestamp: chunk.timestamp
                })
            });
            
            const result = await response.json();
            
            if (!result.success) {
                console.error('Error saving audio chunk:', result.error);
            }
        } catch (error) {
            console.error('Error saving audio chunk:', error);
        }
    }

    // Save all audio recordings
    async function saveAllAudioRecordings() {
        try {
            const allAudioBase64 = await recorder.getAllAudioRecordingsAsBase64();
            
            const response = await fetch('/interview/save-recording', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    allAudio: allAudioBase64
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('All audio recordings saved successfully', 'bg-green-500');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving audio recordings:', error);
            showNotification('Error saving audio recordings', 'bg-red-500');
        }
    }
    
    // End the interview
    async function endInterview(reason = 'Interview ended') {
        timer.stop();
        
        // Stop recording and save all recordings
        await recorder.stopRecording();
        await saveVideoRecording();
        await saveAllAudioRecordings();
        
        // Cleanup
        recorder.cleanup();
        
        showNotification(reason, 'bg-blue-500');
        micToggleButton.disabled = true;
        cancelButton.disabled = true;
        
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 2000);
    }
    
    // Event listeners
    micToggleButton.addEventListener('click', toggleMicrophone);
    
    cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to end the recording?')) {
            endInterview('Recording cancelled by user');
        }
    });
    
    // Start the interview
    initInterview();
});