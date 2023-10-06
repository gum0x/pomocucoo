//Core
var persistence = window.localStorage;

var app = {
    elem : {
        lblTotalTime : null, // html total time display
        lblIntervalTime : null, // html time for current interval display
        // lblStatus : null, // html status label
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
    // totalCntr : 0, // current elapsed time
    // pomodoroCntr : 0, // current counter for pomodoro next alarm
    interruptionCntr : 0, // time in secconds that are being interrupted. 
    state : "stop",
    stateHistory : [],
    continue: false,
    currentTaskObj: null,
    taskNameUpdated: true

};

//TODO: split store and store controller. 
var store = {
    // currentTaskId: () => {
    //     if (persistence.length > 0) {
    //         const sorted = Object.keys(persistence).sort(function (a, b) {if (a<b){return -1}else if(a>b){return 1}})
    //         return sorted[sorted.length - 1]['ts'];
    //     } else {
    //         return null;
    //     }
    // },
    currentTaskId: () => {
        return persistence.getItem("currentTaskId") ? persistence.getItem("currentTaskId") : null;
    },
    setCurrentTaskId: (taskId) => {
        persistence.setItem("currentTaskId", taskId);
    },
    saveCurrentTask: () => {
        persistence.setItem("currentTaskObj", JSON.stringify(app.currentTaskObj));
    },
    restoreCurrentTask: () =>  {
        app.currentTaskObj = JSON.parse(persistence.getItem("currentTaskObj"));
    },
    status: () => {
        let task = store.getCurrentTask();
        if(task) {
            return task["status"];
        }
        return null;
    },
    addTask: (task, status) => {
        // const array = new Uint32Array(10);    
        // store.currentTaskId = Math.random().toString(36).substring(2,16);
        store.setCurrentTaskId(new Date());
        historyObj = persistence.getItem("history")
        var taskList = historyObj ? JSON.parse(historyObj) : {};
        app.currentTaskObj = {
            ts: store.currentTaskId(),
	        ts_end: null,
            name: task,
            status: status
        };
        taskList[app.currentTaskObj["ts"]] = app.currentTaskObj;
        persistence.setItem("history",JSON.stringify(taskList));
        persistence.setItem("status", status);
        store.saveCurrentTask();
        watch.saveWatchState();
    },
    updateCurrentTask: (taskName) => {
        var taskList = JSON.parse(persistence.getItem("history"));
        app.currentTaskObj["name"] = taskName;
        taskList[store.currentTaskId()] = app.currentTaskObj;
        persistence.setItem("history",JSON.stringify(taskList));
        store.saveCurrentTask();
        watch.saveWatchState();
    },
    endCurrentTask: () => {
        if (store.currentTaskId()) {
            var taskList = JSON.parse(persistence.getItem("history"));
            app.currentTaskObj['ts_end'] = new Date();
            taskList[app.currentTaskObj["ts"]]  = app.currentTaskObj;
            persistence.setItem("history",JSON.stringify(taskList));
            store.saveCurrentTask();
            watch.saveWatchState();
        };
    },
    getCurrentTask: () => {
        let taskList = JSON.parse(persistence.getItem("history"));
        return taskList ? taskList[store.currentTaskId()] : null;        
    },
    getHistory: () => {
        taskList = JSON.parse(persistence.getItem("history"));
        return taskList ? taskList : null;
    },
    reset: ()  => {
        persistence.clear();
        app.currentTaskObj = null;
	    //store.currentTaskId = null;
    }

}

// status init
// where application starts
async function init() {
    e = app.elem;
    e.lblTotalTime = document.getElementById("lblTotalTime");
    e.lblIntervalTime = document.getElementById("lblIntervalTime");
    // e.lblStatus = document.getElementById("lblStatus");
    e.btnWork = document.getElementById("btnWork");
    e.btnIdle = document.getElementById("btnIdle");
    e.btnCooldown = document.getElementById("btnCooldown");
    e.btnInterruption = document.getElementById("btnInterruption");
    e.btnEmergency = document.getElementById("btnEmergency");
    e.btnStop = document.getElementById("btnStop");
    e.inputPomodoroInterval = document.getElementById("inputPomodoroInterval");
    e.inputCooldownInterval = document.getElementById("inputCooldownInterval");
    e.audioPlayer = document.getElementById("audioPlayer");
    e.inputTask = document.getElementById("inputTask");
    e.btnUpdateState = document.getElementById("btnUpdateState");
    e.tbHistory = document.getElementById("tbHistory");
    // e.audioPomodoroStart = document.getElementById("audioPomodoroStart");
    // e.audioQuarter = document.getElementById("audioQuarter");
    // e.audioPomodoroEnding = document.getElementById("audioPomodoroEnding");
    // e.btnUpdateState.onclick = () => {store.updateTask(e.inputTask.value)};
    e.inputTask.addEventListener('change', () => {
        store.updateCurrentTask(e.inputTask.value);
        e.inputTask.className = "taskUpdated";
        renderHistory();
        renderCurrentTask();
    });

    e.inputTask.addEventListener('input', () => {
        e.inputTask.className = "taskNonUpdated";
        renderHistory();
    });

    e.muteIcon = document.getElementById("muteIcon");
    app.player = e.audioPlayer;
    e.muteIcon.onclick = function() {unMute()};

    e.btnWork.disabled = false;
    e.btnIdle.disabled = false;
    e.btnCooldown.disabled = false;
    e.btnInterruption.disabled = false; 
    e.btnEmergency.disabled = false;
    e.btnStop.disabled = false;

    e.btnInterruption.style.visibility = "hidden";
    e.btnEmergency.style.visibility = "hidden";
    // s.btnStop.style.visibility = "hidden";

    e.btnWork.onclick = workState;
    e.btnIdle.onclick = idleState;
    e.btnCooldown.onclick = cooldownState;
    e.btnInterruption.onclick = interruptionState;
    e.btnEmergency.onclick = emergencyState;
    e.btnStop.onclick = stop;

    app.currentTaskObj = store.getCurrentTask()
    
    //store.recoverState();
    //TODO: rebuild the tick() function to run allways and 
    // set up the state as defined on store.status
    if(app.currentTaskObj){
        watch.restoreWatchTime();
        app.state = app.currentTaskObj["status"];
        app.timer = setInterval(tick, 100);
    } else {
        watch.saveWatchState();
    }

    renderHistory();
    renderCurrentTask();
   
    console.log("Watch initiated");
};

function cents2sec(millis){
    secs = millis / 1000
    return Math.trunc(secs)
};

let watch = {
    _ts_init:null,
    _ts_main_task:null,
    _ts_secondary_task:null,
    _ts_idle:null,
    _ts_cool_down:null,
    _pomodoroCntrCache: null,
    _pomodoroTotalCntrCache: null,
    _ts_now:()=>new Date(),
    totalPomodoro: (watch) => { return watch._ts_init ? cents2sec(watch._ts_now() - watch._ts_init) : 0 },
    mainTaskPomodoro: (watch) => { return watch._ts_main_task ? cents2sec(watch._ts_now() - watch._ts_main_task) : 0 },
    secondTaskPomodoro: (watch) => { return watch._ts_secondary_task ? cents2sec(watch._ts_now() - watch._secondary_task) : 0 },
    idleTimePomodoro: (watch) => { return watch._ts_idle ? cents2sec(watch._ts_now()- watch._ts_idle) : 0 },
    coolDownPomodoro: (watch) => { return watch._ts_cool_down ? cents2sec(watch._ts_now() - watch._ts_idle ) : 0 },
    timeDiff: (ts_start, ts_end) => { return cents2sec(new Date(ts_end) - new Date(ts_start)) },
    reset: () => {
        _ts_init = null;
        _ts_main_task = null;
    },
    restoreWatchTime: () => {
        watch._ts_init = new Date(persistence.getItem("initTime"));
        watch._ts_main_task = new Date(persistence.getItem("mainTaskTime"));
    },
    saveWatchState: () => {
        persistence.setItem("initTime", watch._ts_init);
        persistence.setItem("mainTaskTime", watch._ts_main_task)
    },
};

//TODO: should this be the core function? 
// how this deals with the fact that sometimes we want the clock being stopped?
async function tick() {
    watch._pomodoroCntrCache=watch.mainTaskPomodoro(watch);
    
    if(!watch._ts_init){ watch._ts_init = new Date()}
    watch._pomodoroTotalCntrCache=watch.totalPomodoro(watch);

    await checkState();
    // No need to render everything
    await renderClock();

};

//TODO: rethink this as mix core with UI
async function checkState() {
    // On work state, play quarter music. 
    if (watch._pomodoroCntrCache % (app.opt.pomodoroQuarterNotification * 60) == 0) {
        await playQuarter();
    }

    if (app.state == "work") {
        if (watch._pomodoroCntrCache == e.inputPomodoroInterval.value * 60 ){
            await playPomodoroStart();
            popupCloseTask(store.getCurrentTask(), cooldownState);

        }
        return 
    }  
    
    if (app.state == "cooldown"){
        if (watch._pomodoroCntrCache ==  ( (e.inputCooldownInterval.value * 60) - 20) ) {
            await playPomodoroEnding();
        }

        if (watch._pomodoroCntrCache == e.inputCooldownInterval.value * 60) {
            await playQuarter()
            popupCloseTask(store.getCurrentTask(), workState);
        }
        return 
    } 
}

async function startPomodoro() {
    watch._ts_main_task = new Date();
    
    if (!app.timer) {
        app.timer = setInterval(tick, 100);
    }
}

//TODO: stop for stopping the clock only. Add button for reset
async function stop(reset) {
    // e.lblStatus.innerHTML = "Idle";
    clearInterval(app.timer);
    app.timer = null; 
    watch.reset();
    e.lblIntervalTime.className = "digital-clock idle-clock";
    e.inputTask.value = "Idle";
    if(reset){
        store.reset();
    }
    e.btnWork.disabled = false;
    e.btnIdle.disabled = false;
    e.btnCooldown.disabled = false;

}

function getTime(time) {
    // getTime convert seconds to hours:mins:sec
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


//AUDIO CONTROL

// status autoPomodorBreak
async function playPomodoroStart() {
    if (app.player.paused){
        app.player.src="media/pomodoro-alarm.wav";
        app.player.load();
        await app.player.play();
    }

}

async function playQuarter() {
    if (app.player.paused){
        app.player.src="media/calm-intro.wav";
        app.player.load();
        await app.player.play();
    }
}

async function playPomodoroEnding() {
    if (app.player.paused){
        app.player.src="media/bells-low.wav";
        app.player.load();
        await app.player.play();
    }
}

function mute() {
    e.muteIcon.src="icons/mute.png";
    e.muteIcon.onclick = function() {unMute();};
    app.player.volume = 0.05;
    
}

function unMute() {
    e.muteIcon.src="icons/volume.png";
    e.muteIcon.onclick = function () {mute();};
    app.player.volume = 0.5;
}

//UI
async function renderClock() {
    e.lblTotalTime.innerHTML = getTime(watch._pomodoroTotalCntrCache);
    e.lblIntervalTime.innerHTML = getTime(watch._pomodoroCntrCache);
}


function popupCloseTask(taskObj, newStateFunction) {
    const popup = window.open("relax.html","Time_Finished", 'width=300,height=150,scrollbars=no');
    popup.addEventListener("DOMContentLoaded", () => {
        const datadiv = popup.document.getElementById("data");
        const tittle = document.createElement("p");
        tittle.innerText = "Task: " + taskObj.name
        const time = document.createElement("p");
        time.innerText = "Started: " + taskObj.ts;
        datadiv.appendChild(tittle);
        datadiv.appendChild(time);
    })
    
    popup.focus();
    // if( app.continue == false && confirm(`Time's up! Did you finishwd "${taskObj.name}"?`) ){
    //     newStateFunction();
    // }else{
    //     app.continue = true;
    //     extendedWorkState();s
    // }
}

//TODO: rethink this as mixes UI with core
async function workState(reset=true) {
    let lastTask = store.getCurrentTask();

    if(reset) {
        watch._ts_main_task = null;
        e.inputTask.value = "New Task";
        await renderClock();
    } else {
        store.restoreCurrentTask();
        watch.restoreWatchTime();
         
    }
    app.continue = false;
    app.state = "work";
    e.lblIntervalTime.className = "digital-clock work-clock";
    if (store.currentTaskId()) {
        store.endCurrentTask();
    }
    store.addTask(e.inputTask.value, app.state);
    renderHistory();
    e.inputTask.focus();
    await startPomodoro();
    switchBtn(e.btnWork);
}

async function idleState(reset=true) {
    if(reset) {
        app._ts_idle = null;
        await renderClock();
        store.endCurrentTask();
    }
    app.continue = false;
    app.state = "idle";
    // e.lblStatus.innerHTML = "Idle...";
    e.lblIntervalTime.className = "digital-clock idle-clock";
    e.inputTask.value = "Idle";
    store.endCurrentTask();
    store.addTask(e.inputTask.value, app.state);
    renderHistory();
    await startPomodoro();
    switchBtn(e.btnIdle);
}

async function extendedWorkState() {
    e.lblIntervalTime.className = "digital-clock extendedWork-clock";
}

async function cooldownState(reset=true) {
    if(reset) {
        watch._ts_cool_down = null;
        await renderClock();
    }
    app.continue = false;
    app.state = "cooldown";
    // e.lblStatus.innerHTML = "Cool Down...";
    e.lblIntervalTime.className = "digital-clock cooldown-clock";
    e.inputTask.value = "Cooldown";
    store.endCurrentTask();
    store.addTask(e.inputTask.value, app.state);
    renderHistory();
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
 
function switchBtn(btn) {
    (e.btnWork === btn) ? e.btnWork.value = "New" : e.btnWork.value = "Work"; 
    (e.btnIdle === btn) ? e.btnIdle.disabled = true : e.btnIdle.disabled = false; 
    (e.btnCooldown === btn) ? e.btnCooldown.disabled = true : e.btnCooldown.disabled = false; 
    (e.btnInterruption === btn) ? e.btnInterruption.disabled = true : e.btnInterruption.disabled = false; 
    (e.btnEmergency === btn) ? e.btnEmergency.disabled = true : e.btnEmergency.disabled = false;     
    
}

async function render() {
    await renderClock();
    await renderHistory();
}

function renderCurrentTask() {
    e.inputTask.value = app.currentTaskObj ? app.currentTaskObj["name"]: "Start new task";
}
function renderHistory() {    
    e.tbHistory.innerHTML = "";
    var history = store.getHistory();
    if (history) {
        const sorted = Object.keys(history).sort(function (a, b) {if (a<b){return -1}else if(a>b){return 1}})

        for(i=0;i<sorted.length;i++){
            //let key= Date()
            key = sorted[i];
            //task = JSON.parse(history[key]);
            task = history[key];
            e.tbHistory.appendChild(renderTaskRow(task));
        }
    }
}

function renderTaskRow(taskObj) {
    let row = document.createElement('tr');
    let timeCell = document.createElement('td');
    let durationCell = document.createElement('td');
    let taskCell = document.createElement('td');
    [timeCell, durationCell, taskCell].forEach(element => {
        row.appendChild(element);
    }); 

    startTime = new Date(taskObj.ts)
    timeCell.innerHTML = startTime.toISOString();
    if (taskObj.ts_end) {
        row.className="item";
        durationCell.innerHTML = (watch.timeDiff(taskObj.ts, taskObj.ts_end)/60).toFixed(2) + " m"  ;
    } else {
        row.className = "ongoing";
        durationCell.innerHTML = "ONGOING";
        
    }
    taskCell.innerHTML = taskObj.name;
    return row;
    
}

// start
init();
