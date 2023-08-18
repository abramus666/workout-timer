'use strict'

function onTimeout() {
   postMessage(1);
}

self.onmessage = function (msg) {
   let delay_ms = msg.data - Date.now();
   if (!(delay_ms > 100)) {
      delay_ms = 100;
   }
   setTimeout(onTimeout, delay_ms);
}
