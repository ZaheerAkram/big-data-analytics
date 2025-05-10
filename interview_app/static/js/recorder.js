class MediaRecorder {
    constructor() {
        this.stream = null;
        this.videoRecorder = null;
        this.audioRecorder = null;
        this.videoChunks = [];
        this.audioChunks = [];
        this.videoBlob = null;
        this.audioBlob = null;
        this.isRecording = false;
        this.callbacks = {
            onStart: null,
            onStop: null,
            onError: null,
            onAudioChunk: null
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

        // Reset chunks
        this.videoChunks = [];
        this.audioChunks = [];

        // Create video recorder
        this.videoRecorder = new window.MediaRecorder(
            new MediaStream(this.stream.getTracks())
        );
        
        // Create audio recorder
        this.audioRecorder = new window.MediaRecorder(
            new MediaStream(this.stream.getAudioTracks())
        );
        
        // Set up video recorder events
        this.videoRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.videoChunks.push(event.data);
            }
        };

        // Set up audio recorder events
        this.audioRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                this.audioChunks.push(event.data);
                if (typeof this.callbacks.onAudioChunk === 'function') {
                    this.callbacks.onAudioChunk(event.data);
                }
            }
        };

        // Start recording
        this.videoRecorder.start();
        this.audioRecorder.start(1000); // Save audio chunks every second
        this.isRecording = true;

        if (typeof this.callbacks.onStart === 'function') {
            this.callbacks.onStart();
        }

        return true;
    }

    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.isRecording) {
                resolve(null);
                return;
            }

            this.videoRecorder.onstop = () => {
                this.audioRecorder.stop();
            };

            this.audioRecorder.onstop = () => {
                this.isRecording = false;
                
                // Create blobs
                this.videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
                this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                
                if (typeof this.callbacks.onStop === 'function') {
                    this.callbacks.onStop({
                        video: this.videoBlob,
                        audio: this.audioBlob
                    });
                }
                
                resolve({
                    video: this.videoBlob,
                    audio: this.audioBlob
                });
            };

            // Stop recorders
            this.videoRecorder.stop();
        });
    }

    getVideoURL() {
        return this.videoBlob ? URL.createObjectURL(this.videoBlob) : null;
    }

    getAudioURL() {
        return this.audioBlob ? URL.createObjectURL(this.audioBlob) : null;
    }

    async getVideoAsBase64() {
        if (!this.videoBlob) return null;
        return await this._blobToBase64(this.videoBlob);
    }

    async getAudioAsBase64() {
        if (!this.audioBlob) return null;
        return await this._blobToBase64(this.audioBlob);
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

    onError(callback) {
        this.callbacks.onError = callback;
        return this;
    }

    onAudioChunk(callback) {
        this.callbacks.onAudioChunk = callback;
        return this;
    }
}