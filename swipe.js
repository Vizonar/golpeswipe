// Swipe real nos cards do Treino e Teste de Maestria.
// Esquerda = golpe | Direita = seguro

const swipeState = {
  activeCard: null,
  mode: null,
  startX: 0,
  startY: 0,
  currentX: 0,
  dragging: false,
  threshold: 115,
};

function getSwipeContext(card) {
  if (!card) return null;
  if (card.id === 'treino-card') return { mode: 'treino', left: () => responderTreino('golpe'), right: () => responderTreino('seguro') };
  if (card.id === 'maestria-card') return { mode: 'maestria', left: () => responderMaestria('golpe'), right: () => responderMaestria('seguro') };
  return null;
}

function getPointerX(event) {
  return event.touches?.[0]?.clientX ?? event.clientX;
}

function getPointerY(event) {
  return event.touches?.[0]?.clientY ?? event.clientY;
}

function resetSwipeCard(card) {
  if (!card) return;
  card.classList.remove('swiping', 'swipe-left-active', 'swipe-right-active', 'swipe-out-left', 'swipe-out-right');
  card.style.transform = '';
}

function startSwipe(event) {
  const card = event.currentTarget;
  const context = getSwipeContext(card);
  if (!context) return;

  swipeState.activeCard = card;
  swipeState.mode = context.mode;
  swipeState.startX = getPointerX(event);
  swipeState.startY = getPointerY(event);
  swipeState.currentX = 0;
  swipeState.dragging = true;

  card.classList.add('swiping');
}

function moveSwipe(event) {
  if (!swipeState.dragging || !swipeState.activeCard) return;

  const currentX = getPointerX(event);
  const currentY = getPointerY(event);
  const deltaX = currentX - swipeState.startX;
  const deltaY = currentY - swipeState.startY;

  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 12) {
    event.preventDefault();
  }

  swipeState.currentX = deltaX;
  const rotate = Math.max(-14, Math.min(14, deltaX / 14));
  const lift = Math.min(18, Math.abs(deltaX) / 18);

  swipeState.activeCard.style.transform = `translateX(${deltaX}px) translateY(${-lift}px) rotate(${rotate}deg)`;
  swipeState.activeCard.classList.toggle('swipe-left-active', deltaX < -55);
  swipeState.activeCard.classList.toggle('swipe-right-active', deltaX > 55);
}

function endSwipe() {
  if (!swipeState.dragging || !swipeState.activeCard) return;

  const card = swipeState.activeCard;
  const context = getSwipeContext(card);
  const deltaX = swipeState.currentX;
  swipeState.dragging = false;

  if (!context) {
    resetSwipeCard(card);
    swipeState.activeCard = null;
    return;
  }

  if (deltaX <= -swipeState.threshold) {
    card.classList.add('swipe-out-left');
    setTimeout(() => {
      resetSwipeCard(card);
      context.left();
    }, 260);
  } else if (deltaX >= swipeState.threshold) {
    card.classList.add('swipe-out-right');
    setTimeout(() => {
      resetSwipeCard(card);
      context.right();
    }, 260);
  } else {
    resetSwipeCard(card);
  }

  swipeState.activeCard = null;
}

function setupSwipeCards() {
  ['#treino-card', '#maestria-card'].forEach((selector) => {
    const card = document.querySelector(selector);
    if (!card || card.dataset.swipeReady === 'true') return;

    card.dataset.swipeReady = 'true';
    card.classList.add('swipe-card');

    card.addEventListener('mousedown', startSwipe);
    card.addEventListener('touchstart', startSwipe, { passive: true });
  });

  document.addEventListener('mousemove', moveSwipe);
  document.addEventListener('touchmove', moveSwipe, { passive: false });
  document.addEventListener('mouseup', endSwipe);
  document.addEventListener('mouseleave', endSwipe);
  document.addEventListener('touchend', endSwipe);
  document.addEventListener('touchcancel', endSwipe);
}

document.addEventListener('DOMContentLoaded', setupSwipeCards);
