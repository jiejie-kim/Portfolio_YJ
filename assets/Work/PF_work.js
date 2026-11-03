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


  /* ---------- 아래에서 떠오르는 효과 ---------- */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.hidden, .work-card').forEach((el) => revealObserver.observe(el));


  /* ---------- 분야 탭 ---------- */
  const $cards = $('.work-card');
  const $tabs = $('.tab-btn');
  const NAMES = {
    all: '전체 작업',
    web: '웹사이트',
    kiosk: '키오스크·UX/UI',
    editorial: '편집·브랜딩',
    page: '상세페이지·배너'
  };

  // 개수 채우기
  $('[data-count]').each(function () {
    const key = $(this).data('count');
    const n = key === 'all' ? $cards.length : $cards.filter('[data-category="' + key + '"]').length;
    $(this).text(n);
  });

  function applyFilter(filter) {
    if (!NAMES[filter]) filter = 'all';

    $tabs.removeClass('active').attr('aria-selected', 'false');
    $tabs.filter('[data-filter="' + filter + '"]').addClass('active').attr('aria-selected', 'true');

    let shown = 0;
    $cards.each(function () {
      const match = filter === 'all' || $(this).data('category') === filter;
      $(this).toggleClass('is-off', !match);
      if (match) {
        shown++;
        // 탭을 바꿨을 때 새로 보이는 카드도 부드럽게 떠오르게
        this.classList.remove('in');
        requestAnimationFrame(() => this.classList.add('in'));
      }
    });

    $('#work-title').text(NAMES[filter]);
    $('#work-count').text(shown);
    $('.work-empty').prop('hidden', shown > 0);
  }

  $tabs.on('click', function () {
    const filter = $(this).data('filter');
    applyFilter(filter);
    // 주소 끝에 #web 처럼 남겨서, 메인 페이지 카드에서 바로 연결할 수 있게
    history.replaceState(null, '', filter === 'all' ? location.pathname : '#' + filter);
  });

  // 메인 페이지 Skills 카드에서 PF_work.html#web 처럼 들어오면 해당 탭으로 시작
  applyFilter(location.hash.replace('#', '') || 'all');


  /* ---------- 상세 창 (맥 창 스타일) ---------- */
  const modal = document.getElementById('modal');
  const modalContent = modal.querySelector('.modal-contents');
  const minimizeBtn = document.getElementById('minimizeBtn');
  const sections = modal.querySelectorAll('.modal-body > section');
  let lastCard = null;
  let current = null;   // 지금 열려 있는 창 { title, index }

  function openModal(title, index) {
    current = { title: title, index: index };
    removeFromDock(index);   // 최소화돼 있던 창을 다시 열면 아래 목록에서는 빠짐
    modal.style.display = 'flex';
    modalContent.classList.remove('minimized', 'expanded');
    modalContent.style.width = '';
    minimizeBtn.classList.remove('disabled');
    document.getElementById('modal-title').textContent = title;
    // 카드의 data-modal 과 같은 data-id 를 가진 상세 내용만 보여줌 (순서가 바뀌어도 안전)
    let found = false;
    sections.forEach((section) => {
      const match = section.dataset.id === String(index);
      section.style.display = match ? 'block' : 'none';
      if (match) found = true;
    });
    if (!found && sections[Number(index)]) sections[Number(index)].style.display = 'block';
    modal.querySelector('.modal-body').scrollTop = 0;
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.style.display = 'none';
    modalContent.classList.remove('minimized', 'expanded');
    document.body.style.overflow = '';
    current = null;
    if (lastCard) lastCard.focus();
  }

  // 노란 버튼: 창을 닫고 오른쪽 아래에 작은 창으로 쌓아둠
  function toggleMinimize() {
    if (!current) return;
    addToDock(current.title, current.index);
    closeModal();
  }

  function toggleExpand() {
    modalContent.style.width = '';   // 손으로 늘린 크기는 초기화
    modalContent.classList.toggle('expanded');
  }


  /* ---------- 창 폭을 좌우로 직접 늘리고 줄이기 (PC) ---------- */
  ['left', 'right'].forEach(function (side) {
    const handle = document.createElement('span');
    handle.className = 'resize-handle ' + side;
    handle.setAttribute('aria-hidden', 'true');
    modalContent.appendChild(handle);

    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      handle.setPointerCapture(e.pointerId);
      modalContent.classList.remove('expanded');
      modalContent.classList.add('resizing');
      const startX = e.clientX;
      const startW = modalContent.getBoundingClientRect().width;

      function move(ev) {
        // 창이 가운데 정렬이라 양쪽이 같이 늘어나므로 이동 거리의 2배
        const dx = (ev.clientX - startX) * (side === 'right' ? 2 : -2);
        const w = Math.max(420, Math.min(window.innerWidth - 24, startW + dx));
        modalContent.style.width = w + 'px';
      }
      function up() {
        modalContent.classList.remove('resizing');
        handle.removeEventListener('pointermove', move);
        handle.removeEventListener('pointerup', up);
      }
      handle.addEventListener('pointermove', move);
      handle.addEventListener('pointerup', up);
    });
  });


  /* ---------- 최소화한 창 모음 (오른쪽 아래에 위로 쌓임) ---------- */
  const DOCK_KEY = 'kyj-work-dock';
  const DOCK_MAX = 5;   // 최대 몇 개까지 쌓을지
  const dock = document.createElement('div');
  dock.id = 'mini-dock';
  dock.setAttribute('aria-label', '최소화한 창');
  document.body.appendChild(dock);

  function loadDock() {
    try { return JSON.parse(sessionStorage.getItem(DOCK_KEY)) || []; } catch (e) { return []; }
  }

  function saveDock(list) {
    try { sessionStorage.setItem(DOCK_KEY, JSON.stringify(list)); } catch (e) { }
  }

  function addToDock(title, index) {
    let list = loadDock().filter((w) => w.index !== index);
    list.push({ title: title, index: index });
    if (list.length > DOCK_MAX) list = list.slice(list.length - DOCK_MAX);
    saveDock(list);
    renderDock();
  }

  function removeFromDock(index) {
    saveDock(loadDock().filter((w) => w.index !== index));
    renderDock();
  }

  function renderDock() {
    dock.innerHTML = '';
    loadDock().forEach((w) => {
      const item = document.createElement('div');
      item.className = 'mini-win';
      item.innerHTML =
        '<div class="mac-buttons">' +
        '<button class="btn red" type="button" aria-label="닫기"></button>' +
        '<span class="btn yellow disabled" aria-hidden="true"></span>' +
        '<button class="btn green" type="button" aria-label="다시 열기"></button>' +
        '</div>' +
        '<button class="mini-title" type="button"></button>';
      item.querySelector('.mini-title').textContent = w.title;
      item.querySelector('.btn.red').addEventListener('click', () => removeFromDock(w.index));
      item.querySelector('.btn.green').addEventListener('click', () => openModal(w.title, w.index));
      item.querySelector('.mini-title').addEventListener('click', () => openModal(w.title, w.index));
      dock.appendChild(item);
    });
  }

  renderDock();   // 새로고침해도 최소화한 창이 남아 있게

  // 기존 HTML의 onclick="closeModal()" 등이 그대로 동작하도록 전역 등록
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.toggleMinimize = toggleMinimize;
  window.toggleExpand = toggleExpand;

  // 카드 클릭 / 키보드(Enter, Space)로 열기
  $cards.on('click', function () {
    lastCard = this;
    openModal($(this).data('title'), String($(this).attr('data-modal')));
  });

  $cards.on('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      $(this).trigger('click');
    }
  });

  // 바깥 어두운 곳 클릭 또는 Esc 로 닫기
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') closeModal();
  });

});
