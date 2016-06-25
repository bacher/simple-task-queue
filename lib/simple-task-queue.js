
module.exports = class STQ {

    /**
     * @param {number} concurrencyLimit
     */
    constructor(concurrencyLimit) {
        this._maxConcurrency     = concurrencyLimit;
        this._currentConcurrency = 0;
        this._queue              = [];
    }

    /**
     * Add callback to queue.
     * @param {Function} callback
     * @param {...} args
     * @returns {Promise}
     */
    add(callback, ...args) {
        return new Promise((resolve, reject) => {
            this._queue.push({
                callback,
                args,
                resolve,
                reject
            });

            this._run();
        });
    }

    /**
     * Wrap callback for work in queue.
     * @param {Function} callback
     * @returns {Function}
     */
    wrap(callback) {
        const that = this;
        return function(...args) {
            that.add(callback, ...args);
        };
    }

    _run() {
        if (this._currentConcurrency === this._maxConcurrency) {
            return;
        }

        this._currentConcurrency++;

        const task = this._queue.shift();

        try {
            Promise.resolve(task.callback()).then(result => {
                task.resolve(result);
                this._currentConcurrency--;
                this._run();
            }, err => {
                task.reject(err);
                this._currentConcurrency--;
                this._run();
            });

        } catch(err) {
            task.reject(err);
            this._currentConcurrency--;
            this._run();
        }
    }

    getSize() {
        return this._queue.length;
    }

};
