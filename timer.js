'use strict'

let g_round_times = [];
let g_round_count = 0;
let g_total_time_ms = 0;

let g_started = false;
let g_start_time_ms = null;
let g_round = null;
let g_subround = null;

function getClockText(time_ms) {
   let ms = Math.floor(time_ms % 1000);
   let s = Math.floor(time_ms / 1000) % 60;
   let m = Math.floor(time_ms / (1000 * 60));
   let milliseconds = String(ms).padStart(3, '0');
   let seconds = String(s).padStart(2, '0');
   let minutes = String(m).padStart(2, '0');
   return `${minutes}:${seconds}:${milliseconds}`;
}

function playSound(path) {
   let audio = new Audio(path);
   audio.play();
}

function processRoundTimesUpdate() {
   let text = document.getElementById("RoundTimes").innerText;
   text = text.replace(/\D+/g, ',');
   g_round_times = text.split(',').map((t) => Number(t));
   resetClock();
}

function processRoundCountUpdate() {
   let text = document.getElementById("RoundCount").innerText;
   g_round_count = Number(text);
   resetClock();
}

function updateRoundClock(round, subround, time_s) {
   if (g_started) {
      if (g_round !== round) {
         g_round = round;
         g_subround = subround;
         playSound("data/start1.wav");
      } else if (g_subround !== subround) {
         g_subround = subround;
         playSound("data/start2.wav");
      }
   }
   document.getElementById("RoundClockLabel").innerText = `Round ${round+1}.${subround+1}`;
   document.getElementById("RoundClock").innerText = getClockText(time_s * 1000);
}

function updateTotalClock(time_ms) {
   document.getElementById("TotalClock").innerText = getClockText(time_ms);
}

function updateButton() {
   if (g_started) {
      document.getElementById("StartStop").innerText = "Stop";
   } else {
      document.getElementById("StartStop").innerText = "Start";
   }
}

function resetClock() {
   g_total_time_ms = 1000 * g_round_count * g_round_times.reduce((a,t) => a+t, 0);
   g_started = false;
   g_start_time_ms = null;
   g_round = null;
   g_subround = null;
   updateButton();
   updateRoundClock(0, 0, g_round_times[0]);
   updateTotalClock(g_total_time_ms);
}

function startStopClock() {
   if (g_started) {
      resetClock();
   } else {
      g_started = true;
      updateButton();
   }
}

function tick(timestamp_ms) {
   if (g_started) {
      if (g_start_time_ms === null) {
         g_start_time_ms = timestamp_ms;
      }
      if (timestamp_ms - g_start_time_ms > g_total_time_ms) {
         resetClock();
         playSound("data/end.wav");
      } else {
         let elapsed_time_s = (timestamp_ms - g_start_time_ms) / 1000;
         let round_time_s = g_round_times.reduce((a,t) => a+t, 0);
         let subround_time_s = elapsed_time_s % round_time_s;
         let round = Math.floor(elapsed_time_s / round_time_s);
         let subround = 0;
         for (; subround < g_round_times.length; subround++) {
            if (subround_time_s < g_round_times[subround]) {
               break;
            } else {
               subround_time_s -= g_round_times[subround];
            }
         }
         updateRoundClock(round, subround, (g_round_times[subround] - subround_time_s));
         updateTotalClock(g_total_time_ms - (timestamp_ms - g_start_time_ms));
      }
   }
   window.requestAnimationFrame(tick);
}

window.onload = function () {
   document.getElementById("RoundTimes").innerText = "30,60,90";
   document.getElementById("RoundCount").innerText = "10";
   processRoundTimesUpdate();
   processRoundCountUpdate();
   resetClock();
   window.requestAnimationFrame(tick);
};