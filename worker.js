'use strict'

let count = 0;

function timedCount() {
   count += 1;
   postMessage(count);
   setTimeout(timedCount, 1000);
}

timedCount();
