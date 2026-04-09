# BTC Up Down — Functional Documentation

## 1. Purpose
BTC Up Down is a browser-based prediction game where the player must guess whether the Bitcoin price will go **up** or **down** over a short round.

The goal is to create a fast, replayable gameplay loop built around:
- quick decision-making,
- visible progression,
- repeated play sessions,
- strong feedback,
- social sharing.

---

## 2. Core Gameplay Concept
Each round displays the current BTC price and a live mini-chart. The player has a limited amount of time to predict whether the BTC price will end the round **higher** or **lower** than the starting price.

At the end of the countdown, the game fetches the BTC price again and determines the round result.

Possible outcomes:
- **Correct**: prediction matches the market movement
- **Wrong**: prediction does not match the market movement
- **Draw**: end price equals start price
- **No choice**: player did not select any option before the timer ended

---

## 3. Round Lifecycle
### 3.1 Round start
At the beginning of each round:
- a new round ID is generated,
- the previous timer is cleared,
- the player choice is reset,
- the timer is reset to **9 seconds**,
- the current BTC price is fetched,
- the chart is loaded,
- the player is prompted to make a call.

### 3.2 Player input
The player can choose:
- **Up**
- **Down**

After a choice is made:
- the selected button is highlighted,
- the other button is visually de-emphasized,
- the choice is locked,
- the remaining timer percentage is stored for timing bonus calculation,
- a locked-in status message is shown.

### 3.3 Round end
When the countdown reaches zero:
- the timer stops,
- the final BTC price is fetched,
- the round result is calculated,
- score and progression systems are applied,
- the result card is shown,
- the next round starts automatically after a short delay.

### 3.4 Delay between rounds
The delay between rounds is **2.8 seconds**.

---

## 4. Market Data Logic
### 4.1 Start and end price
The game fetches the BTC price from the Coinbase BTC-USD spot price endpoint at:
- round start,
- round end.

### 4.2 Chart data
The mini-chart is loaded from Binance using the latest **20 candles** of **1-minute BTCUSDT data**.

### 4.3 Chart behavior
The chart:
- shows recent BTC movement,
- appears green if trend is upward,
- appears red if trend is downward,
- highlights the last point with a pulsing effect.

---

## 5. Result Rules
### 5.1 Correct
A round is correct when:
- end price > start price and player chose **up**, or
- end price < start price and player chose **down**.

Effects:
- streak increases by 1,
- rating increases,
- success feedback is shown,
- sounds may play,
- confetti may trigger on high streaks.

### 5.2 Wrong
A round is wrong when the player made a choice and the market moved in the opposite direction.

Effects:
- streak resets to 0,
- rating decreases,
- fail feedback is shown,
- loss sound logic is triggered.

### 5.3 Draw
A round is a draw when the end price equals the start price.

Effects:
- streak stays unchanged,
- no rating gain or loss is applied,
- draw sound is played.

### 5.4 No choice
A round is marked as no choice when the player makes no selection before time expires.

Effects:
- streak stays unchanged,
- no rating gain or loss is applied,
- the round is recorded separately.

---

## 6. Rating System
### 6.1 Default and floor
- Default rating: **800**
- Minimum rating: **250**

### 6.2 Rating gain on correct answer
A correct prediction can give:
- **Base win**: +8
- **Streak bonus**
- **Timing bonus**
- **Daily bonus** when applicable

### 6.3 Rating loss on wrong answer
A wrong prediction reduces rating.

Loss logic:
- starts at **-5**,
- becomes harsher as rating increases,
- is capped at **-15**.

This makes climbing harder at higher rating levels.

---

## 7. Streak System
The streak represents consecutive correct predictions.

Rules:
- Correct → streak +1
- Wrong → streak reset to 0
- Draw → streak unchanged
- No choice → streak unchanged

### 7.1 Best streak
The best streak stores the highest streak ever reached on the current browser/device.

### 7.2 Streak bonus formula
For correct rounds:
- streak bonus = **streak × streak**
- maximum streak bonus = **100**

Examples:
- streak 1 → +1
- streak 2 → +4
- streak 3 → +9
- streak 5 → +25
- streak 10 → +100

### 7.3 Streak UI thresholds
- **3+ streak**: elevated visual state and breathing animation
- **5+ streak**: stronger visual emphasis
- higher streaks may trigger stronger sounds and confetti

---

## 8. Accuracy System
Accuracy is calculated using scored rounds only.

Included:
- correct
- wrong

Excluded:
- draw
- no choice

Formula:
- accuracy = correct scored rounds / total scored rounds
- displayed as a rounded percentage

### Accuracy display colors
- **Below 35%**: red
- **35% to 54%**: yellow
- **55% to 64%**: blue
- **65%+**: green

---

## 9. History System
The game stores recent round outcomes.

### Limits
- maximum stored history: **30 rounds**
- displayed history: latest **7 results**

### Icons
- Correct = ✅
- Wrong = ❌
- Draw = ➖
- No choice = ⏹

History is used for:
- player feedback,
- accuracy calculation,
- some sound logic,
- recent performance display.

---

## 10. Rank and Milestones
The game uses rating milestones for rank progression.

### Rank thresholds
- **1000** → Bronze 🥉
- **1300** → Silver 🥈
- **1600** → Gold 🥇
- **2000** → Diamond 💎

### Rank display behavior
The UI shows:
- current rank,
- next rank,
- progress bar toward the next milestone.

### Rank states
#### Below 1000
- current rank = Unranked
- next rank = Bronze

#### Between milestones
- current rank and next rank are both shown
- progress is displayed toward next threshold

#### 2000+
- Diamond is treated as the maximum rank
- progress bar is full
- no next rank is shown

---

## 11. Daily Bonus System
The game rewards repeated daily play.

### Rules
- 1 daily bonus every **10 played rounds**
- maximum **4 daily bonuses per day**
- each bonus gives **+20 rating**

### Maximum daily reward
- **80 rating per day**

### Counted rounds
Rounds that count toward daily bonus progress:
- correct
- wrong
- draw

Rounds that do **not** count:
- no choice

### Daily reset
The daily bonus system resets automatically when the current date changes.

### Stored daily values
- rounds played today
- number of daily bonuses claimed today
- last reset date

### Completion behavior
Once the player reaches 4 daily bonuses in the same day:
- the daily bonus UI is marked completed,
- no further daily bonus rewards are granted that day.

### Protection against duplicate processing
The system uses round ID tracking to avoid counting the same round twice.

---

## 12. Timing Bonus System
The game rewards earlier commitment.

When the player locks a choice, the remaining timer percentage is stored. If the round is correct, that timing determines the bonus.

### Timing bonus tiers
- **Green zone**: +4
- **Yellow zone**: +2
- **Red zone**: +0

### Zone logic
- above 55% remaining → green
- 20% to 55% remaining → yellow
- 20% or below → red

This encourages confident, faster decisions.

---

## 13. Same-Choice Easter Egg
The game includes a hidden micro-reward.

### Rule
If the player keeps pressing the same already-selected button during the same round:
- repeated presses are counted,
- after **10 presses**, the player gets:
  - **+1 rating**
  - a random flavor message

### Conditions
- only works after the choice is already locked,
- only works for the same direction,
- can only trigger once per round.

---

## 14. Messaging and Feedback
### 14.1 Market explanation messages
At the end of each round, the game displays a short market explanation based on the actual BTC direction.

Examples include:
- bullish-style messages for upward movement,
- bearish-style messages for downward movement,
- indecision/sideways messages for flat movement.

### 14.2 Locked-in messages
After a prediction is selected, the status text changes depending on current streak level.

Message intensity increases with streak.

### 14.3 Reward toasts
Floating reward messages are used for:
- daily bonus rewards,
- point breakdowns,
- easter egg rewards.

---

## 15. Result Presentation
At round end, a result overlay is shown.

### Result card content
- main result text,
- short market explanation,
- start and end BTC prices.

### Visual states
- success style for correct,
- fail style for wrong,
- draw style for draw/no-choice grouping.

### Extra feedback
- success may trigger pop animation,
- failure may trigger shake animation,
- high streak wins may trigger confetti,
- explanation text appears with a small delay.

---

## 16. Sound System
The game includes an optional sound system controlled by the player.

### Sound preference persistence
The sound preference is stored in local storage and persists across sessions.

### Available sounds
- click
- correct
- draw
- incorrect
- lose three in a row
- lose streak
- lose streak break
- streak
- super streak
- epic streak
- ticking loop

### Examples of sound behavior
- selecting a choice plays click
- correct rounds play correct sound
- specific streak levels can trigger additional streak sounds
- low timer can trigger ticking
- wrong results can trigger different sounds depending on context

### Sound toggle
The player can enable or disable sounds with a button.

If sound is disabled:
- all active sounds stop,
- no new sounds play.

---

## 17. Share System
The game includes a social sharing feature.

### Trigger condition
A share popup can appear when the player reaches a new rank milestone.

### Cooldown
Share offers are limited to one every **20 minutes**.

### Share popup content
The popup can display:
- milestone title,
- challenge message,
- share call-to-action.

### Shared content
The shared output contains:
- challenge text,
- streak/rating context,
- game URL,
- generated share image.

### Share image content
The generated image includes:
- current rating,
- best streak,
- current rank/milestone.

### Fallback behavior
If native share with file support is available:
- the game shares text and image.

If not:
- the game copies the text to clipboard.

---

## 18. Analytics Tracking
When Google Analytics is available, the game sends gameplay events.

### Tracked events
#### Prediction
Triggered when the player locks a direction.

#### Round complete
Triggered after round resolution.

#### Streak
Triggered after each round.

#### Session exit
Triggered when the page is hidden.

### Typical values tracked
- chosen direction,
- round ID,
- outcome,
- market direction,
- rounds played in session,
- streak,
- best streak,
- rating.

---

## 19. Session Tracking
The game tracks temporary session metrics separately from long-term progress.

Tracked values:
- rounds played in the current session,
- best streak reached in the current session.

These are primarily used for analytics.

---

## 20. Debug Features
The game includes a hidden debug mode for testing.

### Activation
Debug mode can be enabled by:
- URL parameter `?debug=true`
- keyboard shortcut **F3**

### Available debug actions
Depending on available UI buttons, debug actions include:
- reset all progress,
- add streak,
- play lose sound,
- show milestone share popup,
- remove rating,
- add rating.

---

## 21. Data Persistence
The game stores persistent data in browser local storage.

### Stored keys
#### Core progression
- `streak`
- `bestStreak`
- `rating`
- `accuracy`
- `history`
- `lastShareOfferAt`

#### Daily bonus data
- `roundsPlayedToday`
- `dailyBonusCount`
- `lastResetDate`

#### Sound preference
- `btcPredictorSoundEnabled`

### Storage helper responsibilities
The storage module centralizes:
- number get/set
- string get/set
- JSON get/set
- single-key removal
- multi-key removal

---

## 22. Reset Behavior
The reset function clears the player’s persistent progress.

### Reset values
- streak
- best streak
- rating
- accuracy
- history
- share cooldown timestamp
- daily bonus state

### After reset
- rating returns to **800**,
- streak returns to **0**,
- best streak returns to **0**,
- accuracy returns to **0**,
- history is cleared,
- a fresh round starts automatically.

---

## 23. UI Functional Areas
### 23.1 Live game area
- BTC price
- mini-chart
- timer bar
- status text
- up/down buttons

### 23.2 Result area
- result overlay
- result card
- explanation
- start/end prices

### 23.3 Progression area
- current streak
- best streak
- rating
- rating delta animation
- accuracy
- recent history
- rank progress

### 23.4 Daily reward area
- daily round progress
- claimed daily bonuses
- completion state

### 23.5 Utility area
- sound toggle
- share popup
- debug panel

---

## 24. Edge Cases
The current logic includes handling for the following cases:
- invalid or missing local storage values,
- duplicate daily quest processing,
- failed chart loading,
- failed price loading at round start,
- failed price loading at round end,
- unavailable native share support.

---

## 25. Module Responsibilities
### `storage.js`
Responsible for local storage abstraction and typed helper methods.

### `bonus.js`
Responsible for daily bonus creation, loading, reset, update, UI sync, and reward toast display.

### `game.js`
Responsible for the core gameplay loop, scoring, progression, sharing, analytics, chart rendering, UI updates, and debug tools.

### `sounds.js`
Responsible for sound loading, persistence, playback, looping, stopping, and toggle state.

---

## 26. Current Product Limits
Current functional limitations of the game:
- no account system,
- no backend persistence,
- no cross-device sync,
- no leaderboard,
- no anti-cheat validation,
- no onboarding/tutorial,
- no server-side authority.

This means the current version is a strong local-browser prototype, not yet a full live product.

