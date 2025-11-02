$('#addReview').submit(function (e) {
  // 기존에 떠 있던 에러 메시지를 숨긴다.
  $('.alert.alert-danger').hide();

  // 필수 필드(name, rating, review) 중 하나라도 비어있는지 확인한다.
  if (!$('input#name').val() || !$('select#rating').val() || !$('textarea#review').val()) {

    if ($('.alert.alert-danger').length) { // 이미 에러 메시지가 있다면 다시 보여준다.
      $('.alert.alert-danger').show();
    } else {
      // 에러 메시지가 없다면 새로 생성하여 폼 앞에 추가한다.
      $(this).prepend('<div role="alert" class="alert alert-danger">All fields required, \
 please try again</div>');
    }
    return false; //중요: 폼 제출을 막는다.
  }
});