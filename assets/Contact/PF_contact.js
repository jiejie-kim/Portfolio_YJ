$(document).ready(function () {

  /* ---------- 맨 위로 버튼 ---------- */
  $(window).on('scroll', function () {
    if ($(document).scrollTop() > 400) {
      $('#up_btn').fadeIn();
    } else {
      $('#up_btn').fadeOut();
    }
  });

  $('#up_btn').on('click', function () {
    $('html, body').animate({ scrollTop: 0 });
  });


  /* ---------- 아래에서 떠오르는 효과 ---------- */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.hidden').forEach(el => observer.observe(el));


  /* ---------- 메일 보내기 (EmailJS) ---------- */
  emailjs.init("VpzxXnP9ZcOxH2k_U"); // 본인의 public key

  const form = document.getElementById('contact-form');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const emailInput = form.querySelector('input[name="user_email"]');
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(emailInput.value.trim())) {
      alert('유효한 이메일 주소를 입력해 주세요.');
      emailInput.focus();
      return;
    }

    // 두 번 눌러서 두 번 보내지지 않게
    button.disabled = true;
    button.textContent = '보내는 중...';

    emailjs.sendForm('service_8k8k9jb', 'template_8liumlt', form)
      .then(function () {
        alert('메일이 성공적으로 전송되었습니다!');
        form.reset();
      })
      .catch(function (error) {
        alert('메일 전송 실패:\n' + JSON.stringify(error));
        console.error('EmailJS Error:', error);
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = '보내기';
      });
  });

});
