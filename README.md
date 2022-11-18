# Background Workers
Taking some complexity away from web workers API while enhanced them a bit

## Features
 - creates a worke on the fly without the need of a dedicated file
 ```js
const worker = new InlineWorker(data => {
    function factorial(n) {
        if (n === 0 || n === 1)
            return 1

        const value = n * factorial(n - 1)
        return value
    }

    postMessage(factorial(data))
});

worker.start(123, result => console.log("result: " + result))

```
 ...or by giving them their file
```js
 const worker = new BackgroundWorker('./my-worker.js', 'pippo')
```
 - checks if a worker is active or not
 ```js
if (worker.isActive) {
   // Worker is running you can send and recive messages
}
 ```
 - get last value posted by the worker
 ```js
const value = worker.lastValue
 ```
 - easily extendable using `WebWorker` class
 - checks if worker are currently supported by the browser in use
 - automatically terminate worker and log error in console if something went wrong

