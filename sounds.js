(function () {
  const STORAGE_KEY = "btcPredictorSoundEnabled";
  const sounds = {
    click: new Audio("Sounds/Click.mp3"),
    correct: new Audio("Sounds/Correct.mp3"),
    draw: new Audio("Sounds/Draw.mp3"),
    incorrect: new Audio("Sounds/Incorrect.mp3"),
    loseThreeInARow: new Audio("Sounds/Lose-3-in-a-row.mp3"),
    loseStreak: new Audio("Sounds/lose-streak.mp3"),
    loseStreakBreak: new Audio("Sounds/Lose-streak-break.mp3"),
    streak: new Audio("Sounds/Streak.mp3"),
    superStreak: new Audio("Sounds/Super streak.mp3"),
    epicStreak: new Audio("Sounds/EPIC STREAK.mp3"),
    ticking: new Audio("Sounds/Ticking.mp3"),
  };
  let enabled = false;

  sounds.ticking.loop = true;

  Object.values(sounds).forEach((sound) => {
    sound.preload = "auto";
    sound.volume = 0.5;
  });

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      enabled = saved === "true";
    }
  } catch (_) {}

  function play(name) {
    const sound = sounds[name];

    if (!sound || !enabled) {
      return;
    }

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function playLoop(name) {
    const sound = sounds[name];

    if (!sound || !enabled || !sound.paused) {
      return;
    }

    sound.currentTime = 0;
    sound.play().catch(() => {});
  }

  function stop(name) {
    const sound = sounds[name];

    if (!sound) {
      return;
    }

    sound.pause();
    sound.currentTime = 0;
  }

  function setEnabled(nextEnabled) {
    enabled = Boolean(nextEnabled);

    if (!enabled) {
      Object.values(sounds).forEach((sound) => {
        sound.pause();
        sound.currentTime = 0;
      });
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch (_) {}

    return enabled;
  }

  function toggle() {
    return setEnabled(!enabled);
  }

  function isEnabled() {
    return enabled;
  }

  window.AppSounds = {
    isEnabled,
    play,
    playLoop,
    setEnabled,
    stop,
    toggle,
  };
})();