
// Generate random integer
function randomInt(min, max) {
  return Math.floor(Math.random()*(max-min+1))+min;
}

// Elements
var problem = $("#problem");
var generator_menu = $("#generators");

// Generator strings
generators = {
  "Arithmetic sequence" : function() {
    var a = [ randomInt(-5, 10) ];
    var d = randomInt(1,5);
    for (i = 0; i < 4; ++i) { a.push(a[0]+(i+1)*d); }
    var s = "\\[\\{ " + a.join(",") + ",...\\}\\]";
    return s;
  },
  "Geometric sequence" : function() {
    var a = [0];
    while (a[0] == 0) { a[0] = randomInt(-5, 10); }
    var r = randomInt(2,10);
    for (i = 1; i < 5; ++i) { a.push(a[0]*Math.pow(r, i)); }
    var s = "\\[\\{ " + a.join(",") + ",...\\}\\]";
    return s;
  },
  "Geometric series" : function() {
    var s = "\\[\\sum_{n=1}^\\infty %a(%r)^n\\]";
    var symbols = [];
    s.replace(/\%\w/g,
      match => {
        if (symbols.indexOf(match) == -1) symbols.push(match)});
    for (i in symbols) {
      var value = randomInt(1, 10);
      s = s.replace(RegExp(symbols[i], 'g'), value);
    }
    return s;
  }
}

// Populate generator menu
$.each(generators, function(key, value) {
  generator_menu.append(
    $("<option></option>").html(key)
  );
});

// Set default generator (or from browser cookie)
generator_menu.val($.jStorage.get("generator", generator_menu.val()));

// Render a new problem
function renderNewProblem() {
  problem.fadeOut(300, function() {
    problem.html(generators[generator_menu.val()]());
    MathJax.Hub.Queue(["Typeset", MathJax.Hub], function() {
      problem.fadeIn(300);
    });
  });
}

// On document load
$(function() {
  renderNewProblem();
});

// On generator menu selectionchange
$("#generators").change(function(event) {
  $.jStorage.set("generator", generator_menu.val());
  renderNewProblem();
});

// On click problem
$("#problem").on("click", function(e) {
  renderNewProblem();
});

// On space pressed
$("body").keyup(function(e) {
  if (e.keyCode == 32) { // space
    renderNewProblem();
  }
});
