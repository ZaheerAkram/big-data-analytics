// interview.js

document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const webcamElement = document.getElementById('webcam');
    const timerElement = document.getElementById('timer');
    const micToggleButton = document.getElementById('micToggle');
    const cancelButton = document.getElementById('cancelInterview');
    const questionElement = document.getElementById('currentQuestion');
    const nextQuestionButton = document.getElementById('nextQuestion');
    const notificationElement = document.getElementById('notification');

    // Initialize classes
    const recorder = new MediaRecorder();
    const timer = new InterviewTimer(timerElement);
    
    // Application state
    let questions = [];
    let currentQuestionIndex = 0;
    let micMuted = false;
    
    // Initialize the interview
    async function initInterview() {
        try {
            // Request permissions and initialize webcam
            const stream = await recorder.requestPermissions();
            webcamElement.srcObject = stream;
            
            // Load questions
            await loadQuestions();
            
            // Start the timer
            timer.start();
            
            // Show the first question
            if (questions.length > 0) {
                showQuestion(0);
            }
            
            // Start recording
            recorder.startRecording();
            showNotification('Recording started', 'bg-green-500');
            
            // Set up timer completion handler
            timer.onComplete(() => {
                endInterview('Time limit reached');
            });
        } catch (error) {
            console.error('Error initializing interview:', error);
            showNotification('Error: Could not access camera/microphone', 'bg-red-500');
        }
    }
    
    // Load the interview questions
    async function loadQuestions() {
        try {
            const response = await fetch('/interview/questions');
            questions = await response.json();
        } catch (error) {
            console.error('Error loading questions:', error);
            questions = [
                "Failed to load questions. Please refresh the page."
            ];
        }
    }
    
    // Display a question
    function showQuestion(index) {
        if (index >= 0 && index < questions.length) {
            questionElement.textContent = questions[index];
            currentQuestionIndex = index;
        }
    }
    
    // Toggle microphone mute status
    function toggleMicrophone() {
        if (!recorder.stream) return;
        
        const audioTracks = recorder.stream.getAudioTracks();
        micMuted = !micMuted;
        
        audioTracks.forEach(track => {
            track.enabled = !micMuted;
        });
        
        micToggleButton.innerHTML = micMuted ? 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clip-rule="evenodd" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg> Microphone Off' : 
            '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg> Microphone On';
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
    
    // Save recordings to server
    async function saveRecordings() {
        try {
            const audioBase64 = await recorder.getAudioAsBase64();
            const videoBase64 = await recorder.getVideoAsBase64();
            
            const response = await fetch('/interview/save-recording', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    audio: audioBase64,
                    video: videoBase64
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                showNotification('Interview recordings saved successfully', 'bg-green-500');
            } else {
                throw new Error(result.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving recordings:', error);
            showNotification('Error saving recordings', 'bg-red-500');
        }
    }
    
    // End the interview
    async function endInterview(reason = 'Interview ended') {
        timer.stop();
        
        // Stop recording
        await recorder.stopRecording();
        
        // Save recordings
        await saveRecordings();
        
        // Clean up resources
        recorder.cleanup();
        
        // Show completion message
        showNotification(reason, 'bg-blue-500');
        
        // Disable buttons
        micToggleButton.disabled = true;
        cancelButton.disabled = true;
        nextQuestionButton.disabled = true;
        
        // Redirect after a delay
        setTimeout(() => {
            window.location.href = '/';
        }, 5000);
    }
    
    // Event listeners
    micToggleButton.addEventListener('click', toggleMicrophone);
    
    cancelButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to end the interview?')) {
            endInterview('Interview cancelled by user');
        }
    });
    
    nextQuestionButton.addEventListener('click', () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            showQuestion(nextIndex);
        } else {
            // Loop back to the first question
            showQuestion(0);
        }
    });
    
    // Start the interview
    initInterview();
});