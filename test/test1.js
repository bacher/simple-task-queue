const STQ = require('../lib/simple-task-queue');

const queue = new STQ(2);

for (let i = 0; i < 5; i++) {
    queue.add(() => {
        console.log(`START ${i} ${Date.now()}`);
        return new Promise(resolve => {
            setTimeout(resolve, 1000);
        });
    }).then(() => {
        console.log(`END   ${i} ${Date.now()}`);
    });
}
