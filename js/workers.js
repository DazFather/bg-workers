"use strict";

// Checks if Web Worker API is supported 
if (typeof(Worker) === 'undefined') {
    throw "Web Worker are not supported on this browser"
} 

// WebWorker - basic web worker with some utilities
class WebWorker {

    // get the last value posted by the worker
    get lastValue() {
        return (typeof this._lastValue === "object")
            ? Object.assign({}, this._lastValue)
            : this._lastValue
    }

    // checks if worker is active
    get isActive() {
        return !!this._worker
    }

    _newWorker(receiver) {
        const worker = this._genWorker()
        worker.addEventListener('message', ({ data }) => {
            try {
                receiver(data)
            } catch (err) {
                this.stop(err)
            } finally {
                this._lastValue = data
            }
        })
        worker.addEventListener('error', this.stop)
        worker.addEventListener('messageerror', this.stop)
        return this._worker = worker
    }

    // creates a new WebWorker using a generator function that will return a standard Worker
    constructor(generator) {
        this._worker = null
        this._lastValue = null
        this._genWorker = generator
    }

    // start a worker passing a receive function that will be executed when the worker will reply to the sent message
    start(post, receive) {
        if (this.isActive) throw "Worker is already active"

        this._newWorker(receive).postMessage(post);
    }

    // stop the worker and optionally log in console an error
    stop(error) {
        if (!!error) console.error(error)

        if (!this.isActive) return

        this._worker.terminate()
        this._worker = null
    }
}

// BackgroundWorker creates a WebWorker by using a valid path to the worker file and name
class BackgroundWorker extends WebWorker {
    constructor(path, name) {
        super(() => new Worker(path, {type: 'module', name}))
    }
}

// InlineWorker creates a WebWorker on the fly by passing the function that will be executed on the worker
class InlineWorker extends WebWorker {
    constructor(duty) {
        super(() => new Worker( this._src ))

        this._src = URL.createObjectURL( new Blob([
            "const duty = " + duty.toString() + ";\n",
            '(', function(self){
                self.addEventListener('message', ({ data }) => {
                    try {
                        duty(data);
                    } catch (err) {
                        console.error(err)
                    }
                })
            }.toString(), ')(this)'
        ], { type: 'application/javascript' } ) );
    }
}
