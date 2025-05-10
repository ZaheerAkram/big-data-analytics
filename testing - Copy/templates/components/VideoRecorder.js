class VideoRecorder {
    constructor() {
        this.isRecording = false;
        this.videoRecorder = null;
        this.videoChunks = [];
        this.mediaStream = null;
    }

    async startRecording() {
        try {
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ 
                video: true,
                audio: true 
            });

            this.videoRecorder = new MediaRecorder(this.mediaStream, { 
                mimeType: 'video/webm;codecs=vp9,opus'
            });
            this.videoChunks = [];

            this.videoRecorder.ondataavailable = e => this.videoChunks.push(e.data);
            this.videoRecorder.onstop = () => this.sendVideoToServer();

            this.videoRecorder.start();
            this.isRecording = true;
            return true;
        } catch (error) {
            console.error('Error accessing media devices:', error);
            throw new Error('Error accessing camera and microphone. Please ensure you have granted the necessary permissions.');
        }
    }

    stopRecording() {
        if (this.videoRecorder && this.videoRecorder.state !== 'inactive') {
            this.videoRecorder.stop();
            this.mediaStream.getTracks().forEach(track => track.stop());
            this.isRecording = false;
        }
    }

    async sendVideoToServer() {
        const blob = new Blob(this.videoChunks, { type: 'video/webm' });
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
            
            return true;
        } catch (error) {
            console.error('Error saving video:', error);
            throw new Error('Error saving video. Please try again.');
        }
    }
}

export default VideoRecorder; 