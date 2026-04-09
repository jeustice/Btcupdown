(function () {
  const keys = {
    streak: "streak",
    bestStreak: "bestStreak",
    rating: "rating",
    accuracy: "accuracy",
    history: "history",
    lastShareOfferAt: "lastShareOfferAt",
    roundsPlayedToday: "roundsPlayedToday",
    dailyBonusCount: "dailyBonusCount",
    lastResetDate: "lastResetDate",
  };

  function getNumber(key, fallback = 0) {
    const value = parseInt(localStorage.getItem(key), 10);
    return Number.isNaN(value) ? fallback : value;
  }

  function setNumber(key, value) {
    localStorage.setItem(key, String(value));
  }

  function getString(key, fallback = null) {
    const value = localStorage.getItem(key);
    return value === null ? fallback : value;
  }

  function setString(key, value) {
    localStorage.setItem(key, value);
  }

  function getJson(key, fallback) {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;

    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function setJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function removeMany(storageKeys) {
    storageKeys.forEach(remove);
  }

  window.AppStorage = {
    keys,
    getNumber,
    setNumber,
    getString,
    setString,
    getJson,
    setJson,
    remove,
    removeMany,
  };
})();
