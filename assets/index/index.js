
// 인트로 애니메이션 전체 속도 (1 = 원래 속도, 1.5 = 1.5배 빠르게, 2 = 2배)
var INTRO_SPEED = 1.5;

// 배경 이미지의 실제 가로/세로 비율을 CSS에 알려줌 (글씨를 모니터에 고정하는 데 사용)
function setBgRatio() {
  var img = document.querySelector('#bg img');
  if (img && img.naturalWidth) {
    document.documentElement.style.setProperty('--bg-ratio', img.naturalWidth / img.naturalHeight);
  }
}
setBgRatio();
document.addEventListener('DOMContentLoaded', function () {
  var img = document.querySelector('#bg img');
  if (img.complete) setBgRatio(); else img.addEventListener('load', setBgRatio);
});

$(window).on('load', function () {
  document.getAnimations().forEach(function (anim) {
    anim.playbackRate = INTRO_SPEED;
  });

  // 손글씨가 다 써지면 SHOW 버튼이 두근두근 움직이기 시작
  var penAnims = document.querySelector('.hello').getAnimations({ subtree: true });
  Promise.all(penAnims.map(function (anim) { return anim.finished; })).then(function () {
    $('#start-btn').addClass('pulse');
  });
});


$(document).ready(function () {

  $('#start-btn').on('click', function (e) {
    // SHOW 글씨(링크)를 눌러도 바로 넘어가지 않고, 모니터 속으로 들어가는 효과가 끝난 뒤 이동
    e.preventDefault();

    $('#bg').addClass('expand fade-text');
    $('h1').addClass('expand fade-text');

    $('#h1 span').addClass('color-change');

    // 인트로 본 기록 저장
    sessionStorage.setItem('visited', 'true');

    setTimeout(function () {
      window.location.href = 'PF_main.html';
    }, 1100);
  });

  $('#start-btn').hover(
    function () {
      $('h1').addClass('hovered');
    },
    function () {
      $('h1').removeClass('hovered');
    }
  );

});
