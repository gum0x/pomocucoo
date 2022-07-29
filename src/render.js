var sw = {
    // (A) PROPERTIES
    totalTime : null, // html total time display
    lblIntervalTime : null, // html time for current interval display
    cooldownMins : 5, // time interval for break in mins
    btnReset : null, // html reset button
    btnGo : null, // html start/stop button
    timer : null, // timer object
    now : 0, // current elapsed time
    pomodoroProgress : 0, // current counter for pomodoro next alarm
    pomodoroQuarterNotification : 0, // counter to notify every 15 min. 
    state : "idle", // work or cooldown
    
  // (B) INITIALIZE
  init : () => {
    // (B1) GET HTML ELEMENTS
    sw.lblTotalTime = document.getElementById("sw-totalTime");
    sw.lblIntervalTime = document.getElementById("sw-intervalTime");
    sw.statusLabel = document.getElementById("sw-status");
    sw.btnReset = document.getElementById("sw-rst");
    sw.btnGo = document.getElementById("sw-go");
    sw.pomodoroAlarm = document.getElementById("pomodoro-alarm");
    sw.pomodoroInterval = document.getElementById("pomodoro-interval");
   
    // (B2) ENABLE BUTTON CONTROLS
    sw.btnReset.onclick = sw.reset;
    sw.btnGo.onclick = sw.start;
    sw.pomodoroInterval.oninput = sw.update;
    sw.btnReset.disabled = false;
    sw.btnGo.disabled = false;

    sw.statusLabel.innerHTML = "Idle";
    sw.lblIntervalTime.className = "digital-clock idle-clock"

  },

  // (C) START!
  start : () => {
    sw.timer = setInterval(sw.tick, 1000);
    sw.btnGo.value = "Stop";
    sw.btnGo.onclick = sw.stop;
    sw.statusLabel.innerHTML = "Work";
    sw.state = "work";
    sw.lblIntervalTime.className = "digital-clock work-clock";


  },
   
  // (D) STOP
  stop : () => {
    clearInterval(sw.timer);
    sw.timer = null;
    sw.btnGo.value = "Start";
    sw.btnGo.onclick = sw.start;
    sw.statusLabel.innerHTML = "Idle";
    sw.state = "idle";
    sw.lblIntervalTime.className = "digital-clock idle-clock";

  },

  pause : () => {
    clearInterval(sw.timer);
    sw.timer = null;
    sw.btnGo.value = "Continue";
    sw.btnGo.onclick = sw.continue;
    
  },

    // (C) START!
    continue : () => {
      sw.timer = setInterval(sw.tick, 1000);
      sw.btnGo.value = "Pause";
      sw.btnGo.onclick = sw.pause;
      // sw.statusLabel.innerHTML = "Work";
      // sw.state = "work";
      // sw.lblIntervalTime.className = "digital-clock work-clock";
  
  
    },
    
    tick : () => {
        // (E1) CALCULATE HOURS, MINS, SECONDS
        sw.now++;
        sw.pomodoroProgress++;
 

        sw.lblTotalTime.innerHTML = getTime(sw.now);
        sw.lblIntervalTime.innerHTML = getTime(sw.pomodoroProgress);

        if (sw.state == "work") {
            if (sw.pomodoroProgress >= sw.pomodoroInterval.value * 60 ){
            sw.pomodoroAlarm.play();
            sw.state = "cooldown";
            sw.btnGo.value = "Pause";
            sw.btnGo.onclick = sw.pause;
            sw.pomodoroProgress = 0;
            sw.statusLabel.innerHTML = "Cool Down...";
            sw.lblIntervalTime.className = "digital-clock cooldown-clock";

            }
            
        } else if (sw.state == "cooldown"){
            if (sw.pomodoroProgress >=  sw.cooldownMins * 60) {
                sw.pomodoroAlarm.play();
                // sw.state = "work";
                // sw.statusLabel.innerHTML = "Work!"
                sw.pomodoroProgress = 0;
                sw.start();
                // sw.lblIntervalTime.className = "digital-clock work-clock"


            }
        } 

      },
    
      //resets pomodoro timming, but no the state. 
      //Use it when you missed the last interval jump
      reset : () => {
        if (sw.timer != null) { sw.stop(); }
        sw.pomodoroProgress = -1;
        sw.tick();
    
      }

};

window.addEventListener("load",sw.init);

function getTime(time) {
    let hours = 0, mins = 0, secs = 0, decis = 0;
        remain = time;
        hours = Math.floor(remain / 3600);
        remain -= hours * 3600;
        mins = Math.floor(remain / 60);
        remain -= mins * 60;
        secs = remain;
        

       
        // (E2) UPDATE THE DISPLAY TIMER
        if (hours<10) { hours = "0" + hours; }
        if (mins<10) { mins = "0" + mins; }
        if (secs<10) { secs = "0" + secs; }
        return hours + ":" + mins + ":" + secs;
}
