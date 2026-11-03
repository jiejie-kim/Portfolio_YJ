(function () {

  /* ===== 직접 바꿔도 되는 설정 ===== */
  // 커서가 마우스를 따라오는 속도 (0.1 = 느리게 따라옴, 0.5 = 빠르게, 1 = 딱 붙어서 즉시)
  var CURSOR_SPEED = 0.25;
  // 페이지 전환 효과
  //  'fade'    : 로고·메뉴는 그대로 두고 아래 내용만 살짝 떠오르며 바뀜 (가장 차분하고 고급스러움)
  //  'pen'     : 빨간 펜으로 화면을 슥슥 칠해서 덮고, 다음 페이지에서 지우듯 사라짐 (손글씨 분위기)
  //  'window'  : 누른 곳에서 맥 창이 커지며 화면을 덮고, 다음 페이지에서 작아지며 사라짐 (작업 상세 창 분위기)
  //  'circle'  : 누른 곳에서 동그랗게 퍼짐
  //  'curtain' : 아래에서 올라와 덮음
  //  'stripes' : 세로 띠가 차례로 내려옴
  var TRANSITION = 'fade';
  /* ================================= */

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // fade: 다른 페이지에서 넘어온 경우, 화면이 그려지기 전에 '들어오는 중' 상태로 시작
  if (TRANSITION === 'fade' && !reduceMotion && sessionStorage.getItem('kyj-curtain') === '1') {
    sessionStorage.removeItem('kyj-curtain');
    root.classList.add('pt-in');
    setTimeout(function () { root.classList.remove('pt-in'); }, 900);
  }

  // body 가 준비된 뒤에 나머지 실행 (<head>에서 defer 없이 불러와도 동작)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {

  /* =========================================
     1) 페이지 이동할 때 레드 화면 전환
     ========================================= */
  var curtain = document.createElement('div');
  curtain.id = 'page-curtain';
  curtain.setAttribute('aria-hidden', 'true');
  curtain.className = 't-' + TRANSITION;
  var extra = '';
  if (TRANSITION === 'stripes') extra = '<i></i><i></i><i></i><i></i><i></i>';
  if (TRANSITION === 'pen') {
    extra = '<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' +
      '<path pathLength="1" d="M-24 4 L184 14 L-24 28 L184 40 L-24 52 L184 64 L-24 76 L184 88 L-24 100 L184 112"/>' +
      '</svg>';
  }
  if (TRANSITION === 'window') {
    extra = '<div class="pc-bar"><b></b><b></b><b></b></div>';
  }
  curtain.innerHTML = extra + '<span>K-YJ</span>';
  document.body.appendChild(curtain);

  // 효과마다 덮는 데 걸리는 시간(ms)
  var COVER_TIME = { curtain: 620, circle: 720, stripes: 860, pen: 820, window: 680 }[TRANSITION] || 620;

  // 다른 페이지에서 화면 전환으로 넘어온 경우: 덮인 상태에서 시작해 위로 걷힘
  if (TRANSITION !== 'fade' && !reduceMotion && sessionStorage.getItem('kyj-curtain') === '1') {
    sessionStorage.removeItem('kyj-curtain');
    curtain.classList.add('is-covering');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        curtain.classList.remove('is-covering');
        curtain.classList.add('is-leaving');
      });
    });
    setTimeout(function () {
      curtain.classList.remove('is-leaving');
    }, COVER_TIME + 400);
  }

  // 다른 페이지로 이동 (전환 효과 포함)
  function goTo(href, e) {
    var url = new URL(href, location.href);
    if (reduceMotion) { location.href = url.href; return; }

    if (TRANSITION === 'fade') {
      root.classList.add('pt-out');
      setTimeout(function () {
        sessionStorage.setItem('kyj-curtain', '1');
        location.href = url.href;
      }, 380);
      return;
    }

    // 동그라미·맥 창 효과는 누른 위치에서 시작
    if (e) {
      curtain.style.setProperty('--cx', e.clientX + 'px');
      curtain.style.setProperty('--cy', e.clientY + 'px');
    }
    curtain.classList.add('is-entering');
    setTimeout(function () {
      sessionStorage.setItem('kyj-curtain', '1');
      location.href = url.href;
    }, COVER_TIME);
  }

  // 사이트 안의 다른 페이지(.html)로 가는 링크를 누르면 전환 효과 후 이동
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

    var link = e.target.closest('a[href]');

    // data-href 가 붙은 상자(예: 메인 Skills 카드)는 상자 어디를 눌러도 이동
    if (!link) {
      var box = e.target.closest('[data-href]');
      if (box) goTo(box.getAttribute('data-href'), e);
      return;
    }

    if (link.target === '_blank') return;
    // 인덱스의 SHOW 버튼처럼 자체 효과가 있는 링크는 건너뜀
    if (link.closest('[data-no-transition], #start-btn') || document.body.hasAttribute('data-no-transition')) return;

    var href = link.getAttribute('href');
    if (!href || href.charAt(0) === '#' || href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0) return;

    var url = new URL(href, location.href);
    if (url.origin !== location.origin && location.protocol !== 'file:') return;
    if (!/\.html?$/.test(url.pathname)) return;
    if (url.pathname === location.pathname && url.hash === location.hash) return;

    e.preventDefault();
    goTo(href, e);
  });

  // data-href 상자는 키보드(Enter)로도 이동
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var box = e.target.closest && e.target.closest('[data-href]');
    if (box && e.target === box) goTo(box.getAttribute('data-href'));
  });

  // 뒤로가기로 돌아왔을 때 화면이 덮인 채 남지 않게
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) {
      curtain.className = 't-' + TRANSITION;
      root.classList.remove('pt-out', 'pt-in');
    }
  });


  /* =========================================
     2) 레드 점 커서 (마우스가 있는 PC에서만)
     ========================================= */
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  var dot = document.createElement('div');
  dot.id = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  dot.innerHTML = '<span>VIEW</span>' +
    '<svg class="cur-arrow" viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6h22M5 2L1 6l4 4M19 2l4 4-4 4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  document.body.appendChild(dot);
  document.documentElement.classList.add('has-cursor');

  var x = -100, y = -100, cx = -100, cy = -100;

  document.addEventListener('mousemove', function (e) {
    x = e.clientX;
    y = e.clientY;
    dot.classList.add('is-on');
  });

  document.addEventListener('mouseleave', function () {
    dot.classList.remove('is-on');
  });

  // 살짝 늦게 따라오는 부드러운 움직임
  (function follow() {
    cx += (x - cx) * (reduceMotion ? 1 : CURSOR_SPEED);
    cy += (y - cy) * (reduceMotion ? 1 : CURSOR_SPEED);
    dot.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
    requestAnimationFrame(follow);
  })();

  // 빨간 배경(상단 메뉴, About 띠, 푸터 등) 위에서는 흰 점으로 바뀜
  var LIGHT_AREAS = 'header nav, .about_bg, .footer, .work-veil, #red-bg, [data-cursor="light"]';

  // data-cursor="view" 요소 위에서 VIEW 로 커짐
  // 창 끝(크기 조절): 좌우 화살표 / 맥 창 버튼(닫기·최소화·확대): 버튼이 보이도록 테두리만 있는 링
  var RESIZE_AREAS = '.resize-handle, [data-cursor="resize"]';
  var RING_AREAS = '.mac-buttons .btn, [data-cursor="ring"]';

  document.addEventListener('mouseover', function (e) {
    var t = e.target;
    var resize = !!t.closest(RESIZE_AREAS);
    var ring = !resize && !!t.closest(RING_AREAS);
    var view = !resize && !ring && !!t.closest('[data-cursor="view"]');
    dot.classList.toggle('is-resize', resize);
    dot.classList.toggle('is-ring', ring);
    dot.classList.toggle('is-view', view);
    dot.classList.toggle('is-light', !view && !resize && !ring && !!t.closest(LIGHT_AREAS));
  });

  }

})();
