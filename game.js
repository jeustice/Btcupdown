const RESULTS = {
  CORRECT: "correct",
  WRONG: "wrong",
  DRAW: "draw",
  NO_CHOICE: "no-choice",
};

const RANK_MILESTONES = [
  { threshold: 1000, name: "Bronze", icon: "🥉" },
  { threshold: 1300, name: "Silver", icon: "🥈" },
  { threshold: 1600, name: "Gold", icon: "🥇" },
  { threshold: 2000, name: "Diamond", icon: "💎" },
];

const DEFAULT_RATING = 800;
const SHARE_OFFER_COOLDOWN_MS = 20 * 60 * 1000;

const MARKET_MESSAGES = {
  up: [
    "Higher highs → bullish",
    "Buy pressure increased",
    "Uptrend continuation",
    "Momentum pushed higher",
    "Breakout upward",
  ],
  down: [
    "Lower highs → bearish",
    "Sell pressure dominated",
    "Downtrend continuation",
    "Rejection at resistance",
    "Momentum turned down",
  ],
  flat: [
    "Sideways movement",
    "Low volatility",
    "Market indecision",
    "No clear direction",
    "Consolidation phase",
  ],
};

const SAME_CHOICE_REWARD_MESSAGES = [
  "You commit, huh?",
  "Here you go.",
  "Freebie!",
  "Discipline.",
  "Confidence is key.",
  "Alright then.",
  "Predictable.",
  "Interesting...",
  "Calculated.",
];

const LOCKED_IN_MESSAGES = {
  medium: [
    "Feeling confident?",
    "Let's see about that",
    "Momentum or mistake?",
    "You sure about this?",
    "Trust your call",
    "Locked in, now wait",
    "Hope you're right",
    "Hold your nerve",
  ],
  high: [
    "Shit just got real",
    "No turning back",
    "ALL IN",
  ],
  danger: [
    "This is it",
    "No second chances",
    "Make it count",
  ],
};

function getMarketExplanation(direction) {
  const messages = MARKET_MESSAGES[direction] || MARKET_MESSAGES.flat;
  return messages[Math.floor(Math.random() * messages.length)];
}

function getRandomMessage(messages) {
  return messages[Math.floor(Math.random() * messages.length)];
}

function getLockedInStatusText(currentStreak) {
  if (currentStreak >= 7) {
    return getRandomMessage(LOCKED_IN_MESSAGES.danger);
  }

  if (currentStreak >= 5) {
    return getRandomMessage(LOCKED_IN_MESSAGES.high);
  }

  if (currentStreak >= 3) {
    return getRandomMessage(LOCKED_IN_MESSAGES.medium);
  }

  return "CHOICE LOCKED IN";
}

function getAccuracyColor(acc) {
  if (acc < 35) return "#ff5c5c";   // Learning
  if (acc < 55) return "#f1c40f";   // Stable
  if (acc < 65) return "#3498db";   // Sharp
  return "#2ecc71";                 // Elite
}

function setAccuracyDisplay(acc) {
  DOM.accuracyValue.innerText = acc + "%";
  DOM.accuracyValue.style.color = getAccuracyColor(acc);

  DOM.accuracyValue.classList.remove("sharp", "elite");
  if (acc >= 55 && acc < 65) {
    DOM.accuracyValue.classList.add("sharp");
  } else if (acc >= 65) {
    DOM.accuracyValue.classList.add("elite");
  }
}

function formatRank(rank) {
  return rank ? `${rank.icon} ${rank.name}` : "Unranked";
}

function getRankProgressStyle(currentRank) {
  if (!currentRank) {
    return {
      fillColor: "rgba(215, 220, 228, 0.42)",
      fillShadow: "0 0 6px rgba(215, 220, 228, 0.08)",
    };
  }

  if (currentRank.name === "Bronze") {
    return {
      fillColor: "#cd7f32",
      fillShadow: "0 0 10px rgba(205, 127, 50, 0.35)",
    };
  }

  if (currentRank.name === "Silver") {
    return {
      fillColor: "#dfe7f2",
      fillShadow: "0 0 12px rgba(223, 231, 242, 0.5)",
    };
  }

  if (currentRank.name === "Gold") {
    return {
      fillColor: "#f5c542",
      fillShadow: "0 0 12px rgba(245, 197, 66, 0.45)",
    };
  }

  return {
    fillColor: "#7fe7ff",
    fillShadow: "",
    isDiamond: true,
  };
}

function getRankProgress(currentRating) {
  const currentRank = RANK_MILESTONES.filter(rank => currentRating >= rank.threshold).at(-1) || null;
  const nextRank = RANK_MILESTONES.find(rank => currentRating < rank.threshold) || null;
  const progressStyle = getRankProgressStyle(currentRank);

  if (!currentRank && nextRank) {
    return {
      currentRankLabel: "Unranked",
      nextRankLabel: formatRank(nextRank),
      progressValue: `${Math.max(currentRating, 0)} / ${nextRank.threshold}`,
      progressPct: Math.max(0, Math.min((currentRating / nextRank.threshold) * 100, 100)),
      fillColor: progressStyle.fillColor,
      fillShadow: progressStyle.fillShadow,
      isDiamond: progressStyle.isDiamond || false,
    };
  }

  if (!nextRank && currentRank) {
    return {
      currentRankLabel: `${formatRank(currentRank)} (MAX)`,
      nextRankLabel: "",
      progressValue: "",
      progressPct: 100,
      fillColor: progressStyle.fillColor,
      fillShadow: progressStyle.fillShadow,
      isDiamond: progressStyle.isDiamond || false,
    };
  }

  return {
    currentRankLabel: formatRank(currentRank),
    nextRankLabel: formatRank(nextRank),
    progressValue: `${Math.max(currentRating, currentRank.threshold)} / ${nextRank.threshold}`,
    progressPct: Math.max(0, Math.min((currentRating / nextRank.threshold) * 100, 100)),
    fillColor: progressStyle.fillColor,
    fillShadow: progressStyle.fillShadow,
    isDiamond: progressStyle.isDiamond || false,
  };
}

function updateRankDisplay(currentRating) {
  const progress = getRankProgress(currentRating);

  if (DOM.rankTransition) {
    DOM.rankTransition.textContent = progress.nextRankLabel
      ? `${progress.currentRankLabel} → ${progress.nextRankLabel}`
      : progress.currentRankLabel;
  }

  if (DOM.rankProgressValue) {
    DOM.rankProgressValue.textContent = progress.progressValue;
    DOM.rankProgressValue.style.display = progress.progressValue ? "block" : "none";
  }

  if (DOM.rankProgressFill) {
    DOM.rankProgressFill.style.width = `${progress.progressPct}%`;
    DOM.rankProgressFill.classList.toggle("rank-diamond-fill", progress.isDiamond);
    DOM.rankProgressFill.style.background = progress.isDiamond ? "" : progress.fillColor;
    DOM.rankProgressFill.style.boxShadow = progress.fillShadow;
  }
}

function loadHistory() {
  const saved = window.AppStorage.getJson(window.AppStorage.keys.history, []);

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter(result => Object.values(RESULTS).includes(result)).slice(0, MAX_HISTORY);
}

function setHistoryDisplay(results) {
  if (!results.length) {
    DOM.history.innerText = "—";
    return;
  }

  const displayResults = results.slice(0, 7);
  const historyIcons = displayResults.map(result => {
    if (result === RESULTS.CORRECT) return "✅";
    if (result === RESULTS.WRONG) return "❌";
    if (result === RESULTS.DRAW) return "➖";
    return "⏹";
  }).join(" ");

  DOM.history.innerText = historyIcons;
}

function countLeadingResults(results, targetResult) {
  let count = 0;

  for (const result of results) {
    if (result !== targetResult) {
      break;
    }

    count += 1;
  }

  return count;
}

function getStreakBonus(currentStreak) {
  if (currentStreak <= 0) {
    return 0;
  }

  return Math.min(currentStreak * currentStreak, 100);
}

function getRankForRating(currentRating) {
  return RANK_MILESTONES.filter(rank => currentRating >= rank.threshold).at(-1) || null;
}

function canOfferSharePopup(currentTime = Date.now()) {
  return (currentTime - lastShareOfferAt) >= SHARE_OFFER_COOLDOWN_MS;
}

function markSharePopupOffered(currentTime = Date.now()) {
  lastShareOfferAt = currentTime;
  window.AppStorage.setNumber(window.AppStorage.keys.lastShareOfferAt, currentTime);
}

function getShareText(currentStreak, currentRating) {
  const shareStreak = Math.max(bestStreak, currentStreak);

  if (currentRating >= 2000) {
    return `Diamond pace at ${currentRating} rating with ${shareStreak} calls in a row.\nTry keeping up.`;
  }

  const messages = [
  `${shareStreak} calls in a row 🚀\nTry beating that.`,
  `${shareStreak} straight calls ⚡\nYou won't match it.`,
  `${shareStreak} clean reads 🎯\nWhat's yours?`,
  `${shareStreak} locked in 🧠\nYou?`,
  `${shareStreak} straight wins 📈\nStep up.`,
];

  return messages[Math.floor(Math.random() * messages.length)];
}

function buildShareText({ text }) {
  const url = window.location.origin;
  return `${text}\n\n${url}`;
}

function generateShareImage(currentBestStreak, currentRating) {
  const canvas = document.createElement("canvas");
  canvas.width = 800;
  canvas.height = 800;

  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const currentRank = getRankForRating(currentRating);
  const milestoneLabel = currentRank ? `${currentRank.icon} ${currentRank.name}` : "Unranked";
  let glowAlpha = 0.10;
  let glowRadius = 110;

  if (currentBestStreak >= 5) {
    glowAlpha = 0.14;
    glowRadius = 130;
  }

  if (currentBestStreak >= 8) {
    glowAlpha = 0.18;
    glowRadius = 150;
  }

  ctx.textAlign = "center";

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#0b0b0f");
  bg.addColorStop(1, "#12121a");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cardGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  cardGradient.addColorStop(0, "rgba(255, 255, 255, 0.035)");
  cardGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = cardGradient;
  ctx.fillRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(20, 20, 760, 760);

  ctx.shadowColor = "rgba(245,197,66,0.35)";
  ctx.shadowBlur = 10;
  ctx.fillStyle = "#f5c542";
  ctx.font = "bold 52px Arial";
  ctx.fillText(`⭐ ${currentRating} RATING`, 400, 130);
  ctx.shadowBlur = 0;

  const glow = ctx.createRadialGradient(400, 320, 20, 400, 320, glowRadius);
  glow.addColorStop(0, `rgba(255,255,255,${glowAlpha})`);
  glow.addColorStop(0.45, `rgba(255,255,255,${(glowAlpha * 0.5).toFixed(3)})`);
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(220, 140, 360, 360);

  ctx.shadowColor = "rgba(255,255,255,0.18)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 180px Arial";
  ctx.fillText(String(currentBestStreak), 400, 400);
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#8a8a95";
  ctx.font = "42px Arial";
  ctx.fillText("🔥 BEST STREAK", 400, 480);

  ctx.fillStyle = "#b0b0bb";
  ctx.font = "36px Arial";
  ctx.fillText(milestoneLabel, 400, 650);

  return canvas;
}

async function canvasToFile(canvas) {
  if (!canvas) {
    return null;
  }

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(null);
        return;
      }

      resolve(new File([blob], "btc-call.png", { type: "image/png" }));
    }, "image/png");
  });
}

function getLossDelta(currentRating) {
  const extraLossSteps = Math.max(0, Math.floor((currentRating - DEFAULT_RATING) / 150));
  return Math.max(-(5 + extraLossSteps), -15);
}

function renderChart(prices) {
  if (!DOM.btcChart || typeof Chart === "undefined") return;

  const ctx = DOM.btcChart.getContext("2d");
  const trendUp = prices[prices.length - 1] > prices[0];
  const color = trendUp ? "#2ecc71" : "#ff5c5c";

  if (!chart) {
    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: prices.map(() => ""),
        datasets: [{
          data: prices,
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 ? 4 : 0,
          pointBackgroundColor: (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 ? ctx.dataset.borderColor : "transparent",
          pointBorderColor: (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 ? ctx.dataset.borderColor : "transparent",
          pointBorderWidth: 2,
          fill: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0,
        },
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { display: false },
          y: { display: false }
        },
        elements: {
          line: { borderJoinStyle: "round" }
        },
        interaction: {
          intersect: false,
          mode: "index"
        }
      },
      plugins: [{
        id: 'pulseLastPoint',
        afterDatasetDraw(chartInstance) {
          const meta = chartInstance.getDatasetMeta(0);
          const point = meta.data[meta.data.length - 1];
          if (!point) return;


          // Recompute color based on current trend (force numeric)
          const data = chartInstance.data.datasets[0].data;
          const first = parseFloat(data[0]);
          const last = parseFloat(data[data.length - 1]);
          const trendUp = last > first;
          const pulseColor = trendUp ? "#2ecc71" : "#ff5c5c";

          const pulseRadius = 6 + Math.sin(Date.now() / 159) * 1.2;
          const strokeColor = pulseColor + '66';
          const ctxPulse = chartInstance.ctx;
          ctxPulse.save();
          ctxPulse.beginPath();
          ctxPulse.arc(point.x, point.y, pulseRadius, 0, 2 * Math.PI);
          ctxPulse.strokeStyle = strokeColor;
          ctxPulse.lineWidth = 2;
          ctxPulse.stroke();
          ctxPulse.restore();
        }
      }]
    });
  } else {
    chart.data.labels = prices.map(() => "");
    chart.data.datasets[0].data = prices;
    chart.data.datasets[0].borderColor = color;
    chart.data.datasets[0].pointBackgroundColor = (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 ? ctx.dataset.borderColor : "transparent";
    chart.data.datasets[0].pointBorderColor = (ctx) => ctx.dataIndex === ctx.dataset.data.length - 1 ? ctx.dataset.borderColor : "transparent";
    chart.update("none");
  }

}

async function loadChart(currentPrice = null) {
  try {
    const res = await fetch("https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1m&limit=20");
    if (!res.ok) throw new Error("Chart load failed");
    const data = await res.json();
    const prices = data.map(candle => parseFloat(candle[4]));
    if (prices.length) {
      if (currentPrice !== null) {
        prices[prices.length - 1] = currentPrice;
      }
      priceHistory = prices;
      renderChart(priceHistory);
    }
  } catch (err) {
    console.warn("Chart load error:", err);
  }
}


function animateNumber(element, deltaElement, startValue, endValue, deltaValue, duration = 400) {
  const startTime = Date.now();
  const difference = endValue - startValue;

  // Show delta immediately
  if (deltaValue > 0) {
    deltaElement.textContent = `+${deltaValue}`;
    deltaElement.style.color = "#4CAF50";
    deltaElement.style.opacity = "1";
  } else if (deltaValue < 0) {
    deltaElement.textContent = deltaValue.toString();
    deltaElement.style.color = "#f44336";
    deltaElement.style.opacity = "1";
  }

  function update() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Easing function for smooth animation
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentValue = Math.round(startValue + (difference * easeOut));
    
    element.textContent = String(currentValue);
    
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = String(endValue);
      
      // Fade out delta after a short delay
      setTimeout(() => {
        deltaElement.style.opacity = "0";
        setTimeout(() => {
          deltaElement.textContent = "";
          deltaElement.style.color = "";
          deltaElement.style.opacity = "";
        }, 300);
      }, 800);
    }
  }
  
  update();
}

const MAX_HISTORY = 30;
const ROUND_DURATION = 10;
const BETWEEN_ROUND_DELAY = 3000;
const SAME_CHOICE_REWARD_TARGET = 10;
const SAME_CHOICE_REWARD_POINTS = 1;
let startPrice = 0;
let choice = null;
let choiceTimerPct = null;
let timeLeft = ROUND_DURATION;
let timerId = null;
let streak = window.AppStorage.getNumber(window.AppStorage.keys.streak, 0);
let bestStreak = window.AppStorage.getNumber(window.AppStorage.keys.bestStreak, 0);
let lastResults = loadHistory();
let rating = window.AppStorage.getNumber(window.AppStorage.keys.rating, DEFAULT_RATING);
let accuracy = window.AppStorage.getNumber(window.AppStorage.keys.accuracy, 0);
let chart = null;
let priceHistory = [];
let currentRoundId = 0;
let debugMode = false;
let streakBreakoutResetId = null;
let sameChoicePressCount = 0;
let sameChoicePressDirection = null;
let sameChoiceRewardClaimed = false;
let lastShareOfferAt = window.AppStorage.getNumber(window.AppStorage.keys.lastShareOfferAt, 0);
let sessionRoundsPlayed = 0;
let sessionBestStreak = streak;

const DOM = {
  price: document.getElementById("price"),
  status: document.getElementById("status"),
  timer: document.getElementById("timer"),
  resultOverlay: document.getElementById("resultOverlay"),
  resultCard: document.getElementById("resultCard"),
  resultContent: document.getElementById("resultContent"),
  streakContainer: document.getElementById("streakContainer"),
  streakContent: document.getElementById("streakContent"),
  streak: document.getElementById("streak"),
  bestStreak: document.getElementById("bestStreak"),
  gameTitle: document.getElementById("gameTitle"),
  rankContainer: document.getElementById("rankContainer"),
  accuracyValue: document.getElementById("accuracyValue"),
  history: document.getElementById("history"),
  rankTransition: document.getElementById("rankTransition"),
  rankProgressValue: document.getElementById("rankProgressValue"),
  rankProgressFill: document.getElementById("rankProgressFill"),
  dailyProgress: document.getElementById("dailyProgress"),
  dailyBonusProgress: document.getElementById("dailyBonusProgress"),
  rating: document.getElementById("rating"),
  ratingDelta: document.getElementById("ratingDelta"),
  debugPanel: document.getElementById("debugPanel"),
  debugAddStreakBtn: document.getElementById("debugAddStreakBtn"),
  debugLoseSoundBtn: document.getElementById("debugLoseSoundBtn"),
  debugShareMilestoneBtn: document.getElementById("debugShareMilestoneBtn"),
  debugRemoveRatingBtn: document.getElementById("debugRemoveRatingBtn"),
  debugAddRatingBtn: document.getElementById("debugAddRatingBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  soundToggleBtn: document.getElementById("soundToggleBtn"),
  shareModal: document.getElementById("shareModal"),
  shareTitle: document.getElementById("shareTitle"),
  shareText: document.getElementById("shareText"),
  shareBtn: document.getElementById("shareBtn"),
  closeShareBtn: document.getElementById("closeShare"),
  btcChart: document.getElementById("btcChart"),
  timerBar: document.getElementById("timerBar"),
  timerBarWrap: document.getElementById("timerBarWrap"),
  upBtn: document.querySelector(".up"),
  downBtn: document.querySelector(".down"),
  gameContent: document.getElementById("gameContent"),
};

function updateSoundToggleUI() {
  if (!DOM.soundToggleBtn) {
    return;
  }

  const enabled = window.AppSounds?.isEnabled?.() ?? false;

  DOM.soundToggleBtn.textContent = enabled ? "🔊" : "🔇";
  DOM.soundToggleBtn.classList.toggle("sound-on", enabled);
  DOM.soundToggleBtn.classList.toggle("sound-off", !enabled);
  DOM.soundToggleBtn.setAttribute("aria-label", enabled ? "Disable sounds" : "Enable sounds");
  DOM.soundToggleBtn.title = enabled ? "Sounds on" : "Sounds off";
}

function closeSharePopup() {
  if (!DOM.shareModal) {
    return;
  }

  DOM.shareModal.classList.remove("visible");
  DOM.shareModal.setAttribute("aria-hidden", "true");
}

async function shareResult({ text, bestStreak: currentBestStreak, rating: currentRating }) {
  const finalText = buildShareText({ text });
  const title = DOM.gameTitle?.textContent?.trim() || document.title.trim() || "BTC Live Market";
  const canvas = generateShareImage(currentBestStreak, currentRating);
  const file = await canvasToFile(canvas);

  try {
    if (navigator.share && navigator.canShare && file && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title,
        text: finalText,
        files: [file],
      });
      return;
    }

    await navigator.clipboard.writeText(finalText);
    window.alert("Copied to clipboard");
  } catch (error) {
    console.error("Share failed", error);
  }
}

function showSharePopup(config, options = {}) {
  if (!DOM.shareModal || !DOM.shareTitle || !DOM.shareText || !DOM.shareBtn) {
    return;
  }

  if (!options.skipCooldownMark) {
    markSharePopupOffered();
  }

  const { title, message, shareText, shareBestStreak, shareRating } = config;
  DOM.shareTitle.textContent = title;
  DOM.shareText.textContent = message;
  DOM.shareBtn.onclick = async () => {
    await shareResult({
      text: shareText,
      bestStreak: shareBestStreak,
      rating: shareRating,
    });
    closeSharePopup();
  };
  DOM.closeShareBtn.onclick = closeSharePopup;
  DOM.shareModal.classList.add("visible");
  DOM.shareModal.setAttribute("aria-hidden", "false");
}

function getMilestoneSharePopupConfig(currentRating, fallbackToNextRank = false) {
  const currentRank = getRankForRating(currentRating);
  const fallbackRank = fallbackToNextRank
    ? RANK_MILESTONES.find(rank => currentRating < rank.threshold) || RANK_MILESTONES.at(-1)
    : null;
  const milestoneRank = currentRank || fallbackRank;

  if (!milestoneRank) {
    return null;
  }

  const shareText = getShareText(streak, currentRating);

  return {
    title: `${milestoneRank.icon} Reached ${milestoneRank.name}. Try to catch up!`,
    message: `${milestoneRank.icon} ${shareText}`,
    shareText: `${milestoneRank.icon} Reached ${milestoneRank.name} rank.\n\n${shareText}`,
    shareBestStreak: Math.max(bestStreak, streak),
    shareRating: currentRating,
  };
}

function getSharePopupConfig({
  previousRating,
  currentRating,
}) {
  const currentRank = getRankForRating(currentRating);
  const previousRank = getRankForRating(previousRating);

  if (currentRank && currentRank.name !== previousRank?.name) {
    return getMilestoneSharePopupConfig(currentRating);
  }

  return null;
}

function updateDebugPanelUI() {
  if (!DOM.debugPanel) {
    return;
  }

  DOM.debugPanel.style.display = debugMode ? "block" : "none";
}

function toggleDebugMode() {
  debugMode = !debugMode;
  updateDebugPanelUI();
}

function initializeDebugMode() {
  const params = new URLSearchParams(window.location.search);
  debugMode = params.get("debug") === "true";
  updateDebugPanelUI();
}

function getStreakSoundName(currentStreak) {
  if (currentStreak >= 5) {
    return "epicStreak";
  }

  if (currentStreak === 4) {
    return "superStreak";
  }

  if (currentStreak === 3) {
    return "streak";
  }

  return null;
}

function playCorrectStreakSounds(currentStreak) {
  window.AppSounds?.play("correct");

  const streakSoundName = getStreakSoundName(currentStreak);

  if (streakSoundName) {
    setTimeout(() => {
      window.AppSounds?.play(streakSoundName);
    }, 550);
  }
}

function clearStreakBreakout() {
  if (streakBreakoutResetId) {
    clearTimeout(streakBreakoutResetId);
    streakBreakoutResetId = null;
  }

  DOM.streakContainer.classList.remove("streak-elevated");
  DOM.streakContainer.style.removeProperty("--streak-breakout-x");
  DOM.streakContainer.style.removeProperty("--streak-breakout-y");
  DOM.streakContainer.style.removeProperty("--streak-breakout-scale");
}

function positionStreakAboveTitle() {
  if (!DOM.gameTitle) {
    return false;
  }

  const streakRect = DOM.streakContainer.getBoundingClientRect();
  const titleRect = DOM.gameTitle.getBoundingClientRect();
  const rankRect = DOM.rankContainer?.getBoundingClientRect() ?? null;
  const breakoutScale = Math.min(2.55, 1.68 + (Math.max(streak, 3) - 3) * 0.14);
  const streakCenterX = streakRect.left + (streakRect.width / 2);
  const streakCenterY = streakRect.top + (streakRect.height / 2);
  const targetCenterX = titleRect.left + (titleRect.width / 2);
  const targetCenterY = rankRect
    ? rankRect.bottom + ((titleRect.top - rankRect.bottom) / 2)
    : titleRect.top - ((streakRect.height * breakoutScale) * 0.62);
  const deltaX = targetCenterX - streakCenterX;
  const deltaY = targetCenterY - streakCenterY;

  clearStreakBreakout();
  DOM.streakContainer.style.setProperty("--streak-breakout-x", `${deltaX}px`);
  DOM.streakContainer.style.setProperty("--streak-breakout-y", `${deltaY}px`);
  DOM.streakContainer.style.setProperty("--streak-breakout-scale", String(breakoutScale));
  DOM.streakContainer.classList.add("streak-elevated");

  return true;
}

function updateStreakUI(shouldAnimate = false) {
  DOM.streak.textContent = String(streak);
  DOM.streakContainer.classList.remove("streak-hot", "streak-fire", "streak-animate", "streak-elevated");
  DOM.streakContent?.classList.remove("breathe-sync");
  DOM.streakContent?.style.removeProperty("--breathe-duration");
  DOM.price?.classList.remove("breathe-sync");
  DOM.price?.style.removeProperty("--breathe-duration");

  if (shouldAnimate && streak > 0) {
    if (streak >= 3) {
      positionStreakAboveTitle();
    } else {
      clearStreakBreakout();
      void DOM.streakContainer.offsetWidth;
      DOM.streakContainer.classList.add("streak-animate");
    }
  } else if (streak >= 3) {
    positionStreakAboveTitle();
  } else if (!shouldAnimate) {
    clearStreakBreakout();
  }

  if (streak >= 3) {
    const breatheDuration = Math.max(0.78, 1.7 - ((streak - 3) * 0.12));
    DOM.streakContainer.classList.add("streak-hot");
    DOM.streakContent?.style.setProperty("--breathe-duration", `${breatheDuration}s`);
    DOM.streakContent?.classList.add("breathe-sync");
    DOM.price?.style.setProperty("--breathe-duration", `${breatheDuration}s`);
    DOM.price?.classList.add("breathe-sync");
  }

  if (streak >= 5) {
    DOM.streakContainer.classList.add("streak-fire");
  }
}

DOM.rating.textContent = String(rating);
DOM.bestStreak.textContent = String(bestStreak);
updateStreakUI();
setHistoryDisplay(lastResults);
updateRankDisplay(rating);

// Initialize accuracy color
setAccuracyDisplay(accuracy);
window.DailyQuest?.updateUI({
  roundsElement: DOM.dailyProgress,
  bonusElement: DOM.dailyBonusProgress,
});

function resetProgressData() {
  clearInterval(timerId);

  window.AppStorage.removeMany([
    window.AppStorage.keys.streak,
    window.AppStorage.keys.bestStreak,
    window.AppStorage.keys.rating,
    window.AppStorage.keys.accuracy,
    window.AppStorage.keys.history,
    window.AppStorage.keys.lastShareOfferAt,
  ]);
  window.DailyQuest?.reset({
    roundsElement: DOM.dailyProgress,
    bonusElement: DOM.dailyBonusProgress,
  });

  streak = 0;
  bestStreak = 0;
  rating = DEFAULT_RATING;
  accuracy = 0;
  lastResults = [];
  lastShareOfferAt = 0;
  choice = null;
  timeLeft = ROUND_DURATION;
  currentRoundId = 0;

  DOM.rating.textContent = String(rating);
  DOM.ratingDelta.textContent = "";
  DOM.ratingDelta.style.color = "";
  DOM.ratingDelta.style.opacity = "";

  clearStreakBreakout();
  DOM.streakContainer.classList.remove("streak-animate", "streak-hot", "streak-fire");
  DOM.streak.textContent = "0";
  DOM.bestStreak.textContent = "0";
  setAccuracyDisplay(accuracy);
  setHistoryDisplay(lastResults);
  updateRankDisplay(rating);

  DOM.resultContent.innerHTML = "";
  DOM.resultOverlay.classList.remove("visible");
  DOM.gameContent.classList.remove("blurred");
  DOM.resultCard.className = "result-card";

  setStatus("Progress reset. Starting fresh round...");
  startRound();
}

function addDebugRatingPoints(points = 50) {
  const oldRating = rating;
  rating += points;
  window.AppStorage.setNumber(window.AppStorage.keys.rating, rating);
  updateRankDisplay(rating);
  animateNumber(DOM.rating, DOM.ratingDelta, oldRating, rating, points, 500);
}

function addDebugStreak() {
  streak += 1;
  window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);

  if (streak > bestStreak) {
    bestStreak = streak;
    window.AppStorage.setNumber(window.AppStorage.keys.bestStreak, bestStreak);
  }

  DOM.bestStreak.textContent = String(bestStreak);
  updateStreakUI(true);
  playCorrectStreakSounds(streak);
}

function debugShowMilestoneShare() {
  const config = getMilestoneSharePopupConfig(rating, true);

  if (!config) {
    return;
  }

  showSharePopup(config, { skipCooldownMark: true });
}

DOM.resetDataBtn?.addEventListener("click", resetProgressData);
DOM.debugAddStreakBtn?.addEventListener("click", addDebugStreak);
DOM.debugLoseSoundBtn?.addEventListener("click", () => {
  window.AppSounds?.play("incorrect");
});
DOM.debugShareMilestoneBtn?.addEventListener("click", debugShowMilestoneShare);
DOM.debugRemoveRatingBtn?.addEventListener("click", () => addDebugRatingPoints(-50));
DOM.debugAddRatingBtn?.addEventListener("click", () => addDebugRatingPoints(50));
DOM.soundToggleBtn?.addEventListener("click", () => {
  window.AppSounds?.toggle?.();
  updateSoundToggleUI();
});

DOM.shareModal?.addEventListener("click", (event) => {
  if (event.target === DOM.shareModal) {
    closeSharePopup();
  }
});

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && DOM.shareModal?.classList.contains("visible")) {
    closeSharePopup();
    return;
  }

  if (event.key !== "F3") {
    return;
  }

  event.preventDefault();
  toggleDebugMode();
});

window.addEventListener("pagehide", trackSessionExit);

initializeDebugMode();
updateSoundToggleUI();

async function getPrice() {
  const res = await fetch("https://api.coinbase.com/v2/prices/BTC-USD/spot");
  if (!res.ok) {
    throw new Error("Price request failed: " + res.status);
  }

  const data = await res.json();
  return parseFloat(data.data.amount);
}

function setStatus(text) {
  DOM.status.innerText = text;
}

function trackAnalyticsEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

function trackSessionExit() {
  trackAnalyticsEvent("session_exit", {
    rounds_played: sessionRoundsPlayed,
    current_streak: streak,
    best_streak: Math.max(sessionBestStreak, bestStreak, streak),
    rating,
  });
}

function resetSameChoiceRewardState() {
  sameChoicePressCount = 0;
  sameChoicePressDirection = null;
  sameChoiceRewardClaimed = false;
}

function awardSameChoiceReward() {
  const oldRating = rating;
  rating += SAME_CHOICE_REWARD_POINTS;
  updateRankDisplay(rating);
  animateNumber(DOM.rating, DOM.ratingDelta, oldRating, rating, SAME_CHOICE_REWARD_POINTS, 300);
  window.AppStorage.setNumber(window.AppStorage.keys.rating, rating);
  window.DailyQuest?.showReward(getRandomMessage(SAME_CHOICE_REWARD_MESSAGES), "neutral", "above-title");
}

function getRoundPromptText() {
  return streak >= 5 ? "MAKE A CALL CHAMP" : "MAKE A CALL";
}

function getTimerBarColor(pct) {
  if (pct <= 20) return "#ff5c5c";
  if (pct <= 55) return "#f1c40f";
  return "#2ecc71";
}

function getCurrentTimerPct() {
  const bar = DOM.timerBar;
  const wrap = bar?.parentElement;

  if (!bar || !wrap) {
    return Math.max(0, (timeLeft / ROUND_DURATION) * 100);
  }

  const wrapWidth = wrap.getBoundingClientRect().width;
  if (!wrapWidth) {
    return Math.max(0, (timeLeft / ROUND_DURATION) * 100);
  }

  const barWidth = bar.getBoundingClientRect().width;
  return Math.max(0, Math.min((barWidth / wrapWidth) * 100, 100));
}

function getTimingBonusInfo(pct) {
  const zoneColor = getTimerBarColor(pct);

  if (zoneColor === "#2ecc71") {
    return { bonus: 4, tier: "green" };
  }
  if (zoneColor === "#f1c40f") {
    return { bonus: 2, tier: "yellow" };
  }

  return { bonus: 0, tier: "red" };
}

function showPointsBreakdown(options) {
  const {
    isCorrect,
    isWrong,
    streakBonus,
    timingBonusInfo,
    dailyBonus,
    lossDelta,
    totalDelta,
  } = options;
  const lines = [];
  const tone = totalDelta > 0 ? "success" : "loss";

  if (isCorrect) {
    lines.push("Win +8");

    if (streakBonus > 0) {
      lines.push(`Streak +${streakBonus}`);
    }

    lines.push(`Timing +${timingBonusInfo.bonus} (${timingBonusInfo.tier})`);
  }

  if (isWrong) {
    lines.push(`Loss ${lossDelta}`);
  }

  if (dailyBonus > 0) {
    lines.push(`Daily bonus +${dailyBonus}`);
  }

  if (!lines.length) {
    return;
  }

  window.DailyQuest?.showReward(lines.join("\n"), tone);
}

function syncTickingSound(pct) {
  if (pct <= 20) {
    window.AppSounds?.playLoop?.("ticking");
    return;
  }

  window.AppSounds?.stop?.("ticking");
}

function setTimerBar(remainingSeconds, transition) {
  const pct = Math.max(0, (remainingSeconds / ROUND_DURATION) * 100);
  DOM.timerBar.style.transition = transition;
  DOM.timerBar.style.width = pct + "%";
  DOM.timerBar.style.background = getTimerBarColor(pct);
  DOM.timerBarWrap?.classList.toggle("timer-danger", pct <= 20);
  syncTickingSound(pct);
}

async function startRound() {
  clearInterval(timerId);
  currentRoundId += 1;
  window.AppSounds?.stop?.("ticking");
  resetSameChoiceRewardState();

  choice = null;
  choiceTimerPct = null;
  timeLeft = ROUND_DURATION;

  DOM.upBtn.classList.remove("choice-locked", "choice-selected", "choice-disabled");
  DOM.downBtn.classList.remove("choice-locked", "choice-selected", "choice-disabled");

  DOM.resultContent.innerHTML = "";
  DOM.resultOverlay.classList.remove("visible");
  DOM.gameContent.classList.remove("blurred");
  DOM.resultCard.className = "result-card";
  DOM.status.innerText = getRoundPromptText();

  setTimerBar(ROUND_DURATION, "width 0.2s ease-out, background 0.2s ease");

  try {
    startPrice = await getPrice();
    DOM.price.innerText = `$${startPrice.toFixed(2)}`;
    loadChart(startPrice);
  } catch (err) {
    setStatus("Failed to load BTC price");
    console.error(err);
    return;
  }

  // Start the first visual depletion immediately without consuming a second early.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      setTimerBar(ROUND_DURATION - 1, "width 1s linear, background 0.4s ease");
    });
  });

  timerId = setInterval(runTimer, 1000);
}

function choose(direction) {
  if (choice !== null) {
    if (direction === sameChoicePressDirection && !sameChoiceRewardClaimed) {
      sameChoicePressCount += 1;

      if (sameChoicePressCount >= SAME_CHOICE_REWARD_TARGET) {
        sameChoiceRewardClaimed = true;
        awardSameChoiceReward();
      }
    }

    return;
  }

  choice = direction;
  choiceTimerPct = getCurrentTimerPct();
  sameChoicePressDirection = direction;
  sameChoicePressCount = 1;
  window.AppSounds?.play("click");
  trackAnalyticsEvent("prediction", {
    direction,
    round_id: currentRoundId,
    streak,
    rating,
  });
  DOM.upBtn.classList.add("choice-locked");
  DOM.downBtn.classList.add("choice-locked");

  if (direction === "up") {
    DOM.upBtn.classList.add("choice-selected");
    DOM.downBtn.classList.add("choice-disabled");
  } else {
    DOM.downBtn.classList.add("choice-selected");
    DOM.upBtn.classList.add("choice-disabled");
  }

  setStatus(getLockedInStatusText(streak));
}

async function runTimer() {
  timeLeft -= 1;

  if (timeLeft > 0) {
    setTimerBar(timeLeft - 1, "width 1s linear, background 0.4s ease");
    return;
  }

  setTimerBar(0, "width 1s linear, background 0.4s ease");

  clearInterval(timerId);
  window.AppSounds?.stop?.("ticking");

  try {
    endPrice = await getPrice();
  } catch (err) {
    setStatus("Failed to load final BTC price");
    console.error(err);
    return;
  }

  let resultText = "";
  let roundOutcome = "";
  const streakBeforeRound = streak;

  if (choice === null) {
    resultText = "No choice made";
    window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);
    roundOutcome = "no-choice";
  } else if (endPrice > startPrice && choice === "up") {
    resultText = "✅ Correct";
    streak++;
    window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);
    roundOutcome = "correct";
  } else if (endPrice < startPrice && choice === "down") {
    resultText = "✅ Correct";
    streak++;
    window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);
    roundOutcome = "correct";
  } else if (endPrice === startPrice) {
    resultText = "➖ Draw";
    window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);
    roundOutcome = "draw";
  } else {
    resultText = "❌ Wrong";
    streak = 0;
    window.AppStorage.setNumber(window.AppStorage.keys.streak, streak);
    roundOutcome = "wrong";
  }

  const marketDirection = endPrice > startPrice ? "up" : endPrice < startPrice ? "down" : "flat";
  const marketText = getMarketExplanation(marketDirection);
  const streakBonus = roundOutcome === RESULTS.CORRECT ? getStreakBonus(streak) : 0;
  const baseCorrectDelta = roundOutcome === RESULTS.CORRECT ? 8 + streakBonus : 0;
  const timingBonusInfo = roundOutcome === RESULTS.CORRECT
    ? getTimingBonusInfo(choiceTimerPct ?? 0)
    : { bonus: 0, tier: null };

  if (roundOutcome === RESULTS.CORRECT) {
    resultText = "✅ Correct";
  }

  lastResults.unshift(roundOutcome);
  if (lastResults.length > MAX_HISTORY) {
    lastResults.pop();
  }
  window.AppStorage.setJson(window.AppStorage.keys.history, lastResults);

  const scoredRounds = lastResults.filter(r => r === "correct" || r === "wrong");
  const correctCount = scoredRounds.filter(r => r === "correct").length;
  const totalCount = scoredRounds.length;
  accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  setAccuracyDisplay(accuracy);
  window.AppStorage.setNumber(window.AppStorage.keys.accuracy, accuracy);
  setHistoryDisplay(lastResults);

  if (streak > bestStreak) {
    bestStreak = streak;
      window.AppStorage.setNumber(window.AppStorage.keys.bestStreak, bestStreak);
  }
  sessionRoundsPlayed += 1;
  sessionBestStreak = Math.max(sessionBestStreak, streak, bestStreak);
  DOM.bestStreak.textContent = String(bestStreak);

  trackAnalyticsEvent("round_complete", {
    outcome: roundOutcome,
    prediction: choice || "none",
    market_direction: marketDirection,
    rounds_played: sessionRoundsPlayed,
    streak,
    best_streak: Math.max(sessionBestStreak, bestStreak),
    rating,
  });
  trackAnalyticsEvent("streak", {
    value: streak,
    outcome: roundOutcome,
    rounds_played: sessionRoundsPlayed,
  });

  const resultClass = roundOutcome === RESULTS.CORRECT
    ? "result-success"
    : roundOutcome === RESULTS.WRONG
      ? "result-fail"
      : "result-draw";

  DOM.resultContent.innerHTML = `
    <div class="result-main">${resultText}</div>
    <div class="result-explanation">${marketText}</div>
    <div class="result-prices">Start: $${startPrice.toFixed(2)} → End: $${endPrice.toFixed(2)}</div>
  `;

  DOM.resultCard.className = `result-card visible ${resultClass}`;
  window.AppSounds?.stop?.("ticking");
  DOM.resultOverlay.classList.add("visible");
  DOM.gameContent.classList.add("blurred");
  const explanationEl = DOM.resultContent.querySelector(".result-explanation");
  explanationEl?.classList.remove("visible");
  setTimeout(() => {
    explanationEl?.classList.add("visible");
  },400);

  if (roundOutcome === RESULTS.CORRECT) {
    playCorrectStreakSounds(streak);

    DOM.resultCard.classList.remove("result-pop");
    void DOM.resultCard.offsetWidth;
    DOM.resultCard.classList.add("result-pop");
    setTimeout(() => {
      DOM.resultCard.classList.remove("result-pop");
    }, 280);

    if (streak >= 5) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 100,
          origin: { y: 0.6 }
        });
      }, 200);
    }
  } else if (roundOutcome === RESULTS.WRONG) {
    const consecutiveLosses = countLeadingResults(lastResults, RESULTS.WRONG);
    if (streakBeforeRound >= 5) {
      window.AppSounds?.play("incorrect");
      setTimeout(() => {
        window.AppSounds?.play("loseStreakBreak");
      }, 800);
    } else if (streakBeforeRound === 3 || streakBeforeRound === 4) {
      window.AppSounds?.play("loseStreak");
    } else {
      window.AppSounds?.play(consecutiveLosses === 3 ? "loseThreeInARow" : "incorrect");
    }
    DOM.resultCard.classList.add("result-shake");
    setTimeout(() => {
      DOM.resultCard.classList.remove("result-shake");
    }, 500);
  } else if (roundOutcome === RESULTS.DRAW) {
    window.AppSounds?.play("draw");
  }

  setTimeout(() => {
    updateStreakUI(roundOutcome === RESULTS.CORRECT);

    let isCorrect = roundOutcome === RESULTS.CORRECT;
    let isWrong = roundOutcome === RESULTS.WRONG;
    let isDraw = roundOutcome === RESULTS.DRAW;
    let isNoChoice = roundOutcome === RESULTS.NO_CHOICE;

    let oldRating = rating;
    let delta = 0;
    const lossDelta = getLossDelta(oldRating);
    
    if (isCorrect) {
      delta = baseCorrectDelta + timingBonusInfo.bonus;
      rating += delta;
    } else if (isWrong) {
      delta = lossDelta;
      rating += delta;
    }
    rating = Math.max(250, rating);

    const questReward = window.DailyQuest?.update({
      roundsElement: DOM.dailyProgress,
      bonusElement: DOM.dailyBonusProgress,
      outcome: roundOutcome,
      roundId: currentRoundId,
      onBonus: () => {
        const reward = 20;
        rating += reward;
        window.AppStorage.setNumber(window.AppStorage.keys.rating, rating);
        return {
          reward,
          suppressToast: true,
        };
      },
    }) || 0;
    const totalDelta = delta + questReward;

    showPointsBreakdown({
      isCorrect,
      isWrong,
      streakBonus,
      timingBonusInfo,
      dailyBonus: questReward,
      lossDelta,
      totalDelta,
    });

    updateRankDisplay(rating);

    // Animate the rating change with delta display
    animateNumber(DOM.rating, DOM.ratingDelta, oldRating, rating, totalDelta, 500);

    const sharePopupConfig = getSharePopupConfig({
      previousRating: oldRating,
      currentRating: rating,
    });

    if (sharePopupConfig && canOfferSharePopup()) {
      setTimeout(() => {
        showSharePopup(sharePopupConfig);
      }, 220);
    }
    
    // Save after animation completes
    setTimeout(() => {
      window.AppStorage.setNumber(window.AppStorage.keys.rating, rating);
    }, 500);
  }, 1000);

  setStatus("Next round...");
  setTimeout(startRound, BETWEEN_ROUND_DELAY);
}

startRound();