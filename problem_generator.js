// -----------------------------------------------------------------------------
// API

// Generate random integer
function randomInt(min, max) {
  return Math.floor(Math.random()*(max-min+1))+min;
}

// Generate random problem from generator string
function generateProblem(str) {
  var symbols = [];
  str.replace(/\%\w/g,
    match => {
      if (symbols.indexOf(match) == -1) symbols.push(match)});
  for (i in symbols) {
    var value = randomInt(1, 10);
    str = str.replace(RegExp(symbols[i], 'g'), value);
  }
  return str;
}

// -----------------------------------------------------------------------------

$(function() {
  // Elements
  var problem = $("#problem");
  var generator_menu = $("#generators");

  // Generator strings
  generators = {
    "Geometric sequence" : "it's nothing!",
    "Geometric series"   : "\\[\\sum_{n=1}^\\infty %a(%r)^n\\]"
  }

  // Populate generator menu
  $.each(generators, function(key, value) {
    generator_menu.append(
      $("<option></option>").val(value).html(key)
    );
  });

  generator_menu.val($.jStorage.get("generator") || "");

  // Generator string
  var generator = $.jStorage.get("generator") || generator_menu.val();

  // Render a new problem
  function renderNewProblem() {
    problem.fadeOut(300, function() {
      problem.html(generateProblem(generator))
      MathJax.Hub.Queue(["Typeset", MathJax.Hub], function() {
        problem.fadeIn(300);
      });
    });
  }

  // Render default
  renderNewProblem();

  $("#generators").change(function(event) {
    generator = $(this).val();
    $.jStorage.set("generator", generator);
    renderNewProblem();
  });

  // On click problem/space pressed
  $("#problem").on("click", function(e) {
    renderNewProblem();
  });
  $("body").keyup(function(e) {
    if (e.keyCode == 32) { // space
      renderNewProblem();
    }
  });
});
