document.addEventListener('DOMContentLoaded', () => {
  const timeBtns = document.querySelectorAll('.time-btn');
  const customTimeInput = document.getElementById('custom-time');
  const startBtn = document.getElementById('start-btn');
  const stopBtn = document.getElementById('stop-btn');
  const totalTimeDisplay = document.getElementById('total-time');
  const phaseNameDisplay = document.getElementById('phase-name');
  const phaseTimerDisplay = document.getElementById('phase-timer');
  const circle = document.getElementById('circle');
  const exerciseDiv = document.getElementById('exercise');
  const selectionDiv = document.getElementById('time-limit-selection');

  let timeLimit = null; // In minutes, null if not set
  let startTime;
  let animationFrameId;
  let previousPhase = '';

  // Handle time limit selection
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeLimit = parseInt(btn.dataset.time);
      customTimeInput.value = '';
    });
  });

  customTimeInput.addEventListener('input', () => {
    timeLimit = customTimeInput.value ? parseInt(customTimeInput.value) : null;
  });

  // Start the exercise
  startBtn.addEventListener('click', () => {
    selectionDiv.style.display = 'none';
    startBtn.style.display = 'none';
    exerciseDiv.style.display = 'block';
    startExercise();
  });

  // Stop the exercise
  stopBtn.addEventListener('click', () => {
    stopExercise();
  });

  function startExercise() {
    startTime = performance.now();
    previousPhase = '';
    animationFrameId = requestAnimationFrame(update);
  }

  function stopExercise() {
    cancelAnimationFrame(animationFrameId);
    exerciseDiv.style.display = 'none';
    selectionDiv.style.display = 'block';
    startBtn.style.display = 'block';
    totalTimeDisplay.textContent = '0:00';
    phaseNameDisplay.textContent = '';
    phaseTimerDisplay.textContent = '';
  }

  function update() {
    const currentTime = performance.now();
    const elapsed = (currentTime - startTime) / 1000; // Seconds

    // Animation: Circle movement around the box
    const cycleTime = elapsed % 16; // 16s per cycle (4s per phase)
    const p = cycleTime / 16;
    const L = 300; // Box size in pixels
    let x, y;

    if (p < 0.25) { // Inhale: bottom left to top left
      x = 0;
      y = L * (1 - (p / 0.25));
    } else if (p < 0.5) { // Hold: top left to top right
      x = L * ((p - 0.25) / 0.25);
      y = 0;
    } else if (p < 0.75) { // Exhale: top right to bottom right
      x = L;
      y = L * ((p - 0.5) / 0.25);
    } else { // Wait: bottom right to bottom left
      x = L * (1 - ((p - 0.75) / 0.25));
      y = L;
    }

    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;

    // Phase and timer logic
    let phase;
    const phaseElapsed = cycleTime % 4;
    const phaseRemaining = 4 - phaseElapsed;

    if (cycleTime < 4) {
      phase = 'inhale';
    } else if (cycleTime < 8) {
      phase = 'hold';
    } else if (cycleTime < 12) {
      phase = 'exhale';
    } else {
      phase = 'wait';
    }

    phaseNameDisplay.textContent = phase;
    phaseTimerDisplay.textContent = phaseRemaining.toFixed(1);

    // Total time
    const minutes = Math.floor(elapsed / 60);
    const seconds = Math.floor(elapsed % 60);
    totalTimeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Stop condition: End on exhale when time limit is reached
    if (timeLimit !== null) {
      const T = timeLimit * 60; // Convert to seconds
      if (phase === 'wait' && previousPhase === 'exhale' && elapsed >= T) {
        circle.style.left = `${L}px`; // Position at bottom right (end of exhale)
        circle.style.top = `${L}px`;
        phaseNameDisplay.textContent = 'exhale';
        phaseTimerDisplay.textContent = '0.0';
        stopExercise();
        return;
      }
    }

    previousPhase = phase;
    animationFrameId = requestAnimationFrame(update);
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => console.log('Service Worker Registered'))
      .catch(err => console.log('Service Worker Error:', err));
  }
});
