const totalPages = 14;
let currentPage = 1;
const sound = document.getElementById("pageSound");
let flipping = false;

document.querySelector('.book').addEventListener('click', function (event) {
  if (flipping) return;
  const clickedPage = event.target.closest('.page');
  if (!clickedPage) return;
  const clickedId = parseInt(clickedPage.id.replace('page', ''));

  if (clickedPage.classList.contains('flipped') && clickedId < currentPage) {
    flipBack(clickedPage);
  } else if (!clickedPage.classList.contains('flipped') && clickedId === currentPage && currentPage <= totalPages) {
    flipForward(clickedPage);
  }
});

function flipForward(page) {
  flipping = true;
  page.classList.add('flipped');
  sound.play();
  page.addEventListener('transitionend', () => {
    currentPage++;
    flipping = false;
  }, { once: true });
}

function flipBack(page) {
  flipping = true;
  page.classList.remove('flipped');
  sound.play();
  page.addEventListener('transitionend', () => {
    currentPage--;
    flipping = false;
  }, { once: true });
}

// Touch support
let touchStartX = 0;
let touchEndX = 0;

const book = document.querySelector('.book');

book.addEventListener('touchstart', (e) => {
  touchStartX = e.changedTouches[0].screenX;
});

book.addEventListener('touchend', (e) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipeGesture();
});

function handleSwipeGesture() {
  const deltaX = touchEndX - touchStartX;

  // Swipe left to go forward
  if (deltaX < -50 && currentPage <= totalPages && !flipping) {
    const page = document.getElementById(`page${currentPage}`);
    if (page && !page.classList.contains('flipped')) {
      flipForward(page);
    }
  }

  // Swipe right to go back
  if (deltaX > 50 && currentPage > 1 && !flipping) {
    const page = document.getElementById(`page${currentPage - 1}`);
    if (page && page.classList.contains('flipped')) {
      flipBack(page);
    }
  }
}