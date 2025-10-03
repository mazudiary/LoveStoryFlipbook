const totalPages = 14;
let currentPage = 1;
const sound = document.getElementById("pageSound");
let flipping = false;

// Fallback beep if audio file is missing/unsupported
let audioCtx = null;
function beepFallback(durationMs = 80, frequency = 380, volume = 0.05) {
  try {
    audioCtx =
      audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gainNode.gain.value = volume;
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    oscillator.start();
    setTimeout(() => {
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.03
      );
      oscillator.stop(audioCtx.currentTime + 0.04);
    }, durationMs);
  } catch {}
}

function playFlipSound() {
  if (!sound) return beepFallback();
  try {
    sound.currentTime = 0;
    const maybePromise = sound.play();
    if (maybePromise && typeof maybePromise.catch === "function") {
      maybePromise.catch(() => beepFallback());
    }
  } catch {
    beepFallback();
  }
}

// Accessibility: allow keyboard navigation and set roles/labels
const bookEl = document.querySelector(".book");
const hintEl = document.querySelector(".hint-overlay");
const prevBtn = document.querySelector(".nav-prev");
const nextBtn = document.querySelector(".nav-next");
if (bookEl) {
  bookEl.setAttribute("role", "list");
  bookEl.setAttribute(
    "aria-label",
    "Love Story Flipbook. Use left and right arrow keys to flip pages."
  );
  bookEl.tabIndex = 0; // make focusable for key events
}
document.querySelectorAll(".page").forEach((p, idx) => {
  p.setAttribute("role", "listitem");
  p.setAttribute("aria-label", `Page ${idx + 1} of ${totalPages}`);
});

document.querySelector(".book").addEventListener("click", function (event) {
  if (hintEl) hintEl.classList.add("hint-hidden");
  if (flipping) return;
  const clickedPage = event.target.closest(".page");
  if (!clickedPage) return;
  const clickedId = parseInt(clickedPage.id.replace("page", ""));

  if (clickedPage.classList.contains("flipped") && clickedId < currentPage) {
    flipBack(clickedPage);
  } else if (
    !clickedPage.classList.contains("flipped") &&
    clickedId === currentPage &&
    currentPage <= totalPages
  ) {
    flipForward(clickedPage);
  }
});

// Keyboard support
bookEl &&
  bookEl.addEventListener("keydown", (e) => {
    if (hintEl) hintEl.classList.add("hint-hidden");
    if (flipping) return;
    if (e.key === "ArrowRight") {
      const page = document.getElementById(`page${currentPage}`);
      if (
        page &&
        !page.classList.contains("flipped") &&
        currentPage <= totalPages
      ) {
        flipForward(page);
      }
    } else if (e.key === "ArrowLeft") {
      const page = document.getElementById(`page${currentPage - 1}`);
      if (page && page.classList.contains("flipped") && currentPage > 1) {
        flipBack(page);
      }
    }
  });

function flipForward(page) {
  flipping = true;
  page.classList.add("flipped");
  playFlipSound();
  page.addEventListener(
    "transitionend",
    () => {
      currentPage++;
      flipping = false;
    },
    { once: true }
  );
}

function flipBack(page) {
  flipping = true;
  page.classList.remove("flipped");
  playFlipSound();
  page.addEventListener(
    "transitionend",
    () => {
      currentPage--;
      flipping = false;
    },
    { once: true }
  );
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

const book = document.querySelector(".book");

book.addEventListener("touchstart", (e) => {
  touchStartX = e.changedTouches[0].screenX;
  if (hintEl) hintEl.classList.add("hint-hidden");
});

book.addEventListener("touchend", (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const deltaX = touchEndX - touchStartX;

  // Swipe left to go forward
  if (deltaX < -50 && currentPage <= totalPages && !flipping) {
    const page = document.getElementById(`page${currentPage}`);
    if (page && !page.classList.contains("flipped")) {
      flipForward(page);
    }
  }

  // Swipe right to go back
  if (deltaX > 50 && currentPage > 1 && !flipping) {
    const page = document.getElementById(`page${currentPage - 1}`);
    if (page && page.classList.contains("flipped")) {
      flipBack(page);
    }
  }
}

// Mobile nav buttons
if (prevBtn) {
  prevBtn.addEventListener("click", () => {
    if (hintEl) hintEl.classList.add("hint-hidden");
    if (flipping || currentPage <= 1) return;
    const page = document.getElementById(`page${currentPage - 1}`);
    if (page && page.classList.contains("flipped")) {
      flipBack(page);
    }
  });
}

if (nextBtn) {
  nextBtn.addEventListener("click", () => {
    if (hintEl) hintEl.classList.add("hint-hidden");
    if (flipping || currentPage > totalPages) return;
    const page = document.getElementById(`page${currentPage}`);
    if (page && !page.classList.contains("flipped")) {
      flipForward(page);
    }
  });
}
