// interview.js

document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const webcamElement = document.getElementById("webcam");
  const timerElement = document.getElementById("timer");
  const micToggleButton = document.getElementById("micToggle");
  const cancelButton = document.getElementById("cancelInterview");
  const notificationElement = document.getElementById("notification");
  const micToggle2 = document.getElementById("micLabel2");
  const startOverlay = document.getElementById("startOverlay");
  const startInterviewBtn = document.getElementById("startInterviewBtn");

  // Initialize classes
  const timer = new InterviewTimer(timerElement);
  const videoRecorder = new MediaRecorder(); // Initialize the video recorder

  // Application state
  let micMuted = true; // Start with microphone muted
  let mediaStream = null; // Single mediaStream for both video and audio
  let audioRecorder = null; // Audio recorder instance
  let audioChunks = []; // Array to store audio chunks
  let isAudioRecording = false; // Track audio recording state

  // System audio
  const systemAudio = new Audio('/uploads/system.mp3');

  // Start interview button click handler
  startInterviewBtn.addEventListener('click', async () => {
    try {
      // Play system audio
      await systemAudio.play();
      
      // Hide the start overlay
      startOverlay.style.display = 'none';
      
      // Initialize the interview
      await initInterview();
    } catch (error) {
      console.error("Error starting interview:", error);
      showNotification("Error starting interview", "bg-red-500");
    }
  });

  // Initialize the interview
  async function initInterview() {
    try {
      // Request permissions and initialize webcam
      mediaStream = await videoRecorder.requestPermissions();
      webcamElement.srcObject = mediaStream;

      // Start recording
      videoRecorder.startRecording();

      // Start the timer
      timer.start();

      showNotification("Recording started", "bg-green-500");

      // Set up timer completion handler
      timer.onComplete(() => {
        endInterview("Time limit reached");
      });

      // Initialize microphone state
      const audioTracks = mediaStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = false; // Start with audio disabled
      });
    } catch (error) {
      console.error("Error initializing interview:", error);
      showNotification(
        "Error: Could not access camera/microphone",
        "bg-red-500"
      );
    }
  }

  async function startAudioRecording() {
    console.log("Starting audio recording");
    try {
      // Check if MediaRecorder is supported
      if (!window.MediaRecorder) {
        throw new Error("MediaRecorder is not supported in this browser");
      }

      // Get the audio stream
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Got media stream:", stream);

      // Explicitly use window.MediaRecorder to ensure we're using the browser's built-in MediaRecorder
      audioRecorder = new window.MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      console.log("Created MediaRecorder:", audioRecorder);

      audioChunks = [];
      audioRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      audioRecorder.onstop = sendAudioToServer;

      audioRecorder.start(1000);
      console.log("Started recording");
    } catch (error) {
      console.error("Error in startAudioRecording:", error);
      showNotification("Error starting audio recording: " + error.message, "bg-red-500");
    }
  }

  function stopAudioRecording() {
    console.log("Stopping audio recording");
    try {
      if (audioRecorder && audioRecorder.state !== 'inactive') {
        audioRecorder.stop();
      }
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  }

  async function sendAudioToServer() {
    const blob = new Blob(audioChunks, { type: "audio/wav" });
    const formData = new FormData();
    formData.append("audio", blob, "recorded_audio.wav");
    console.log("Sending audio to server");
    try {
      const response = await fetch("/interview/save-audio", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.success && data.text) {
        document.getElementById('humanText').textContent = data.text;
        
        // Send the transcribed text to generate-question route
        const questionResponse = await fetch("/interview/generate-question", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: data.text })
        });
        const questionData = await questionResponse.json();
        console.log("Generated question response:", questionData);
        console.log("Generated question:", questionData.text);
        
        // Update the question text
        document.getElementById('generatedQuestion').textContent = questionData.text;
        
        // Play the audio if audio path is provided
        if (questionData.audio_path) {
          const audio = new Audio(`/uploads/questions/${questionData.audio_path}`);
          audio.play().catch(error => {
            console.error("Error playing audio:", error);
            showNotification("Error playing audio", "bg-red-500");
          });
        }
      }
    } catch (error) {
      console.error("Error sending audio:", error);
      showNotification("Error processing audio", "bg-red-500");
    }
  }

  // Toggle microphone mute status
  async function toggleMicrophone() {
    if (!mediaStream) return;

    const audioTracks = mediaStream.getAudioTracks();
    micMuted = !micMuted;

    try {
      // Update track enabled state
      audioTracks.forEach((track) => {
        track.enabled = !micMuted;
      });

      if (!micMuted) {
        // Start new audio recording
        await startAudioRecording();
      } else {
        // Stop current audio recording
        stopAudioRecording();
      }

      // Update button appearance
      micToggleButton.innerHTML = micMuted
        ? '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>Microphone Off'
        : '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>Microphone On';

      // Update button color
      micToggleButton.className = micMuted
        ? "flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
        : "flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors duration-200";

      showNotification(
        micMuted ? "Microphone disabled" : "Microphone enabled",
        micMuted ? "bg-yellow-500" : "bg-green-500"
      );
    } catch (error) {
      console.error("Error toggling microphone:", error);
      showNotification("Error toggling microphone", "bg-red-500");
    }
  }

  // Show notification
  function showNotification(message, bgColorClass) {
    notificationElement.textContent = message;
    notificationElement.className = ` absolute mt-16 w-full opacity-90 p-4 rounded-md text-white font-medium text-center ${bgColorClass}`;
    notificationElement.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      notificationElement.classList.add("hidden");
    }, 5000);
  }

  // Save video recording to server
  async function saveVideoRecording() {
    try {
      const videoBase64 = await videoRecorder.getVideoAsBase64();

      const response = await fetch("/interview/save-video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video: videoBase64,
        }),
      });

      const result = await response.json();

      if (result.success) {
        showNotification("Video saved successfully", "bg-green-500");
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error saving video:", error);
      showNotification("Error saving video", "bg-red-500");
    }
  }

  // End the interview
  async function endInterview(reason = "Interview ended") {
    timer.stop();

    // Stop recording and save video
    await videoRecorder.stopRecording();
    await saveVideoRecording();

    // Stop audio recording if active
    if (isAudioRecording) {
      stopAudioRecording();
    }

    // Cleanup
    videoRecorder.cleanup();
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }

    showNotification(reason, "bg-blue-500");
    micToggleButton.disabled = true;
    cancelButton.disabled = true;

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 2000);
  }

  // Event listeners
  micToggleButton.addEventListener("click", toggleMicrophone);

  cancelButton.addEventListener("click", () => {
    if (confirm("Are you sure you want to end the recording?")) {
      endInterview("Recording cancelled by user");
    }
  });
});
