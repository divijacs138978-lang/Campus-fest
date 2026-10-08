import confetti from 'canvas-confetti';

// Warm postal palette: cream paper, kraft envelope, stamp red, soft highlight parchment, muted olive
const POSTAL_PAPER_COLORS = ['#F3E6CE', '#A98258', '#8E2A2A', '#FFF6E5', '#5B7A3A'];

export function triggerPaperBitsConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 75,
    spread: 90,
    origin: { y: 0.6 },
    colors: POSTAL_PAPER_COLORS,
    shapes: ['square'],
    scalar: 1.3,
    ticks: 240,
    gravity: 0.8,
    drift: 0.05,
    disableForReducedMotion: true,
  });

  setTimeout(() => {
    confetti({
      particleCount: 40,
      angle: 70,
      spread: 50,
      origin: { x: 0.15, y: 0.65 },
      colors: POSTAL_PAPER_COLORS,
      shapes: ['square'],
      scalar: 1.1,
      gravity: 0.85,
      disableForReducedMotion: true,
    });
    confetti({
      particleCount: 40,
      angle: 110,
      spread: 50,
      origin: { x: 0.85, y: 0.65 },
      colors: POSTAL_PAPER_COLORS,
      shapes: ['square'],
      scalar: 1.1,
      gravity: 0.85,
      disableForReducedMotion: true,
    });
  }, 180);
}
