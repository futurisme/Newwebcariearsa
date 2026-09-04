document.addEventListener('DOMContentLoaded', () => {
  const homeView = document.getElementById('playstore-home');
  const detailView = document.getElementById('playstore-detail');
  const backBtn = document.getElementById('back-playstore');
  const appItems = document.querySelectorAll('.playstore-item');

  if (backBtn && homeView && detailView) {
    backBtn.addEventListener('click', () => {
      detailView.classList.add('hidden');
      homeView.classList.remove('hidden');
    });
  }

  appItems.forEach(item => {
    item.addEventListener('click', () => {
      if (homeView && detailView) {
        homeView.classList.add('hidden');
        detailView.classList.remove('hidden');
        detailView.scrollTop = 0;
      }
    });
  });
});
