<script lang="ts">
  import type { OrderItem, Lang } from '../types';

  export let items: OrderItem[] = [];
  export let lang: Lang = 'en';
  export let onClose: () => void = () => {};

  let isRunning = false;
  let phaseIndex = 0;
  let phaseSeconds = 0;
  let phaseDuration = 0;
  let phaseComplete = false;
  let wakeLock: any = null;

  const t = (en: string, es: string): string => lang === 'es' ? es : en;

  function getPhaseDuration(i: number): number {
    if (i < items.length - 1) {
      return (items[i + 1].addAt - items[i].addAt) * 60;
    }
    return items[items.length - 1].time * 60;
  }

  $: if (items.length > 0 && phaseSeconds === 0 && phaseIndex === 0) {
    phaseDuration = getPhaseDuration(0);
    phaseSeconds = phaseDuration;
  }

  function playBell() {
    const audio = new Audio('/bell-ring.mp3');
    audio.play().catch(() => {});
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
    } catch (_) {}
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
    if (!isRunning || phaseSeconds <= 0) {
      isRunning = false;
      releaseWakeLock();
      return;
    }

    setTimeout(() => {
      phaseSeconds--;

      if (phaseSeconds === 0) {
        isRunning = false;
        releaseWakeLock();
        playBell();
        phaseComplete = true;
        if (phaseIndex === items.length - 1) {
          showNotification(
            lang === 'es' ? '¡Listo para servir!' : 'Ready to serve!',
            { tag: 'done', requireInteraction: false }
          );
        } else {
          const nextItem = items[phaseIndex + 1];
          showNotification(
            lang === 'es' ? `Añade ${nextItem.ing.name.es}` : `Add ${nextItem.ing.name.en}`,
            { tag: 'step', requireInteraction: false }
          );
        }
        return;
      }

      if (isRunning) runTimer();
    }, 1000);
  }

  function startNextPhase() {
    phaseIndex++;
    phaseDuration = getPhaseDuration(phaseIndex);
    phaseSeconds = phaseDuration;
    phaseComplete = false;
    toggleTimer();
  }

  function reset() {
    isRunning = false;
    releaseWakeLock();
    phaseIndex = 0;
    phaseDuration = getPhaseDuration(0);
    phaseSeconds = phaseDuration;
    phaseComplete = false;
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
    {:else if phaseComplete}
      <div class="timer-content">
        {#if phaseIndex === items.length - 1}
          <div class="phase-complete">
            <div class="phase-heading">{t('Ready to serve! 🍽', '¡Listo para servir! 🍽')}</div>
          </div>
          <div class="timer-controls">
            <button class="timer-btn play-btn" on:click={onClose}>
              {t('Done', 'Hecho')}
            </button>
            <button class="timer-btn reset-btn" on:click={reset}>
              {t('Start over', 'Volver a empezar')}
            </button>
          </div>
        {:else}
          <div class="phase-complete">
            <div class="phase-label">{t('Add now:', 'Añade ahora:')}</div>
            <div class="ingredient-name">{items[phaseIndex + 1].ing.name[lang]}</div>
            <div class="phase-subtext">
              {t(`Steam for ${items[phaseIndex + 1].time} min`, `Cocinar ${items[phaseIndex + 1].time} min al vapor`)}
            </div>
          </div>
          <div class="timer-controls">
            <button class="timer-btn play-btn" on:click={startNextPhase}>
              ▶ {t(`Start ${items[phaseIndex + 1].time} min timer`, `Iniciar ${items[phaseIndex + 1].time} min`)}
            </button>
            <button class="timer-btn reset-btn" on:click={reset}>
              {t('Reset all', 'Reiniciar todo')}
            </button>
          </div>
        {/if}
      </div>
    {:else}
      <div class="timer-content">
        <div class="timer-display">
          <div class="time">{formatTime(phaseSeconds)}</div>
          <div class="step-info">
            <div class="current-step">
              {t('Step', 'Paso')} {phaseIndex + 1} {t('of', 'de')} {items.length}
            </div>
            <div class="ingredient-name">
              {items[phaseIndex].ing.name[lang]}
            </div>
            {#if phaseIndex < items.length - 1}
              <div class="next-info">
                {t('Up next:', 'A continuación:')} {items[phaseIndex + 1].ing.name[lang]}
              </div>
            {:else}
              <div class="next-info">
                {t('Almost done', 'Casi listo')}
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
          <button class="timer-btn reset-btn" on:click={reset}>
            {t('Reset', 'Reiniciar')}
          </button>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            style="width: {phaseDuration > 0 ? (1 - phaseSeconds / phaseDuration) * 100 : 0}%"
          />
        </div>
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

  .next-info {
    font-size: 12px;
    color: var(--ink-soft);
  }

  .phase-complete {
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .phase-heading {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 700;
    color: var(--forest);
  }

  .phase-label {
    font-size: 12px;
    color: var(--ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .phase-subtext {
    font-size: 13px;
    color: var(--ink-soft);
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
