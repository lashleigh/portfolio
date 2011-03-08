$(function() {
  $("code").addClass("prettyprint");
  prettyPrint();

  $(".question").bind("click", function() {
      var question = $(this);
      var answer = $(this).next();
      if(answer.is(":visible")) {
        answer.slideUp('fast');
        question.css("cursor", "s-resize");
      } else {
        answer.slideDown('fast');
        question.css("cursor", "n-resize");
      }
  });
});
