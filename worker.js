'use strict'

let g_timer = null;

function onInterval() {
   postMessage('TICK');
}

self.onmessage = function (msg) {
   if (msg.data == 'START') {
      g_timer = setInterval(onInterval, 100);
   } else if (msg.data == 'STOP') {
      clearInterval(g_timer);
   }
}
