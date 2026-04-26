let highestZ = 30;
const question =
  'hey.. Nomro, literally I fall in love day by day with you and it feels harder, and I want to spend the rest of my life with you. Do you really want to spend the rest of your life with me?';

const questionText = document.querySelector('#questionText');
const yesBtn = document.querySelector('#yesBtn');
const noBtn = document.querySelector('#noBtn');
const songYesBtn = document.querySelector('#songYesBtn');
const songNoBtn = document.querySelector('#songNoBtn');
const loveSong = document.querySelector('#loveSong');
const memoryScreen = document.querySelector('#memoryScreen');

const songQuestion = "This song is dedicated to you. Do you want to play the song to feel more and are you ready to see the surprise?";
const songQuestionText = document.querySelector('.song-question');

function typeQuestion(index = 0) {
  if (!questionText || index > question.length) return;
  questionText.textContent = question.slice(0, index);
  setTimeout(() => typeQuestion(index + 1), 42);
}

function typeSongQuestion(index = 0) {
  if (!songQuestionText || index > songQuestion.length) return;
  songQuestionText.textContent = songQuestion.slice(0, index);
  setTimeout(() => typeSongQuestion(index + 1), 42);
}

function moveNoButton(button = noBtn) {
  if (!button) return;

  // Get current position BEFORE changing to fixed
  let currentX = parseFloat(button.style.left);
  let currentY = parseFloat(button.style.top);
  if (isNaN(currentX) || isNaN(currentY)) {
    const rect = button.getBoundingClientRect();
    currentX = rect.left;
    currentY = rect.top;
  }

  // Move the button out of the transformed card so it escapes the parent CSS transforms 
  // (which break position: fixed bounding boxes)
  // We append it to its closest `<main>` screen so it still hides when the page changes!
  const screen = button.closest('main') || document.body;
  if (button.parentElement !== screen) {
    screen.appendChild(button);
  }

  // Ensure button is fixed-positioned
  button.classList.add('is-running');
  button.style.position = 'fixed';
  button.style.right = 'auto';
  button.style.bottom = 'auto';
  button.style.transform = 'none';
  button.style.zIndex = '9999';

  // Viewport and button dimensions
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const bw = button.offsetWidth;
  const bh = button.offsetHeight;
  const safeGap = 20;

  // Boundaries
  const minX = safeGap;
  const minY = safeGap;
  const maxX = vw - bw - safeGap;
  const maxY = vh - bh - safeGap;

  // Move a sweet-spot distance: 100 to 180px away (enough to dodge mouse, but not fly away)
  const distance = 100 + Math.random() * 80;
  
  let bestX = currentX;
  let bestY = currentY;
  let foundValid = false;

  // Try picking a random angle that keeps the button fully on-screen
  for (let i = 0; i < 15; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const testX = currentX + Math.cos(angle) * distance;
    const testY = currentY + Math.sin(angle) * distance;

    if (testX >= minX && testX <= maxX && testY >= minY && testY <= maxY) {
      bestX = testX;
      bestY = testY;
      foundValid = true;
      break;
    }
  }

  // If stuck in a tight corner, just force it inside the screen bounds
  if (!foundValid) {
    const angle = Math.random() * 2 * Math.PI;
    const testX = currentX + Math.cos(angle) * distance;
    const testY = currentY + Math.sin(angle) * distance;
    bestX = Math.min(maxX, Math.max(minX, testX));
    bestY = Math.min(maxY, Math.max(minY, testY));
  }

  button.style.left = `${bestX}px`;
  button.style.top = `${bestY}px`;
}

typeQuestion();

yesBtn?.addEventListener('click', () => {
  document.body.classList.remove('question-mode');
  document.body.classList.add('song-mode');
  document.querySelector('#songScreen')?.setAttribute('aria-hidden', 'false');
  // Clear the text and start typing it
  if (songQuestionText) {
    songQuestionText.textContent = "";
    typeSongQuestion();
  }
});

noBtn?.addEventListener('pointerenter', () => moveNoButton(noBtn));
noBtn?.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  moveNoButton();
});

songYesBtn?.addEventListener('click', () => {
  if (loveSong) {
    const playWithFade = async () => {
      try {
        loveSong.currentTime = 83; // start from 1:23
        loveSong.volume = 0;

        await loveSong.play();

        const fadeDuration = 3500;
        const startedAt = performance.now();

        function fadeIn(now) {
          const progress = Math.min(1, (now - startedAt) / fadeDuration);
          loveSong.volume = progress;

          if (progress < 1) {
            requestAnimationFrame(fadeIn);
          }
        }

        requestAnimationFrame(fadeIn);
      } catch (err) {
        console.log("Audio error:", err);
      }
    };

    if (loveSong.readyState >= 1) {
      playWithFade();
    } else {
      loveSong.addEventListener('loadedmetadata', playWithFade, { once: true });
      loveSong.load();
    }
  }

  document.body.classList.remove('song-mode');
  document.body.classList.add('memory-mode');
  memoryScreen?.setAttribute('aria-hidden', 'false');
});

// ---------------------------------------------------------


songNoBtn?.addEventListener('pointerenter', () => moveNoButton(songNoBtn));
songNoBtn?.addEventListener('pointerdown', (event) => {
  event.preventDefault();
  moveNoButton(songNoBtn);
});

class Paper {
  holdingPaper = false;
  mouseTouchX = 0;
  mouseTouchY = 0;
  prevMouseX = 0;
  prevMouseY = 0;
  rotation = 0;
  currentPaperX = 0;
  currentPaperY = 0;
  rotating = false;

  init(paper) {
    this.currentPaperX = Number(paper.dataset.x || 0);
    this.currentPaperY = Number(paper.dataset.y || 0);
    this.rotation = Number(paper.dataset.rot || 0);
    paper.style.zIndex = paper.dataset.z || 1;
    highestZ = Math.max(highestZ, Number(paper.dataset.z || 1) + 1);
    this.render(paper);

    paper.addEventListener('pointerdown', (e) => {
      if (this.holdingPaper) return;

      this.holdingPaper = true;
      this.rotating = e.button === 2;
      this.mouseTouchX = e.clientX;
      this.mouseTouchY = e.clientY;
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;

      paper.style.zIndex = highestZ;
      highestZ += 1;
      paper.setPointerCapture(e.pointerId);
    });

    paper.addEventListener('pointermove', (e) => {
      if (!this.holdingPaper) return;

      if (this.rotating) {
        const dirX = e.clientX - this.mouseTouchX;
        const dirY = e.clientY - this.mouseTouchY;
        if (dirX || dirY) {
          this.rotation = Math.atan2(dirY, dirX) * 180 / Math.PI;
        }
      } else {
        this.currentPaperX += e.clientX - this.prevMouseX;
        this.currentPaperY += e.clientY - this.prevMouseY;
      }

      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
      this.render(paper);
    });

    paper.addEventListener('pointerup', (e) => {
      this.holdingPaper = false;
      this.rotating = false;
      if (paper.hasPointerCapture(e.pointerId)) {
        paper.releasePointerCapture(e.pointerId);
      }
    });

    paper.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  render(paper) {
    paper.style.transform = `translate3d(${this.currentPaperX}px, ${this.currentPaperY}px, 0) rotate(${this.rotation}deg)`;
  }
}

document.querySelectorAll('.paper').forEach((paper) => {
  const p = new Paper();
  p.init(paper);
});
