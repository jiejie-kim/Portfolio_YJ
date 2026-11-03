
$(document).ready(function () {


    $('#start-btn').on('click', function () {
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

    // // 모바일에서 실행 방지
    // if (/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)) {
    //     // 모바일이면 마우스 효과 중지
    //     console.log("모바일 환경에서는 커서 효과 비활성화됨");
    //     return;
    // }


});