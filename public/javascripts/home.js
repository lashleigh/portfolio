$(function() {
  $("code").addClass("prettyprint");
  prettyPrint();

  $("#toggle_all").bind("click", function() {
    var which = $(this).text();
    if(which == "Show all") {
      $(".answer").slideDown(); 
      $(this).html("Hide all");
      $(".question").css("cursor", "n-resize");
    } else if(which == "Hide all") {
      $(".answer").slideUp(); 
      $(this).html("Show all");
      $(".question").css("cursor", "s-resize");
    }
  });
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
