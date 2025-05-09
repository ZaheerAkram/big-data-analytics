class InterviewTimer {
    constructor(displayElement, totalSeconds = 600) {
        this.displayElement = displayElement;
        this.totalSeconds = totalSeconds;
        this.remainingSeconds = totalSeconds;
        this.interval = null;
        this.callbacks = {
            onTick: null,
            onComplete: null
        };
    }

    start() {
        if (this.interval) {
            return; // Timer already running
        }

        this.interval = setInterval(() => {
            this.remainingSeconds--;
            this.updateDisplay();

            if (typeof this.callbacks.onTick === 'function') {
                this.callbacks.onTick(this.remainingSeconds);
            }

            if (this.remainingSeconds <= 0) {
                this.stop();
                if (typeof this.callbacks.onComplete === 'function') {
                    this.callbacks.onComplete();
                }
            }
        }, 1000);

        this.updateDisplay();
        return this;
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        return this;
    }

    reset() {
        this.stop();
        this.remainingSeconds = this.totalSeconds;
        this.updateDisplay();
        return this;
    }

    updateDisplay() {
        const minutes = Math.floor(this.remainingSeconds / 60);
        const seconds = this.remainingSeconds % 60;
        this.displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Add visual indicator when time is running low
        if (this.remainingSeconds <= 60) {
            this.displayElement.classList.add('text-red-500');
        } else {
            this.displayElement.classList.remove('text-red-500');
        }
    }

    onTick(callback) {
        this.callbacks.onTick = callback;
        return this;
    }

    onComplete(callback) {
        this.callbacks.onComplete = callback;
        return this;
    }
}