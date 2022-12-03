# Tomodoro (former Pomocucoo)

Tomodoro is a pomodoro timer that should help you to keep focus on your work and eventually to keep track of your spend time. 

Clock will split the time in pomodoro intervals, 55min by default, where your focus tends to be stronger. Cooldown intervals of 5 min are set by defaul to help you recover your concentration. 

# Development

```

npm i
npm run start
```

Build the packages (on each system)
```
npm run make
``` 
It only makes the binary for the current platform. 


# Roadmap

v0.1
[x] Ring on every Pomodoro interval
[x] automated break time
[x] Cooldown end notification. 

v0.2
[x] internal clock based on date diff instead of counter. This avoids application to stop counting on sleep. 
[x] cooldown intervale setter fix
[x] ~~Support for linux~~ 


v0.3
[x] Tasks history
[ ] history extraction
[ ] Task input popup on status finished
[x] Task end popup to conitnue working. 
[ ] extended time period notification
[x] volume, mute, mute next notif and stop playing music
[x] Reset feature



v0.4
[ ] Interruption mode. Like emergency mode, where current work state is running bellow, but there is a prioitary task on top. 
[ ] Shortcut to manage current task
[ ] task table edition
[ ] Vulnerability management pipeline
[ ] Static code analisys pipeline


vX.X
[ ] pipeline to cross build, package and publication on github. 

v0.5

[ ] automatic idle feature on screen sleep. 
[ ] All windows, on top feature
[ ] customize alerts

v0.6 
[ ] Pause feature
[ ] transparent when mouse over or move away from current
[ ] Shortcuts to manage states

v0.7
[ ] pleasant look and feel.
[ ] default settings

v1
[x] ~~Support for linux~~
[ ] Support for windows

v1.1
[ ] stats: idle time, worked time, interruptions. Non respected pomodoros. 
