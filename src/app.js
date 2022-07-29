var app = {
    elem : {
        lblTotalTime : null, // html total time display
        lblIntervalTime : null, // html time for current interval display
        lblStatus : null, // html status label
        btnWork : null, // html reset button
        btnIdle : null, // html button for idle state. Like launch or even closing. 
        btnCooldown : null, // html button for the pomodoro state
        btnInterruption : null, // button to mark how much time I've been in an interrupted task
        btnEmergency : null, // button to set up emergency state, wehere no pomodoro state is reached. 
        btnStop : null, // btn for Stop working and set up 
        inputPomodoroInterval : null, 
        inputCooldownInterval : null, 
        audioPomodoro : null, //html pomodoro break audio.
        audioQuarter : null, //html quarter sweet notification. 
        audioPomodoroEnding : null, // html pomodoro's ends notification
    },
    opt : {
        cooldownMins : 5, // time interval for break in mins
        pomodoroQuarterNotification : 15, // counter to notify every 15 min. 
    
    },
    stats : {
        watever: ""
    },

    timer : null, // timer object
    totalCntr : 0, // current elapsed time
    pomodoroCntr : 0, // current counter for pomodoro next alarm
    interruptionCntr : 0, // time in secconds that are being interrupted. 
    state : "stop",
    stateHistory : [],
};

// status init
// where application starts
async function init() {
    e = app.elem;
    e.lblTotalTime = document.getElementById("lblTotalTime");
    e.lblIntervalTime = document.getElementById("lblIntervalTime");
    e.lblStatus = document.getElementById("lblStatus");
    e.btnWork = document.getElementById("btnWork");
    e.btnIdle = document.getElementById("btnIdle");
    e.btnCooldown = document.getElementById("btnCooldown");
    e.btnInterruption = document.getElementById("btnInterruption");
    e.btnEmergency = document.getElementById("btnEmergency");
    e.btnStop = document.getElementById("btnStop");
    e.inputPomodoroInterval = document.getElementById("inputPomodoroInterval");
    e.inputCooldownInterval = document.getElementById("inputCooldownInterval");
    e.audioPomodoroStart = document.getElementById("audioPomodoroStart");
    e.audioQuarter = document.getElementById("audioQuarter");
    e.audioPomodoroEnding = document.getElementById("audioPomodoroEnding");
    

    e.btnWork.disabled = false;
    e.btnIdle.disabled = false;
    e.btnCooldown.disabled = false;
    e.btnInterruption.disabled = false; 
    e.btnEmergency.disabled = false;
    e.btnStop.disabled = false;

    e.btnInterruption.style.visibility = "hidden";
    e.btnEmergency.style.visibility = "hidden";
    e.btnStop.style.visibility = "hidden";

    e.btnWork.onclick = workState;
    e.btnIdle.onclick = idleState;
    e.btnCooldown.onclick = cooldownState;
    e.btnInterruption.onclick = interruptionState;
    e.btnEmergency.onclick = emergencyState;
    

    app.state = await stop();

    console.log("Watch initiated");
};
async function updateWatch() {

    e.lblTotalTime.innerHTML = getTime(app.totalCntr);
    e.lblIntervalTime.innerHTML = getTime(app.pomodoroCntr);

}

// heartbeat
async function tick() {
    app.totalCntr++;
    app.pomodoroCntr++;

    await updateWatch();
    await checkState();
};

async function checkState() {
    // On work state, play quarter music. 
    if (app.pomodoroCntr % (app.opt.pomodoroQuarterNotification * 60) == 0) {
        await playQuarter();
    }

    if (app.state == "work") {
        if (app.pomodoroCntr >= e.inputPomodoroInterval.value * 60 ){
            await playPomodoroStart();
            await cooldownState();

        }
        return 
        
    }  
    
    if (app.state == "cooldown"){
        if (app.pomodoroCntr >=  ( (app.opt.cooldownMins * 60) - 20) ) {
            await playPomodoroEnding();
        }

        if (app.pomodoroCntr >=  app.opt.cooldownMins * 60) {
            await playQuarter()
            await workState();
        }
        return 
    } 
}

// start PomodorCtr
async function startPomodoro() {
    app.pomodoroCntr = 0;
    
    if (!app.timer) {
        app.timer = setInterval(tick, 1000);
    }
}


// Status work_on
async function workState(reset=true) {
    if(reset) {
        app.pomodoroCntr = 0;
        await updateWatch();
    }
    app.state = "work";
    e.lblStatus.innerHTML = "Work!";
    e.lblIntervalTime.className = "digital-clock work-clock";
    await startPomodoro();
    switchBtn(e.btnWork);
}
// status idle brake
async function idleState(reset=true) {
    if(reset) {
        app.pomodoroCntr = 0;
        await updateWatch();
    }
    app.state = "idle";
    e.lblStatus.innerHTML = "Idle...";
    e.lblIntervalTime.className = "digital-clock idle-clock";
    await startPomodoro();
    switchBtn(e.btnIdle);
}

// status autoPomodorBreak
async function playPomodoroStart() {
    e.audioPomodoroStart.play();
}

async function playQuarter() {
    e.audioQuarter.play();
}

async function playPomodoroEnding() {
    e.audioPomodoroEnding.play();
}

// status pomodoro break
async function cooldownState(reset=true) {
    if(reset) {
        app.pomodoroCntr = 0;
        await updateWatch();
    }
    app.state = "cooldown";
    e.lblStatus.innerHTML = "Cool Down...";
    e.lblIntervalTime.className = "digital-clock cooldown-clock";
    await startPomodoro();
    switchBtn(e.btnCooldown);

}
// status interruption
// this is a paralel state that counts number of interruption
// and time spend on them. 
async function interruptionState() {

}
// status emergency
async function emergencyState() {

}

// status stop 
async function stop() {
    e.lblStatus.innerHTML = "Idle";
    e.lblIntervalTime.className = "digital-clock idle-clock"

}


// getTime convert seconds to hours:mins:sec
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

// 
function switchBtn(btn) {
    (e.btnWork === btn) ? e.btnWork.disabled = true : e.btnWork.disabled = false; 
    (e.btnIdle === btn) ? e.btnIdle.disabled = true : e.btnIdle.disabled = false; 
    (e.btnCooldown === btn) ? e.btnCooldown.disabled = true : e.btnCooldown.disabled = false; 
    (e.btnInterruption === btn) ? e.btnInterruption.disabled = true : e.btnInterruption.disabled = false; 
    (e.btnEmergency === btn) ? e.btnEmergency.disabled = true : e.btnEmergency.disabled = false;     
    
}


// start
init();
