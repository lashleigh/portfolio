var number_of_questions;
var number_visible;
$(function() {
  number_of_questions = $(".question").length;
  number_visible = $(".answer:visible").length;

  $("code").addClass("prettyprint");
  prettyPrint();

  $("#toggle_all").bind("click", function() {
    var which = $(this).text();
    if(which == "Show all") {
      show_all();
    } else if(which == "Hide all") {
      hide_all();
    }
  });
  $(".question").bind("click", function() {
      var question = $(this);
      var answer = $(this).next();
      if(answer.is(":visible")) {
        answer.slideUp('fast');
        question.css("cursor", "s-resize");
        decrement_visible();
      } else {
        answer.slideDown('fast');
        question.css("cursor", "n-resize");
        increment_visible();
      }
  });
});
function show_all() {
  number_visible = number_of_questions;
  $(".answer").slideDown(); 
  $("#toggle_all").html("Hide all");
  $(".question").css("cursor", "n-resize");
}
function hide_all() {
  number_visible = 0;
  $(".answer").slideUp(); 
  $("#toggle_all").html("Show all");
  $(".question").css("cursor", "s-resize");
}
function increment_visible() {
  number_visible++;
  if(number_visible == number_of_questions) {
    $("#toggle_all").html("Hide all"); 
  }
}
function decrement_visible() {
  number_visible--;
  if(number_visible == 0) {
    $("#toggle_all").html("Show all"); 
  }
}
