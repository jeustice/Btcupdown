(function () {
  const ROUNDS_PER_BONUS = 10;
  const MAX_DAILY_BONUSES = 4;
  let lastProcessedRoundId = null;

  function create(today = new Date().toDateString()) {
    return {
      roundsPlayedToday: 0,
      dailyBonusCount: 0,
      lastResetDate: today,
    };
  }

  function save(state) {
    window.AppStorage.setNumber(window.AppStorage.keys.roundsPlayedToday, state.roundsPlayedToday);
    window.AppStorage.setNumber(window.AppStorage.keys.dailyBonusCount, state.dailyBonusCount);
    window.AppStorage.setString(window.AppStorage.keys.lastResetDate, state.lastResetDate);
    return state;
  }

  function normalizeState(state) {
    const normalizedBonusCount = Math.min(MAX_DAILY_BONUSES, Math.max(0, state.dailyBonusCount));
    const normalizedRounds = normalizedBonusCount >= MAX_DAILY_BONUSES
      ? ROUNDS_PER_BONUS
      : Math.min(ROUNDS_PER_BONUS, Math.max(0, state.roundsPlayedToday));

    return {
      roundsPlayedToday: normalizedRounds,
      dailyBonusCount: normalizedBonusCount,
      lastResetDate: state.lastResetDate,
    };
  }

  function load() {
    const today = new Date().toDateString();
    const saved = {
      roundsPlayedToday: window.AppStorage.getNumber(window.AppStorage.keys.roundsPlayedToday, Number.NaN),
      dailyBonusCount: window.AppStorage.getNumber(window.AppStorage.keys.dailyBonusCount, Number.NaN),
      lastResetDate: window.AppStorage.getString(window.AppStorage.keys.lastResetDate),
    };

    if (
      saved.lastResetDate !== today ||
      Number.isNaN(saved.roundsPlayedToday) ||
      Number.isNaN(saved.dailyBonusCount)
    ) {
      return save(create(today));
    }

    return normalizeState({
      roundsPlayedToday: saved.roundsPlayedToday,
      dailyBonusCount: saved.dailyBonusCount,
      lastResetDate: saved.lastResetDate,
    });
  }

  function updateUI(options = {}) {
    const {
      roundsElement = document.getElementById("dailyProgress"),
      bonusElement = document.getElementById("dailyBonusProgress"),
    } = options;
    const state = load();
    const bonusContainer = bonusElement?.closest("#bonusContainer");

    if (roundsElement) {
      roundsElement.innerText = String(state.roundsPlayedToday);
    }

    if (bonusElement) {
      bonusElement.innerText = String(state.dailyBonusCount);
      bonusElement.classList.toggle("completed", state.dailyBonusCount >= MAX_DAILY_BONUSES);
    }

    if (bonusContainer) {
      bonusContainer.classList.toggle("completed", state.dailyBonusCount >= MAX_DAILY_BONUSES);
    }

    return state;
  }

  function showReward(text, tone = "success", extraClass = "") {
    const el = document.createElement("div");
    el.innerText = text;
    el.className = `quest-reward ${tone}${extraClass ? ` ${extraClass}` : ""}`;

    document.body.appendChild(el);

    requestAnimationFrame(() => {
      el.classList.add("visible");
    });

    setTimeout(() => {
      el.classList.remove("visible");
      setTimeout(() => el.remove(), 250);
    }, 2500);
  }

  function update(options = {}) {
    const {
      roundsElement = document.getElementById("dailyProgress"),
      bonusElement = document.getElementById("dailyBonusProgress"),
      onBonus,
      outcome,
      roundId,
    } = options;

    const state = load();

    if (roundId !== undefined && roundId === lastProcessedRoundId) {
      updateUI({ roundsElement, bonusElement });
      return 0;
    }

    if (outcome === "no-choice") {
      lastProcessedRoundId = roundId !== undefined ? roundId : lastProcessedRoundId;
      updateUI({ roundsElement, bonusElement });
      return 0;
    }

    if (state.dailyBonusCount >= MAX_DAILY_BONUSES) {
      state.roundsPlayedToday = ROUNDS_PER_BONUS;
      save(state);
      lastProcessedRoundId = roundId !== undefined ? roundId : lastProcessedRoundId;
      updateUI({ roundsElement, bonusElement });
      return 0;
    }

    state.roundsPlayedToday += 1;

    let reward = 0;
    if (state.roundsPlayedToday >= ROUNDS_PER_BONUS && state.dailyBonusCount < MAX_DAILY_BONUSES) {
      state.roundsPlayedToday -= ROUNDS_PER_BONUS;
      state.dailyBonusCount += 1;

      if (state.dailyBonusCount >= MAX_DAILY_BONUSES) {
        state.roundsPlayedToday = ROUNDS_PER_BONUS;
      }

      const bonusResult = typeof onBonus === "function"
        ? onBonus(state)
        : null;

      if (typeof bonusResult === "number") {
        reward = bonusResult;
      } else if (bonusResult && typeof bonusResult === "object") {
        reward = bonusResult.reward || 0;
        if (bonusResult.message) {
          showReward(bonusResult.message);
        }
      }

      if (!bonusResult && reward === 0) {
        reward = 20;
      }

      if (!bonusResult || (typeof bonusResult === "number" && reward > 0)) {
        showReward("+20 Daily Bonus!");
      } else if (
        bonusResult &&
        typeof bonusResult === "object" &&
        !bonusResult.message &&
        !bonusResult.suppressToast &&
        reward > 0
      ) {
        showReward("+20 Daily Bonus!");
      }
    }

    save(state);
    lastProcessedRoundId = roundId !== undefined ? roundId : lastProcessedRoundId;
    updateUI({ roundsElement, bonusElement });
    return reward;
  }

  function reset(options = {}) {
    const {
      roundsElement = document.getElementById("dailyProgress"),
      bonusElement = document.getElementById("dailyBonusProgress"),
    } = options;

    window.AppStorage.removeMany([
      window.AppStorage.keys.roundsPlayedToday,
      window.AppStorage.keys.dailyBonusCount,
      window.AppStorage.keys.lastResetDate,
    ]);
    lastProcessedRoundId = null;
    return updateUI({ roundsElement, bonusElement });
  }

  window.DailyQuest = {
    create,
    load,
    showReward,
    update,
    updateUI,
    reset,
  };
})();