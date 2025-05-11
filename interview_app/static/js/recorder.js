class MediaRecorder {
    constructor() {
        this.stream = null;
        this.videoRecorder = null;
        this.videoChunks = [];
        this.videoBlob = null;
        this.isRecording = false;
        this.callbacks = {
            onStart: null,
            onStop: null,
            onError: null
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

        // Reset chunks for video
        this.videoChunks = [];

        // Create video recorder
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

    stopRecording() {
        return new Promise((resolve, reject) => {
            if (!this.isRecording) {
                resolve(null);
                return;
            }

            this.videoRecorder.onstop = () => {
                this.isRecording = false;
                
                // Create video blob
                this.videoBlob = new Blob(this.videoChunks, { type: 'video/webm' });
                
                if (typeof this.callbacks.onStop === 'function') {
                    this.callbacks.onStop({
                        video: this.videoBlob
                    });
                }
                
                resolve({
                    video: this.videoBlob
                });
            };

            // Stop video recorder
            this.videoRecorder.stop();
        });
    }

    getVideoURL() {
        return this.videoBlob ? URL.createObjectURL(this.videoBlob) : null;
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

    onError(callback) {
        this.callbacks.onError = callback;
        return this;
    }
}