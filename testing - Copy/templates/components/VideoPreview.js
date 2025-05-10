class VideoPreview {
    constructor(videoElement) {
        this.videoElement = videoElement;
    }

    setStream(stream) {
        this.videoElement.srcObject = stream;
    }

    clearStream() {
        this.videoElement.srcObject = null;
    }
}

export default VideoPreview; 