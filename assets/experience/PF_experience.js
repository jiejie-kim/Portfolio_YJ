// 상단 손글씨 속도 (1 = 원래 속도, 1.5 = 1.5배 빠르게)
var TITLE_SPEED = 1.5;

$(function () {

  /* ---------- 맨 위로 버튼 ---------- */
  $(window).on('scroll', function () {
    if ($(document).scrollTop() > 600) {
      $('#up_btn').fadeIn();
    } else {
      $('#up_btn').fadeOut();
    }
  });

  $('#up_btn').on('click', function () {
    $('html, body').animate({ scrollTop: 0 });
  });


  /* ---------- 손글씨 제목 속도 ---------- */
  requestAnimationFrame(function () {
    document.querySelectorAll('.hw-svg').forEach(function (svg) {
      svg.getAnimations({ subtree: true }).forEach(function (anim) {
        anim.playbackRate = TITLE_SPEED;
      });
    });
  });


  /* ---------- 연도별 개수 (프로젝트 n건 · 해외 출장 n회) ---------- */
  document.querySelectorAll('.xp-year').forEach(function (year) {
    const items = year.querySelectorAll('.xp-text li');
    const trips = year.querySelectorAll('.xp-text li[data-cat="trip"]').length;
    const projects = items.length - trips;
    let text = '프로젝트 ' + projects + '건';
    if (trips) text += ' · 해외 출장 ' + trips + '회';
    year.querySelector('.xp-count').textContent = text;
  });


  /* ---------- 스크롤하면 떠오르기 ---------- */
  const years = document.querySelectorAll('.xp-year');
  const revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  years.forEach(function (y) { revealObserver.observe(y); });


  /* ---------- 가운데 선이 스크롤에 따라 빨갛게 차오름 + 지나간 연도 점은 빨강 ---------- */
  const timeline = document.querySelector('.xp-timeline');
  const line = document.querySelector('.xp-line');

  function updateLine() {
    // 기준선: 평소엔 화면 55% 높이, 페이지 끝에 가까워질수록 화면 맨 아래로 내려가서
    // 끝까지 스크롤하면 빨간 선이 마지막까지 다 차오름
    const docH = document.documentElement.scrollHeight;
    const remaining = docH - (window.scrollY + window.innerHeight);
    const k = Math.max(0, Math.min(1, 1 - remaining / window.innerHeight));
    const mid = window.innerHeight * (0.55 + 0.45 * k) + (remaining <= 2 ? 9999 : 0);
    const lineRect = line.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (mid - lineRect.top) / lineRect.height));
    timeline.style.setProperty('--progress', (p * 100) + '%');

    years.forEach(function (y) {
      const dotTop = y.getBoundingClientRect().top + 72;
      y.classList.toggle('reached', dotTop < mid);
    });
  }

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { updateLine(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateLine);
  updateLine();

});
