function autocomplete(editor, show) {  // Minimal event-handling wrapper.
  editor.setOption('onKeyEvent', function(i, e) {
    // Hook into ctrl-space
    //if (e.keyCode == 32 && (e.ctrlKey || e.metaKey) && !e.altKey) {
    if (e.keyCode === 9) {
      e.stop();
      return startComplete();
    }
  });
 
  function stopEvent() {
    if (this.preventDefault) {this.preventDefault(); this.stopPropagation();}
    else {this.returnValue = false; this.cancelBubble = true;}
  }
  function addStop(event) {
    if (!event.stop) event.stop = stopEvent;
    return event;
  }
  function connect(node, type, handler) {
    function wrapHandler(event) {handler(addStop(event || window.event));}
    if (typeof node.addEventListener == "function")
      node.addEventListener(type, wrapHandler, false);
    else
      node.attachEvent("on" + type, wrapHandler);
  }

  function forEach(arr, f) {
    for (var i = 0, e = arr.length; i < e; ++i) f(arr[i]);
  }

  function startComplete() {
    // We want a single cursor position.
    if (editor.somethingSelected()) return;
    // Find the token at the cursor
    var cur = editor.getCursor(false);
    var token = editor.getTokenAt(cur); 
    var tprop = token;

    // If it's not a 'word-style' token, ignore the token.
    if (!/^[\w$_]*$/.test(token.string)) {
      //token.string = token.string.replace(/^./, '');
      //token.start += 1;
      token = tprop = {start: cur.ch, end: cur.ch, string: "", state: token.state,
                       className: token.string == "." ? "property" : null};
    }
    // If it is a property, find out what it is a property of.
    while (tprop.className == "property") {
      tprop = editor.getTokenAt({line: cur.line, ch: tprop.start});
      if (tprop.string != ".") return;
      tprop = editor.getTokenAt({line: cur.line, ch: tprop.start});
      if (!context) { var context = []; }
      context.push(tprop);
    }
    var completions = getCompletions(token, context);
    if (!completions.length) return;
    function insert(str) {
      editor.replaceRange(str, {line: cur.line, ch: token.start}, {line: cur.line, ch: token.end});
    }
    // When there is only one completion, use it directly.
    if (completions.length == 1) {insert(completions[0]); return true;}

    // Build the select widget
    var complete = document.createElement("div");
    complete.className = "completions";
    var sel = complete.appendChild(document.createElement("select"));
    // Opera doesn't move the selection when pressing up/down in a
    // multi-select, but it does properly support the size property on
    // single-selects, so no multi-select is necessary.
    if (!window.opera) { sel.multiple = true; }
    for (var i = 0; i < completions.length; ++i) {
      var opt = sel.appendChild(document.createElement("option"));
      opt.appendChild(document.createTextNode(completions[i]));
    }
    sel.firstChild.selected = true;
    sel.size = Math.min(10, completions.length);
    var pos = editor.cursorCoords();
    complete.style.left = pos.x + "px";
    complete.style.top = pos.yBot + "px";
    document.body.appendChild(complete);
    // Hack to hide the scrollbar.
    if (completions.length <= 10) {
      complete.style.width = (sel.clientWidth - 1) + "px";
    }

    var done = false;
    function close() {
      if (done) return;
      done = true;
      complete.parentNode.removeChild(complete);
    }
    function pick() {
      insert(sel.options[sel.selectedIndex].text);
      close();
      setTimeout(function(){editor.focus();}, 50);
    }
    connect(sel, "blur", close);
    connect(sel, "keydown", function(event) {
      var code = event.keyCode;
      // Enter and space
      if (code == 13 || code == 32) { event.stop(); pick();}
      // Escape
      else if (code == 27) { event.stop(); close(); editor.focus();}
      else if (code != 38 && code != 40) { close(); editor.focus(); setTimeout(startComplete, 50);}
    });
    connect(sel, "dblclick", pick);

    sel.focus();
    // Opera sometimes ignores focusing a freshly created node
    if (window.opera) { setTimeout(function(){if (!done) sel.focus();}, 100); }
    return true;
  }

  var stringProps = ("charAt charCodeAt indexOf lastIndexOf substring substr slice trim trimLeft trimRight " +
                     "toUpperCase toLowerCase split concat match replace search").split(" ");
  var arrayProps = ("length concat join splice push pop shift unshift slice reverse sort indexOf " +
                    "lastIndexOf every some filter forEach map reduce reduceRight ").split(" ");
  var funcProps = "prototype apply call bind".split(" ");
  var keywords = ("break case catch continue debugger default delete do else false finally for function " +
                  "if in instanceof new null return switch throw true try typeof var void while with").split(" ");

  function getCompletions(token, context) {
    var found = [];
    var start = token.string.replace(/"|'/g, '');
    function maybeAdd(str) {
      if (str.indexOf(start) == 0) found.push(str);
    }
    // If not, just look in the window object and any local scope
    // (reading into JS mode internals to get at the local variables)
    //for (var v = token.state.localVars; v; v = v.next) maybeAdd(v.name);
    var regex = /\s+|\{|\}|\(|\)|"|\/|:|;|>|<|=|\]|\[|\.|\+|\-|,|\*|\'|\%/;
    var base = editor.getValue() + " " + show.scripts;
    var words = _.uniq(base.split(regex).filter(function(x) { return x.length > 1 }).sort());
    var i_self = words.indexOf(token.string);
    if(i_self !== -1) {
      words.splice(i_self, 1);
    }
    // Remove current string
    for (var i = 0; i < words.length; i++) maybeAdd(words[i]);
    return found;
  }
}
