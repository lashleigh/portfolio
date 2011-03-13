var number_of_questions;
var number_visible;
$(function() {
  number_of_questions = $(".question").length;
  number_visible = $(".answer:visible").length;

  $("code").addClass("prettyprint");
  prettyPrint();

  $("#arrow").bind("click", function() {
    if($(this).hasClass("arrow_up")) {
      show_all();
    } else if($(this).hasClass("arrow_down") ) {
      hide_all();
    }
  });
 
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
        answer.slideUp();
        question.css("cursor", "s-resize");
        decrement_visible();
      } else {
        answer.slideDown();
        question.css("cursor", "n-resize");
        increment_visible();
      }
  });
});
function show_all() {
  number_visible = number_of_questions;
  clear_style();
  $(".answer").slideDown(); 
  $("#toggle_all").html("Hide all");
  $("#arrow").removeClass("arrow_up").addClass("arrow_down")
  $(".question").css("cursor", "n-resize");
}
function hide_all() {
  clear_style();
  number_visible = 0;
  $(".answer").slideUp(); 
  $("#toggle_all").html("Show all");
  $("#arrow").removeClass("arrow_down").addClass("arrow_up")
  $(".question").css("cursor", "s-resize");
}
function increment_visible() {
  number_visible++;
  rotate(180*number_visible/number_of_questions);
  if(number_visible == number_of_questions) {
    $("#toggle_all").html("Hide all"); 
    $("#arrow").removeClass("arrow_up").addClass("arrow_down");
  }
}
function decrement_visible() {
  number_visible--;
  rotate(180*number_visible/number_of_questions);
  if(number_visible == 0) {
    $("#toggle_all").html("Show all"); 
    $("#arrow").removeClass("arrow_down").addClass("arrow_up")
  }
}
function rotate(deg) {
  $("#arrow").css({"-moz-transform": "rotate("+deg+"deg)",
                    "-webkit-transform": "rotate("+deg+"deg)",
                    "-o-transform": "rotate("+deg+"deg)"});
}
function clear_style() {
  $("#arrow").css({"-moz-transform": "",
                    "-webkit-transform": "",
                    "-o-transform": ""});
}
