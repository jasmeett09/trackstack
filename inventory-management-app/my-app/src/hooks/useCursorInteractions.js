import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const pointerMotion = '(min-width: 768px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

function createTracker(element, x, y) {
  return { element, x, y, targetX: x, targetY: y };
}

function follow(tracker, rate, prefix) {
  if (!tracker) return false;

  const dx = tracker.targetX - tracker.x;
  const dy = tracker.targetY - tracker.y;
  const moving = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;
  tracker.x = moving ? tracker.x + dx * rate : tracker.targetX;
  tracker.y = moving ? tracker.y + dy * rate : tracker.targetY;
  tracker.element.style.setProperty(`--${prefix}-x`, `${tracker.x.toFixed(2)}px`);
  tracker.element.style.setProperty(`--${prefix}-y`, `${tracker.y.toFixed(2)}px`);
  return moving;
}

function attachPointerEffects() {
  let surface;
  let glow;
  let card;
  let button;
  let frame = 0;

  const releaseCard = () => {
    card?.element.removeAttribute('data-cursor-card-active');
    card = undefined;
  };

  const releaseButton = () => {
    if (!button) return;
    button.element.removeAttribute('data-cursor-button-active');
    button.element.style.removeProperty('--magnet-x');
    button.element.style.removeProperty('--magnet-y');
    button = undefined;
  };

  const clearControls = () => {
    releaseCard();
    releaseButton();
  };

  const pause = () => {
    clearControls();
    surface?.removeAttribute('data-cursor-active');
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const clearSurface = () => {
    pause();
    glow?.element.style.removeProperty('--ambient-x');
    glow?.element.style.removeProperty('--ambient-y');
    surface = undefined;
    glow = undefined;
  };

  const tick = () => {
    frame = 0;
    const glowMoving = follow(glow, 0.11, 'ambient');
    const cardMoving = follow(card, 0.23, 'spotlight');
    const buttonMoving = follow(button, 0.19, 'magnet');
    if (glowMoving || cardMoving || buttonMoving) frame = requestAnimationFrame(tick);
  };

  const move = (event) => {
    if (event.pointerType === 'touch' || !(event.target instanceof Element)) return;

    const nextSurface = event.target.closest('[data-cursor-surface]');
    if (!nextSurface) {
      pause();
      return;
    }

    const { clientX, clientY } = event;
    if (nextSurface !== surface) {
      clearSurface();
      surface = nextSurface;
      glow = createTracker(surface.querySelector('[data-cursor-glow]'), innerWidth * 0.62, innerHeight * 0.3);
    }
    if (!surface.hasAttribute('data-cursor-active')) {
      surface.setAttribute('data-cursor-active', '');
    }
    glow.targetX = clientX;
    glow.targetY = clientY;

    const nextCard = event.target.closest('[data-cursor-card]');
    if (nextCard !== (card?.element ?? null)) {
      releaseCard();
      if (nextCard) {
        const bounds = nextCard.getBoundingClientRect();
        card = createTracker(nextCard, clientX - bounds.left, clientY - bounds.top);
        nextCard.setAttribute('data-cursor-card-active', '');
      }
    } else if (card) {
      const bounds = card.element.getBoundingClientRect();
      card.targetX = clientX - bounds.left;
      card.targetY = clientY - bounds.top;
    }

    const nextButton = event.target.closest('button[data-cursor-button]:not(:disabled):not(:focus-visible)');
    if (nextButton !== (button?.element ?? null)) {
      releaseButton();
      button = nextButton ? createTracker(nextButton, 0, 0) : undefined;
      nextButton?.setAttribute('data-cursor-button-active', '');
    }
    if (button) {
      const bounds = button.element.getBoundingClientRect();
      const x = (clientX - (bounds.left + bounds.width / 2 - button.x)) * 0.18;
      const y = (clientY - (bounds.top + bounds.height / 2 - button.y)) * 0.18;
      const max = innerWidth < 1024 ? 4 : 5.5;
      const strength = Math.min(1, max / (Math.hypot(x, y) || 1));
      button.targetX = x * strength;
      button.targetY = y * strength;
    }

    if (!frame) frame = requestAnimationFrame(tick);
  };

  const leave = (event) => {
    if (!event.relatedTarget) pause();
  };

  window.addEventListener('pointermove', move, { passive: true });
  window.addEventListener('pointerout', leave);
  window.addEventListener('pointercancel', pause);
  window.addEventListener('blur', pause);
  window.addEventListener('scroll', clearControls, { passive: true, capture: true });

  return () => {
    clearSurface();
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerout', leave);
    window.removeEventListener('pointercancel', pause);
    window.removeEventListener('blur', pause);
    window.removeEventListener('scroll', clearControls, true);
  };
}

export default function useCursorInteractions() {
  const { pathname } = useLocation();

  useEffect(() => {
    const preference = window.matchMedia(pointerMotion);
    let detach;

    const sync = () => {
      detach?.();
      detach = preference.matches ? attachPointerEffects() : undefined;
    };

    sync();
    preference.addEventListener('change', sync);
    return () => {
      preference.removeEventListener('change', sync);
      detach?.();
    };
  }, [pathname]);
}
