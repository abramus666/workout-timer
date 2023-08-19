'use strict'

let g_round_times = [];
let g_round_count = 0;

let g_started = false;
let g_start_time = null;
let g_round = 0;
let g_subround = 0;
let g_audio = {};
let g_worker = null;

function getClockText(time_ms) {
   let t = Math.abs(time_ms);
   let sign = (time_ms < 0 ? '-' : '');
   let ds = Math.floor(t / 100) % 10;
   let s = Math.floor(t / 1000) % 60;
   let m = Math.floor(t / (1000 * 60));
   let deciseconds = String(ds);
   let seconds = String(s).padStart(2, '0');
   let minutes = String(m).padStart(2, '0');
   return `${sign}${minutes}:${seconds}.${deciseconds}`;
}

function calculateRoundTime() {
   return g_round_times.reduce((a,b) => a+b, 0);
}

function calculateTotalTime() {
   return (g_round_count * calculateRoundTime());
}

function calculateFinalTimestamp() {
   return (g_start_time + calculateTotalTime());
}

function calculateNextTimestamp() {
   let t = g_start_time + (g_round * calculateRoundTime());
   for (let i = 0; i < g_subround; i++) {
      t += g_round_times[i];
   }
   return t;
}

function processRoundTimesUpdate() {
   let text = document.getElementById('RoundTimes').innerText;
   text = text.replace(/\D+/g, ',');
   g_round_times = text.split(',').map((t) => Number(t) * 1000);
   resetClock();
}

function processRoundCountUpdate() {
   let text = document.getElementById('RoundCount').innerText;
   g_round_count = Number(text);
   resetClock();
}

function updateRoundNumber() {
   document.getElementById('RoundClockLabel').innerText = `Round ${g_round+1}.${g_subround+1}`;
}

function updateRoundClock(time_ms) {
   document.getElementById('RoundClock').innerText = getClockText(time_ms);
}

function updateTotalClock(time_ms) {
   document.getElementById('TotalClock').innerText = getClockText(time_ms);
}

function updateButton(text) {
   document.getElementById('StartStop').innerText = text;
}

function startStopClock() {
   if (g_started) {
      resetClock();
   } else {
      startClock();
   }
}

function resetClock() {
   g_started = false;
   g_round = 0;
   g_subround = 0;
   updateRoundNumber();
   updateRoundClock(g_round_times[0]);
   updateTotalClock(calculateTotalTime());
   updateButton('Start');
}

function startClock() {
   g_started = true;
   g_start_time = Date.now();
   updateButton('Stop');
   playSoundAndGotoNextRound();
   g_worker.postMessage('START');
}

function playSoundAndGotoNextRound() {
   if (g_subround == 0) {
      g_audio.start1.play();
   } else {
      g_audio.start2.play();
   }
   g_subround += 1;
   if (g_subround >= g_round_times.length) {
      g_subround = 0;
      g_round += 1;
   }
}

function onTick(msg) {
   if (g_started && msg.data == 'TICK') {
      let finished = false;
      if (!(calculateNextTimestamp() > Date.now())) {
         if (g_round < g_round_count) {
            updateRoundNumber();
            playSoundAndGotoNextRound();
         } else {
            finished = true;
         }
      }
      if (!finished) {
         updateRoundClock(calculateNextTimestamp() - Date.now());
         updateTotalClock(calculateFinalTimestamp() - Date.now());
      } else {
         resetClock();
         g_audio.end.play();
         g_worker.postMessage('STOP');
      }
   }
}

window.onload = function () {
   document.getElementById('RoundTimes').innerText = '30,60,90';
   document.getElementById('RoundCount').innerText = '10';
   processRoundTimesUpdate();
   processRoundCountUpdate();
   resetClock();
   g_audio.start1 = new Audio('data/start1.wav');
   g_audio.start2 = new Audio('data/start2.wav');
   g_audio.end = new Audio('data/end.wav');
   g_worker = new Worker('worker.js');
   g_worker.onmessage = onTick;
};
