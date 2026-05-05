<script lang="ts">
  import type { OrderItem, Lang } from '../types';

  export let items: OrderItem[] = [];
  export let lang: Lang = 'en';
  export let onClose: () => void = () => {};

  let isRunning = false;
  let currentIndex = 0;
  let secondsRemaining = 0;
  let totalSeconds = 0;
  let wakeLock: any = null;

  const t = (en: string, es: string): string => lang === 'es' ? es : en;

  $: if (items.length > 0 && secondsRemaining === 0 && currentIndex === 0) {
    totalSeconds = (items[0]?.maxTime ?? 0) * 60;
    secondsRemaining = totalSeconds;
  }

  function playBeep(freq = 800, duration = 200) {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    oscillator.connect(gain);
    gain.connect(audioCtx.destination);

    oscillator.frequency.value = freq;
    oscillator.type = 'sine';

    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration / 1000);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration / 1000);
  }

  function playCompletionAlarm() {
    const pattern = [
      { freq: 800, duration: 200 },
      { freq: 1000, duration: 200 },
      { freq: 1200, duration: 200 },
      { freq: 1000, duration: 100 },
      { freq: 1400, duration: 100 }
    ];

    let delay = 0;
    // Repeat the pattern twice for stronger emphasis
    for (let i = 0; i < 2; i++) {
      pattern.forEach(({ freq, duration }) => {
        setTimeout(() => {
          playBeep(freq, duration);
        }, delay);
        delay += duration + 50;
      });
      delay += 200; // Gap between repetitions
    }
  }

  async function requestNotificationPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') return;
    if (Notification.permission !== 'denied') {
      await Notification.requestPermission();
    }
  }

  function showNotification(title: string, options: NotificationOptions = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/favicon.png',
        badge: '/favicon.png',
        ...options,
      });
    }
  }

  async function acquireWakeLock() {
    if (!('wakeLock' in navigator)) return;
    try {
      wakeLock = await (navigator as any).wakeLock.request('screen');
    } catch (err) {
      console.log('Wake lock failed:', err);
    }
  }

  function releaseWakeLock() {
    if (wakeLock) {
      wakeLock.release().then(() => { wakeLock = null; });
    }
  }

  function toggleTimer() {
    if (!isRunning) {
      isRunning = true;
      acquireWakeLock();
      requestNotificationPermission();
      runTimer();
    } else {
      isRunning = false;
      releaseWakeLock();
    }
  }

  function runTimer() {
    if (!isRunning || secondsRemaining <= 0) {
      isRunning = false;
      releaseWakeLock();
      return;
    }

    setTimeout(() => {
      secondsRemaining--;

      if (secondsRemaining === 0 && currentIndex < items.length - 1) {
        currentIndex++;
        const nextItem = items[currentIndex];
        const baseTime = items[0]?.maxTime ?? 0;
        const nextTime = nextItem?.maxTime ?? 0;
        const diff = baseTime - nextTime;
        secondsRemaining = Math.max(0, diff * 60);
        showNotification(
          lang === 'es' ? `Añade ${nextItem.ing.name[lang]}` : `Add ${nextItem.ing.name[lang]}`,
          { tag: 'step', requireInteraction: false }
        );
      } else if (secondsRemaining === 0 && currentIndex === items.length - 1) {
        playCompletionAlarm();
        showNotification(
          lang === 'es' ? '¡Listo para servir!' : 'Ready to serve!',
          { tag: 'done', requireInteraction: false }
        );
        isRunning = false;
        releaseWakeLock();
        return;
      }

      if (isRunning) {
        runTimer();
      }
    }, 1000);
  }

  function reset() {
    isRunning = false;
    releaseWakeLock();
    currentIndex = 0;
    secondsRemaining = totalSeconds;
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  onbeforeunload = () => {
    releaseWakeLock();
  };
</script>

<div
  class="timer-overlay"
  on:click|self={onClose}
  on:keydown|self={(e) => e.key === 'Escape' && onClose()}
  role="dialog"
  aria-modal="true"
>
  <div class="timer-card">
    <div class="timer-header">
      <h2>{t('Cooking Timer', 'Temporizador de cocción')}</h2>
      <button class="close-btn" on:click={onClose} aria-label="Close">×</button>
    </div>

    {#if items.length === 0}
      <div class="timer-empty">
        <p>{t('Select ingredients to start timer', 'Selecciona ingredientes para iniciar')}</p>
      </div>
    {:else}
      <div class="timer-content">
        <div class="timer-display">
          <div class="time">{formatTime(secondsRemaining)}</div>
          <div class="step-info">
            {#if currentIndex < items.length}
              <div class="current-step">
                {t('Step', 'Paso')} {currentIndex + 1} {t('of', 'de')} {items.length}
              </div>
              <div class="ingredient-name">
                {items[currentIndex].ing.name[lang]}
              </div>
            {/if}
          </div>
        </div>

        <div class="timer-controls">
          <button
            class="timer-btn play-btn"
            on:click={toggleTimer}
            disabled={items.length === 0}
          >
            {isRunning ? t('Pause', 'Pausar') : t('Start', 'Iniciar')}
          </button>
          <button
            class="timer-btn reset-btn"
            on:click={reset}
          >
            {t('Reset', 'Reiniciar')}
          </button>
        </div>

        {#if currentIndex < items.length}
          <div class="progress-bar">
            <div
              class="progress-fill"
              style="width: {(1 - secondsRemaining / totalSeconds) * 100}%"
            />
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .timer-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(30, 26, 20, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fade-in 0.2s ease;
  }

  .timer-card {
    background: white;
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(30, 26, 20, 0.2);
    max-width: 360px;
    width: 90vw;
    overflow: hidden;
    animation: slide-up 0.3s ease;
  }

  .timer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid var(--parchment);
    background: var(--forest);
  }

  .timer-header h2 {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    color: white;
    margin: 0;
  }

  .close-btn {
    all: unset;
    cursor: pointer;
    font-size: 24px;
    color: white;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .timer-empty {
    padding: 40px 20px;
    text-align: center;
  }

  .timer-empty p {
    color: var(--ink-soft);
    font-size: 14px;
  }

  .timer-content {
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .timer-display {
    text-align: center;
  }

  .time {
    font-family: 'Courier New', monospace;
    font-size: 56px;
    font-weight: 700;
    color: var(--forest);
    line-height: 1.1;
    margin-bottom: 16px;
  }

  .step-info {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .current-step {
    font-size: 12px;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .ingredient-name {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    color: var(--ink);
  }

  .timer-controls {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .timer-btn {
    all: unset;
    cursor: pointer;
    padding: 12px 24px;
    border-radius: 99px;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 600;
    transition: all 0.2s ease;
    border: none;
  }

  .play-btn {
    background: var(--forest);
    color: white;
    min-width: 120px;
  }

  .play-btn:hover:not(:disabled) {
    background: var(--forest-light);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(45, 90, 61, 0.3);
  }

  .reset-btn {
    background: var(--parchment);
    color: var(--ink);
    min-width: 100px;
  }

  .reset-btn:hover {
    background: var(--cream-deep);
    transform: translateY(-2px);
  }

  .progress-bar {
    height: 6px;
    background: var(--parchment);
    border-radius: 99px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--forest);
    transition: width 0.3s ease;
  }

  @keyframes fade-in {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(24px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
