class MediaRecorder {
    constructor() {
        this.stream = null;
        this.audioRecorder = null;
        this.videoRecorder = null;
        this.audioChunks = [];
        this.videoChunks = [];
        this.audioBlob = null;
        this.videoBlob = null;
        this.isRecording = false;
        this.isAudioRecording = false;
        this.audioRecordings = []; // Array to store multiple audio recordings
        this.currentAudioIndex = 0;
        this.callbacks = {
            onStart: null,
            onStop: null,
            onError: null,
            onAudioStart: null,
            onAudioStop: null
        };
    }

    async requestPermissions() {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: true
            });
            return this.stream;
        } catch (err) {
            console.error('Error accessing media devices:', err);
            if (typeof this.callbacks.onError === 'function') {
                this.callbacks.onError(err);
            }
            throw err;
        }
    }

    startRecording() {
        if (!this.stream || this.isRecording) {
            return false;
        }

        // Reset chunks for video only
        this.videoChunks = [];

        // Create video recorder only
        this.videoRecorder = new window.MediaRecorder(
            new MediaStream(this.stream.getTracks())
        );
        
        // Set up video recorder events
        this.videoRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.videoChunks.push(event.data);
            }
        };

        // Start video recording
        this.videoRecorder.start();
        this.isRecording = true;

        if (typeof this.callbacks.onStart === 'function') {
            this.callbacks.onStart();
        }

        return true;
    }

    // Start audio recording separately
    startAudioRecording() {
        if (!this.stream || this.isAudioRecording) {
            return false;
        }

        // Reset audio chunks
        this.audioChunks = [];

        // Create audio recorder
        this.audioRecorder = new window.MediaRecorder(
            new MediaStream(this.stream.getAudioTracks())
        );
        
        // Set up audio recorder events
        this.audioRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
            }
        };

        // Start recording
        this.audioRecorder.start();
        this.isAudioRecording = true;
        this.currentAudioIndex++;

        if (typeof this.callbacks.onAudioStart === 'function') {
            this.callbacks.onAudioStart(this.currentAudioIndex);
        }

        return true;
    }

    // Stop audio recording separately
    stopAudioRecording() {
        return new Promise((resolve, reject) => {
            if (!this.isAudioRecording) {
                resolve(null);
                return;
            }

            this.audioRecorder.onstop = () => {
                this.isAudioRecording = false;
                
                // Create blob
                const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
                
                // Store this recording
                this.audioRecordings.push({
                    index: this.currentAudioIndex,
                    blob: audioBlob
                });
                
                if (typeof this.callbacks.onAudioStop === 'function') {
                    this.callbacks.onAudioStop({
                        index: this.currentAudioIndex,
                        audio: audioBlob
                    });
                }
                
                resolve({
                    index: this.currentAudioIndex,
                    audio: audioBlob
                });
            };

            // Stop audio recorder
            this.audioRecorder.stop();
        });
    }

    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.isRecording) {
                resolve(null);
                return;
            }

            // If audio is still recording, stop it first
            if (this.isAudioRecording) {
                this.stopAudioRecording();
            }

            this.videoRecorder.onstop = () => {
                this.isRecording = false;
                
                // Create video blob
                this.videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
                
                if (typeof this.callbacks.onStop === 'function') {
                    this.callbacks.onStop({
                        video: this.videoBlob,
                        audioRecordings: this.audioRecordings
                    });
                }
                
                resolve({
                    video: this.videoBlob,
                    audioRecordings: this.audioRecordings
                });
            };

            // Stop video recorder
            this.videoRecorder.stop();
        });
    }

    getAudioURL(index) {
        if (index !== undefined) {
            const recording = this.audioRecordings.find(r => r.index === index);
            return recording ? URL.createObjectURL(recording.blob) : null;
        }
        return null;
    }

    getVideoURL() {
        return this.videoBlob ? URL.createObjectURL(this.videoBlob) : null;
    }

    async getAudioAsBase64(index) {
        if (index !== undefined) {
            const recording = this.audioRecordings.find(r => r.index === index);
            return recording ? await this._blobToBase64(recording.blob) : null;
        }
        return null;
    }

    async getAllAudioRecordingsAsBase64() {
        const result = {};
        for (const rec of this.audioRecordings) {
            result[rec.index] = await this._blobToBase64(rec.blob);
        }
        return result;
    }

    async getVideoAsBase64() {
        if (!this.videoBlob) return null;
        return await this._blobToBase64(this.videoBlob);
    }

    _blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    cleanup() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    onStart(callback) {
        this.callbacks.onStart = callback;
        return this;
    }

    onStop(callback) {
        this.callbacks.onStop = callback;
        return this;
    }

    onAudioStart(callback) {
        this.callbacks.onAudioStart = callback;
        return this;
    }

    onAudioStop(callback) {
        this.callbacks.onAudioStop = callback;
        return this;
    }

    onError(callback) {
        this.callbacks.onError = callback;
        return this;
    }
}