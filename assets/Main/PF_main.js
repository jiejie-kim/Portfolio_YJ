
var BANNER_SPEED = 3;

$(document).ready(function () {

  // MENU>UP-btn
  $(window).scroll(function () {
    if ($(document).scrollTop() > 600) {
      $('#menu_btn').fadeIn();
      $('#up_btn').fadeIn();
    } else {
      $('#menu_btn').fadeOut();
      $('#up_btn').fadeOut();
    }
  });

  //up btn
  $('#up_btn').click(function () {
    $('html, body').animate({
      scrollTop: 0
    });
  });



  //about img
  // About 섹션이 화면 아래쪽 25% 선 위로 올라오면 사진이 양옆으로 펼쳐지고,
  // 다시 그 아래로 내려가거나(위로 스크롤) 화면 밖으로 완전히 지나가면 캐릭터 뒤로 숨음
  const aboutBg = document.querySelector('.about_bg');
  if (aboutBg) {
    const aboutObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        $('#about_box1, #about_box3').toggleClass('ani', entry.isIntersecting);
      });
    }, {
      rootMargin: '0px 0px -25% 0px',
      threshold: 0
    });
    aboutObserver.observe(aboutBg);
  }


  //Hidden motion
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');

        // 배너 손글씨: 쓰기 시작할 때 속도 적용
        if (entry.target.classList.contains('nice-banner')) {
          requestAnimationFrame(function () {
            entry.target.getAnimations({ subtree: true }).forEach(function (anim) {
              anim.playbackRate = BANNER_SPEED;
            });

            // 손글씨가 다 써지면 스크롤 마우스가 나타나서 움직이기 시작
            var penAnims = entry.target.querySelector('.nice').getAnimations({ subtree: true });
            Promise.all(penAnims.map(function (anim) { return anim.finished; })).then(function () {
              $('.scroll-indicator').addClass('ready');
            });
          });
        }
      }
    });
  }, {
    threshold: 0.2
  });

  document.querySelectorAll('.hidden').forEach(el => observer.observe(el));

  // SSH 탭
  // $('#ssh_name').first().show();
  // $('.tab-content').first().show();

  // $('.tab-button').click(function () {
  //   $('.tab-button').removeClass('active');
  //   $(this).addClass('active');
  //   $('#ssh_group>div').hide();
  //   $('#ssh_group>div').eq($(this).index()).show();
  //   $('#ssh_name h2').hide();
  //   $('#ssh_name h2').eq($(this).index()).show();
  //   $('#ssh_group .tab-content').hide();
  //   $('#ssh_group .tab-content').eq($(this).index()).show();
  // });

  /* ---------- 취미: 모바일에서 옆으로 넘겨보기 ---------- */
  const hobbyMenu = document.querySelector('#hobby .hobby_menu');
  if (hobbyMenu) {
    const boxes = Array.from(hobbyMenu.querySelectorAll('.hobby_box'));

    // 점(몇 번째인지) 만들기 — PC에서는 CSS로 숨김
    const dots = document.createElement('div');
    dots.className = 'hobby-dots';
    boxes.forEach(function (box, i) {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (i + 1) + '번째 취미 보기');
      b.addEventListener('click', function () {
        box.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      });
      dots.appendChild(b);
    });
    const hint = document.createElement('span');
    hint.className = 'hobby-hint';
    hint.textContent = '옆으로 넘겨보세요';
    hobbyMenu.after(dots, hint);

    // 가운데에 가장 가까운 카드를 '현재'로 표시
    function updateHobby() {
      const mid = hobbyMenu.scrollLeft + hobbyMenu.clientWidth / 2;
      let best = 0, min = Infinity;
      boxes.forEach(function (box, i) {
        const d = Math.abs(box.offsetLeft + box.offsetWidth / 2 - mid);
        if (d < min) { min = d; best = i; }
      });
      boxes.forEach(function (box, i) { box.classList.toggle('is-current', i === best); });
      dots.querySelectorAll('button').forEach(function (b, i) { b.classList.toggle('on', i === best); });
    }

    let hobbyTick = false;
    hobbyMenu.addEventListener('scroll', function () {
      if (!hobbyTick) {
        requestAnimationFrame(function () { updateHobby(); hobbyTick = false; });
        hobbyTick = true;
      }
    }, { passive: true });
    window.addEventListener('resize', updateHobby);
    window.addEventListener('load', updateHobby);
    updateHobby();
  }


  //story
  const row = document.getElementById('story-track');
  const points = document.querySelectorAll('.point');
  const cards = document.querySelectorAll('.story-card');

  function scrollToCard(index) {
    const card = cards[index];
    const wrapper = row.parentElement;

    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const wrapperCenter = wrapper.offsetWidth / 2;
    const offset = cardCenter - wrapperCenter;

    const maxScroll = row.scrollWidth - wrapper.offsetWidth;
    const limitedOffset = Math.max(0, Math.min(offset, maxScroll));

    row.style.transform = `translateX(-${limitedOffset}px)`;

    cards.forEach((c, i) => c.classList.toggle('active', i === index));
    points.forEach(p => p.classList.remove('active'));
    points[index].classList.add('active');
  }

  points.forEach(point => {
    point.addEventListener('click', () => {
      const index = parseInt(point.dataset.index);
      scrollToCard(index);
    });
  });

  window.addEventListener('load', () => scrollToCard(0));
  window.addEventListener('resize', () => {
    const active = document.querySelector('.story-card.active');
    const index = Array.from(cards).indexOf(active);
    scrollToCard(index);
  });


  // --- 슬라이드 ---
  const wrapper = row.parentElement;
  let startX = null;                          // 스와이프 시작 X
  const THRESHOLD = 50;                       // 넘김 임계값(px)

  const getIndex = () => Array.from(cards).findIndex(c => c.classList.contains('active'));

  // pointerdown: 시작 위치 저장
  wrapper.addEventListener('pointerdown', e => { startX = e.clientX; });

  // pointerup/cancel/leave: 이동량으로 이전/다음 판단
  const endSwipe = e => {
    if (startX == null) return;
    const dx = e.clientX - startX;
    let i = getIndex();
    if (dx < -THRESHOLD && i < cards.length - 1) i++;
    else if (dx > THRESHOLD && i > 0) i--;
    scrollToCard(i);
    startX = null;
  };
  wrapper.addEventListener('pointerup', endSwipe);
  wrapper.addEventListener('pointercancel', endSwipe);
  wrapper.addEventListener('pointerleave', endSwipe);

  cards.forEach((card, index) => {
    card.addEventListener('click', () => {
      scrollToCard(index);
    });
  });



  // let isDown = false;
  // let startX, scrollLeft;
  // const $wrapper = $('.story-wrapper');

  // $wrapper.on('mousedown touchstart', function (e) {
  //   isDown = true;
  //   startX = e.pageX || e.originalEvent.touches[0].pageX;
  //   scrollLeft = $(this).scrollLeft();
  // });

  // $wrapper.on('mouseup touchend', function () {
  //   isDown = false;
  // });

  // $wrapper.on('mousemove touchmove', function (e) {
  //   if (!isDown) return;
  //   e.preventDefault();
  //   const x = e.pageX || e.originalEvent.touches[0].pageX;
  //   const walk = (x - startX) * 1.5;
  //   $(this).scrollLeft(scrollLeft - walk);
  // });









});








