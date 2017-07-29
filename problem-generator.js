
// Generate random integer
function randomInt(min, max) {
  return Math.floor(Math.random()*(max-min+1))+min;
}

// Elements
var problem = $("#problem");
var generator_menu = $("#generators");

// Generator strings
generators = {
  "Arithmetic sequence": `
  \\[\\{%{a0},%{a1},%{a2},%{a3},%{a4},...\\}\\]%{a:arithmetic}`,
  "Geometric sequence": `
  \\[\\{%{a0},%{a1},%{a2},%{a3},%{a4},...\\}\\]%{a:geometric}`,
  "Geometric series": `
  \\[\\sum_{n=1}^\\infty %{a}(%{r})^n\\]`,
  "Sequence: A": `Determine convergence/divergence
  \\[1+\\frac{1}{\\sqrt[3]{%{a0}}}+
    \\frac{1}{\\sqrt[3]{%{a1}}}+
    \\frac{1}{\\sqrt[3]{%{a2}}}+
    \\frac{1}{\\sqrt[3]{%{a3}}}+...\\]%{a:powers}`,
  "Societal problems: 1": `White men outside of prison?`
}

// Populate generator menu
$.each(generators, function(key, value) {
  generator_menu.append(
    $("<option></option>").html(key)
  );
});

// Set default generator and URL hash from default/hash/browser cookie
console.debug("original hash: ", window.location.hash);
var hash = window.location.hash.substring(1, window.location.hash.length).replace("%20"," ");
console.debug("replace?: ", window.location.hash.replace("%20", " "));
generator_menu.val(hash || $.jStorage.get("generator", generator_menu.val()));
window.location.hash = hash || generator_menu.val();
console.debug("hash: ", hash);

// The meat; the problem generator
function generateProblem(str) {
  // TODO: Implement custom number generators contained within a table
  // e.g. num_gen["arithmetic"]
  //      num_gen["geom"]
  // And each with custom arguments such as alternating, fractions, etc.
  //
  // Utilization will entail replacing the switch statement for handling symbol
  // behavior, initial value generation for single symbols and array.
  //
  var symbols = {};
  // Compile symbol table
  str.replace(/%{((\w)(\d*))}/g, function(f, m, s, i) {
    // f : fully matched token
    // m : symbol and index
    // s : just the symbol (e.g. the a of "a", the b of "b3")
    // i : just the index (e.g. the 1 of "a1", the 0 of "b0")
    if (symbols[s] == undefined) {
      // New symbol
      if (i) symbols[s] = [ randomInt(1,10) ];
      else symbols[s] = randomInt(1,10);
    } else {
      // Existing symbol
      if (i) {
        if (typeof(symbols[s]) != "object") {
          throw('ProbGen error: symbol "' + m + '" previously specified as number');
        } else if (symbols[s].length > i) {
          throw('ProbGen error: index "' + i + '" greater than "' + s + '" length (' + symbols[s].length + ')');
        }
        ++symbols[s].length;
      } else if (typeof(symbols[s]) != "number") {
        throw('ProbGen error: symbol "' + m + '" previously specified as array');
      }
    }
  });
  // Handle symbol behavior
  str.replace(/%{(\w):\w*}/g, function(_, s) {
    if (symbols[s] == undefined)
      throw('ProbGen error: generator rule defined for non-existant symbol "'+s+'"');
  });
  for (s in symbols) {
    if (typeof(symbols[s]) == "object") {
      var e = RegExp("%{"+s+":(\\w+)}");
      var m = str.match(RegExp(e, "g"));
      if ((m && m.length) != 1) {
        throw('ProbGen error: expected 1 generator rule for symbol "'+s+'" but got '+ ((m && m.length) || 0));
      }
      var g = str.match(e)[1];
      switch (g) {
        case "arithmetic":
          var a = randomInt(-10, 10);
          var d = randomInt(1, 10);
          for (i = 0; i < symbols[s].length; ++i) {
            symbols[s][i] = a+d*i;
          }
          break;
        case "geometric":
          var a = randomInt(-10, 10);
          var r = randomInt(1, 10);
          for (i = 0; i < symbols[s].length; ++i) {
            symbols[s][i] = a*Math.pow(r,i);
          }
          break;
        case "powers":
          var a = randomInt(1,5);
          for (i = 0; i < symbols[s].length; ++i) {
            symbols[s][i] = Math.pow(i+2,a);
          }
          break;
        default:
          throw('ProbGen error: unrecognized generator "'+g+'"');
          break;
      }
    }
    str = str.replace(e, "");
  }
  // Generate LaTeX string
  for (k in symbols) {
    if (typeof(symbols[k]) == "number") {
      var e = RegExp("%{"+k+"}", "g");
      str = str.replace(e, symbols[k]);
    } else {
      for (i = 0; i < symbols[k].length; ++i) {
        var e = RegExp("%{"+k+i+"}", "g");
        str = str.replace(e, symbols[k][i]);
      }
    }
  }
  return str;
}

// Render a new problem
function renderNewProblem() {
  problem.fadeOut(300, function() {
    console.debug(generator_menu.val())
    console.debug(generators[generator_menu.val()])
    problem.html(generateProblem(generators[generator_menu.val()]));
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
  window.location.hash = generator_menu.val();
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
