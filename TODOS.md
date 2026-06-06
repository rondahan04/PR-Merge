# TODOS

Items deferred from /plan-eng-review (2026-06-06). Pick up before v2 polish.

---

## TODO-1: Null-guard in revealing→playing tap-to-skip transition

**What:** When the player taps to skip the 2000ms reveal phase, guard against `nextSnippet === null` before promoting it to `currentSnippet`.

**Why:** If the prefetch hasn't completed yet when the player taps skip, promoting a null slot freezes the game silently — no error, no card, just a blank UI.

**Fix:** In the `revealing → playing` transition handler, check `if (nextSnippet === null) { /* show spinner, defer transition */ }` instead of unconditionally advancing.

**Context:** The prefetch starts when card N is displayed. Typical GPT-4o response is 1-3s. If the player swipes AND taps skip in under 1s (unlikely but possible), `nextSnippet` may still be null. The null-guard makes this a graceful spinner instead of a freeze.

**Depends on:** SwipeCard component + prefetch wiring (steps 2 + 4 merged).

---

## TODO-2: Pause timer when browser tab is hidden

**What:** Listen to `document.visibilitychange`. Pause the rAF timer loop when `document.hidden === true`, resume on focus.

**Why:** Without this, the timer freezes silently when the player switches tabs (rAF is suspended by the browser in hidden tabs). The timer appears to "skip" forward when the tab is refocused, which is confusing during a recorded demo.

**Fix:** In the Timer component's `useEffect`, add a `visibilitychange` listener. Store `pausedAt` ref. On resume, adjust `startTime` ref to account for hidden duration so elapsed time is correct.

**Context:** Low priority for live demo (nobody switches tabs mid-card). Medium priority for any recorded or async demo scenario.

**Depends on:** Timer component (step 3).

