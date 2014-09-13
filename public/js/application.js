var addBox, addGroupBox, displayCSSChunk, displayOnlyDefined, getColorLuminance, hex, hexDigits, inlineToPanel, jsonToClass, jsonToPanel, loadBox, makeActive, panelToJSON, rgb2hex, setDefaultStyle, updateClasses;

$.ui.plugin.add("draggable", "alsoDrag", {
  start: function() {
    var o, that, _store;
    console.log("alsoDrag");
    that = $(this).data("ui-draggable");
    o = that.options;
    _store = function(exp) {
      console.log(exp);
      $(exp).each(function() {
        var el;
        el = $(this);
        el.data("ui-draggable-alsoDrag", {
          top: parseInt(el.css("top"), 10),
          left: parseInt(el.css("left"), 10)
        });
      });
    };
    if (typeof o.alsoDrag === "object" && !o.alsoDrag.parentNode) {
      if (o.alsoDrag.length) {
        o.alsoDrag = o.alsoDrag[0];
        _store(o.alsoDrag);
      } else {
        $.each(o.alsoDrag, function(exp) {
          _store(exp);
        });
      }
    } else {
      _store(o.alsoDrag);
    }
  },
  drag: function() {
    var delta, o, op, os, that, _alsoDrag;
    that = $(this).data("ui-draggable");
    o = that.options;
    os = that.originalSize;
    op = that.originalPosition;
    delta = {
      top: (that.position.top - op.top) || 0,
      left: (that.position.left - op.left) || 0
    };
    _alsoDrag = function(exp, c) {
      console.log('alsoDragging');
      $(exp).each(function() {
        var css, el, start, style;
        el = $(this);
        start = $(this).data("ui-draggable-alsoDrag");
        style = {};
        css = ["top", "left"];
        $.each(css, function(i, prop) {
          var sum;
          sum = (start[prop] || 0) + (delta[prop] || 0);
          style[prop] = sum || null;
        });
        el.css(style);
      });
    };
    if (typeof o.alsoDrag === "object" && !o.alsoDrag.nodeType) {
      $.each(o.alsoDrag, function(exp, c) {
        _alsoDrag(exp, c);
      });
    } else {
      _alsoDrag(o.alsoDrag);
    }
  },
  stop: function() {
    $(this).removeData("ui-draggable-alsoDrag");
  }
});

$(document).ready(function() {
  var auth, editor, fb, groupctr;
  $(".maketooltip").tooltip();
  fb = new Firebase("https://neuralframes.firebaseio.com/");
  auth = new FirebaseSimpleLogin(fb, function(error, user) {
    var titlelist;
    if (!error && user) {
      console.log("Welcome back, " + user.email + " (" + user.id + ")");
      $(".requirelogin").show();
      $(".signin-section").hide();
      $(".signedin-section").show();
      $(".canvas-list").show();
      $(".new-canvas-title").show();
      $(".hello-msg").text("Signed in: " + user.email);
      titlelist = fb.child("userdata").child(user.id).child("frames");
      titlelist.on("value", function(snapshot) {
        var key, value, _ref;
        if (snapshot.val() !== null) {
          $(".frames-list").empty();
          _ref = snapshot.val();
          for (key in _ref) {
            value = _ref[key];
            $(".frames-list").append("<option value='" + key + "' data-key='" + key + "'>" + value.title + "</option>");
            $(".frame-title-container").hide();
          }
          return $(".frames-list").append("<option value='framenew'>New Entry</option>");
        }
      });
      if ($(".frames-list").val() === 'framenew') {
        $(".frame-title-container").show();
      } else {
        $(".frame-title-container").hide();
      }
      $(".frames-list").change(function() {
        if ($(this).val() === 'framenew') {
          return $(".frame-title-container").show();
        } else {
          return $(".frame-title-container").hide();
        }
      });
      $(".save").show();
      $(".save").click(function() {
        var div, entry, entry_id, entry_key, index, order, style, title, _i, _len, _ref;
        title = $(".frame-title").val();
        if ($(".frames-list").val() === "framenew" && (title === "" || title === void 0)) {
          return alert("no title");
        } else {
          if ($(".frames-list").val() === "framenew") {
            entry_key = fb.child("userdata").child(user.id).child("frames").push({
              title: title
            });
            entry_id = entry_key.name();
          } else {
            entry_id = $(".frames-list").val();
          }
          entry = fb.child("userdata").child(user.id).child("frames").child(entry_id);
          order = [];
          $(".workspace").find(".el").each(function() {
            return order.push($(this).data("elid"));
          });
          _ref = window.styles;
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            style = _ref[index];
            if (style !== void 0) {
              div = $("#elid-" + index);
              entry.child("elements").child(index).child("el-style").set(style);
              entry.child("elements").child(index).child("inc-class").set(div.attr("class"));
              entry.child("elements").child(index).child("inline-style").child("top").set(div.css("top"));
              entry.child("elements").child(index).child("inline-style").child("left").set(div.css("left"));
              entry.child("elements").child(index).child("text").set(div.text());
            } else {
              entry.child("elements").child(index).remove();
            }
          }
          entry.child("css").set($(".css-editor").val());
          entry.child("elidCtr").set(window.elidCtr);
          entry.child("order").set(order);
          return $(".frames-list").val(entry_id);
        }
      });
      $(".delete").click(function() {
        var title;
        return title = $(".frame-title").val();
      });
      return $(".open").click(function() {
        var entry, entry_id;
        if ($(".frames-list").val() === 'framenew') {
          $(".frame-title-container").show();
        } else {
          $(".frame-title-container").hide();
        }
        entry_id = $(".frames-list").val();
        entry = fb.child("userdata").child(user.id).child("frames").child(entry_id);
        $(".workspace").empty();
        window.styles = [];
        return entry.once("value", function(data) {
          var currClass, index, key, val, value, _i, _j, _len, _len1, _ref, _ref1, _ref2, _ref3;
          if (data.val() !== null) {
            window.elidCtr = data.val().elidCtr;
            if (data.val().order) {
              _ref = data.val().order;
              for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                index = _ref[_i];
                value = data.val().elements[index];
                window.styles[index] = {};
                _ref1 = value["el-style"];
                for (key in _ref1) {
                  val = _ref1[key];
                  window.styles[index][key] = val;
                }
                loadBox(index);
                jsonToPanel($("#elid-" + index));
                jsonToClass($("#elid-" + index));
                $("#elid-" + index).css("top", value["inline-style"].top);
                $("#elid-" + index).css("left", value["inline-style"].left);
                currClass = $("#elid-" + index).attr("class");
                $("#elid-" + index).attr("class", value["inc-class"]);
                $("#elid-" + index).find(".el-content").text(value["text"]);
              }
            } else {
              _ref2 = data.val().elements;
              for (index = _j = 0, _len1 = _ref2.length; _j < _len1; index = ++_j) {
                value = _ref2[index];
                console.log(value, index);
                if (value !== void 0) {
                  window.styles[index] = {};
                  _ref3 = value["el-style"];
                  for (key in _ref3) {
                    val = _ref3[key];
                    window.styles[index][key] = val;
                  }
                  loadBox(index);
                  jsonToPanel($("#elid-" + index));
                  jsonToClass($("#elid-" + index));
                  $("#elid-" + index).css("top", value["inline-style"].top);
                  $("#elid-" + index).css("left", value["inline-style"].left);
                  currClass = $("#elid-" + index).attr("class");
                  $("#elid-" + index).attr("class", value["inc-class"]);
                  $("#elid-" + index).find(".el-content").text(value["text"]);
                }
              }
            }
            $(".css-editor").val(data.val().css);
            $(".css-editor").keyup();
          }
          return $(".frames-list").val(entry_id);
        });
      });
    } else {
      return $(".signin-section").show();
    }
  });
  $(".login").click(function() {
    return auth.login('password', {
      email: $(".log-email").val(),
      password: $(".log-pw").val(),
      rememberMe: true
    });
  });
  $(".signup").click(function() {
    return auth.createUser($(".log-email").val(), $(".log-pw").val(), function(error, user) {
      if (!error) {
        return console.log('New User, Id: ' + user.uid + ', Email: ' + user.email);
      }
    });
  });
  $(".fwdallBox").click(function() {
    var div, lastel;
    div = $(".el-active");
    lastel = $(".workspace").find(".el").last();
    return div.insertAfter(lastel);
  });
  $(".fwdBox").click(function() {
    var div, nextdiv;
    div = $(".el-active");
    nextdiv = $(".el-active").next();
    if (nextdiv.length !== 0) {
      return div.insertAfter(nextdiv);
    }
  });
  $(".backBox").click(function() {
    var div, prevdiv;
    div = $(".el-active");
    prevdiv = $(".el-active").prev();
    if (prevdiv.length !== 0) {
      return div.insertBefore(prevdiv);
    }
  });
  $(".backallBox").click(function() {
    var div, firstel;
    div = $(".el-active");
    firstel = $(".workspace").find(".el").first();
    return div.insertBefore(firstel);
  });
  groupctr = 0;
  $(".groupBox").click(function() {
    console.log("dummy group");
    $(".el-active").each(function() {
      if ($(this).data("ingroup")) {
        return $(this).removeClass($(this).data("ingroup"));
      }
    });
    $(".el-active").attr("data-ingroup", "group-" + groupctr);
    $(".el-active").addClass("group-" + groupctr);
    $(".el-active").draggable("option", "alsoDrag", ".group-" + groupctr);
    $(".el-active").draggable("option", "alsoResize", ".group-" + groupctr);
    return groupctr++;
  });
  $(".ungroupBox").click(function() {
    return $(".el-active").each(function() {
      $(this).removeClass($(this).data("ingroup"));
      $(this).removeAttr("data-ingroup");
      return $(this).removeClass("el-active");
    });
  });
  $(".deleteBox").click(function() {
    var elid;
    if ($(".el-active").length !== 0) {
      elid = $(".el-active").data("elid");
      styles[elid] = void 0;
      return $(".el-active").remove();
    }
  });
  editor = new Behave({
    textarea: document.getElementById('css-editor'),
    replaceTab: true,
    softTabs: true,
    tabSize: 2,
    autoOpen: true,
    overwrite: true,
    autoStrip: true,
    autoIndent: true
  });
  $(".input-color").minicolors({
    position: 'top right'
  });
  $(document).on("dblclick", ".el", function() {
    console.log("doubleclick");
    return $(this).find(".el-content").attr("contentEditable", true).focus();
  });
  $(".css-includes").keyup(function() {
    return $(".el-active").attr("class", "el el-box el-active").addClass($(this).val());
  });
  $(".css-editor").keyup(function() {
    $("#userstyle").empty();
    return $("#userstyle").append($(this).val());
  });
  $(".elidstyle").keyup(function() {
    panelToJSON($(".el-active"));
    return jsonToClass($(".el-active"));
  });
  $(".elidstyle").change(function() {
    panelToJSON($(".el-active"));
    return jsonToClass($(".el-active"));
  });
  $(".set-gradient").bind("keyup change", function() {
    var code, darkerhex, hex;
    hex = $(".set-bk-color").val();
    darkerhex = getColorLuminance(hex, -$(this).val());
    code = "background-image: -o-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -moz-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -ms-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: linear-gradient(-180deg, " + hex + " 0%, " + darkerhex + " 100%);";
    return $(".set-gradient-code").val(code);
  });
  $(".set-shadow").bind("keyup change", function(e) {
    var b, c, code, innershadowcode, outershadowcode, s, x, y;
    x = $(".set-outershadow-x").val();
    y = $(".set-outershadow-y").val();
    b = $(".set-outershadow-b").val();
    s = $(".set-outershadow-s").val();
    c = $(".set-outershadow-c").val();
    if ($(".set-outershadow-c").val() !== "") {
      outershadowcode = "" + x + "px " + y + "px " + b + "px " + s + "px " + c;
    }
    x = $(".set-innershadow-x").val();
    y = $(".set-innershadow-y").val();
    b = $(".set-innershadow-b").val();
    s = $(".set-innershadow-s").val();
    c = $(".set-innershadow-c").val();
    if ($(".set-innershadow-c").val() !== "") {
      innershadowcode = "inset " + x + "px " + y + "px " + b + "px " + s + "px " + c;
    }
    if (outershadowcode !== void 0 && innershadowcode === void 0) {
      code = "-moz-box-shadow: " + outershadowcode + "; \nbox-shadow: " + outershadowcode + ";";
    } else if (outershadowcode === void 0 && innershadowcode !== void 0) {
      code = "-moz-box-shadow: " + innershadowcode + "; \nbox-shadow: " + innershadowcode + ";";
    } else if (outershadowcode !== void 0 && innershadowcode !== void 0) {
      code = "-moz-box-shadow: " + outershadowcode + ", " + innershadowcode + "; \nbox-shadow: " + outershadowcode + ", " + innershadowcode + ";";
    } else {
      code = "";
    }
    return $(".set-shadow-code").val(code);
  });
  $(".updatePageDim").click(function() {
    var h, pageDiv, w;
    if ($(".page").length === 0) {
      pageDiv = $("<div class='page'></div>");
      pageDiv.draggable({});
      pageDiv.resizable();
    } else {
      pageDiv = $(".page");
    }
    w = $(".pageWidth").val();
    h = $(".pageHeight").val();
    return $(".workspace").css("background", "#FFFFFF").css("width", w);
  });
  $(".dupBox").click(function() {
    var child_eid, key, parent_classes, parent_eid, value, _ref;
    if ($(".el-active").length !== 0) {
      parent_eid = $(".el-active").data("elid");
      parent_classes = $(".el-active").attr("class");
      $(".addBox").click();
      child_eid = $(".el-active").data("elid");
      $(".el-active").attr("class", parent_classes);
      window.styles[child_eid] = {};
      _ref = styles[parent_eid];
      for (key in _ref) {
        value = _ref[key];
        window.styles[child_eid][key] = window.styles[parent_eid][key];
      }
      jsonToPanel($(".el-active"));
      return jsonToClass($(".el-active"));
    }
  });
  $(".workspace").click(function(e) {
    if ($(e.target).hasClass("workspace")) {
      return $(".el-active").removeClass("el-active");
    }
  });
  window.elidCtr = 0;
  $(".addBox").click(function() {
    addBox(elidCtr);
    return elidCtr++;
  });
  $(".createclass").click(function() {
    var css, currcss, elid;
    elid = $(".el-active").data("elid");
    css = $("#style-" + elid).html();
    css = css.replace("#elid-" + elid, ".newstyle");
    currcss = $(".css-editor").val();
    return $(".css-editor").val(css + "\n" + currcss);
  });
  return $(".resetcss").click(function() {
    return setDefaultStyle(function() {
      panelToJSON($(".el-active"));
      return jsonToClass($(".el-active"));
    });
  });
});

loadBox = function(elid) {
  var boxDiv;
  console.log("loadBox");
  boxDiv = $("<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>");
  boxDiv.append($("<div class='el-content'></div>"));
  boxDiv.draggable({
    grid: [5, 5],
    alsoDrag: ".el-active",
    start: function() {
      return updateClasses($(this));
    },
    stop: function() {
      return inlineToPanel(boxDiv);
    }
  });
  boxDiv.resizable({
    grid: [5, 5],
    alsoResize: ".el-active",
    stop: function() {
      if (boxDiv.attr("ingroup")) {
        $("." + boxDiv.attr("ingroup")).each(function() {
          inlineToPanel($(this));
          panelToJSON($(this));
          return jsonToClass($(this));
        });
      }
      return $(".el-active").each(function() {
        inlineToPanel($(this));
        panelToJSON($(this));
        return jsonToClass($(this));
      });
    }
  });
  boxDiv.click(function(e) {
    if (e.shiftKey) {
      makeActive($(this), false);
    } else {
      makeActive($(this), true);
    }
    updateClasses($(this));
    return inlineToPanel($(this));
  });
  return $(".workspace").append(boxDiv);
};

addGroupBox = function(elid) {
  var boxDiv;
  boxDiv = $("<div class='el el-group' id='elid-" + elid + "' data-elid='" + elid + "'></div>");
  boxDiv.append($("<div class='el-content'></div>"));
  boxDiv.draggable({
    grid: [5, 5],
    start: function() {
      makeActive($(this));
      return updateClasses($(this));
    },
    stop: function() {
      return inlineToPanel(boxDiv);
    }
  });
  boxDiv.resizable({
    grid: [5, 5],
    stop: function() {
      inlineToPanel(boxDiv);
      panelToJSON(boxDiv);
      return jsonToClass(boxDiv);
    }
  });
  boxDiv.click(function(e) {
    if (e.shiftKey) {
      makeActive($(this), false);
    } else {
      makeActive($(this), true);
    }
    updateClasses($(this));
    return inlineToPanel($(this));
  });
  return $(".workspace").append(boxDiv);
};

addBox = function(elid) {
  return setDefaultStyle(function() {
    var boxDiv;
    boxDiv = $("<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>");
    boxDiv.append($("<div class='el-content'></div>"));
    boxDiv.addClass("defaultbox");
    boxDiv.draggable({
      grid: [5, 5],
      alsoDrag: ".el-active",
      start: function() {
        return updateClasses($(this));
      },
      stop: function() {
        return inlineToPanel(boxDiv);
      }
    });
    boxDiv.resizable({
      grid: [5, 5],
      alsoResize: ".el-active",
      stop: function() {
        if (boxDiv.attr("ingroup")) {
          $("." + boxDiv.attr("ingroup")).each(function() {
            inlineToPanel($(this));
            panelToJSON($(this));
            return jsonToClass($(this));
          });
        }
        return $(".el-active").each(function() {
          inlineToPanel($(this));
          panelToJSON($(this));
          return jsonToClass($(this));
        });
      }
    });
    makeActive(boxDiv);
    updateClasses(boxDiv);
    boxDiv.click(function(e) {
      if (e.shiftKey) {
        makeActive($(this), false);
      } else {
        makeActive($(this), true);
      }
      updateClasses($(this));
      return inlineToPanel($(this));
    });
    $(".workspace").append(boxDiv);
    $(".set-size-w").val("200px");
    $(".set-size-h").val("50px");
    panelToJSON(boxDiv);
    return jsonToClass(boxDiv);
  });
};

setDefaultStyle = function(callback) {
  $(".elidstyle").val("");
  $(".set-pos-top").val("20px");
  $(".set-pos-left").val("20px");
  $(".set-outershadow-x").val("1");
  $(".set-outershadow-y").val("1");
  $(".set-outershadow-b").val("3");
  $(".set-outershadow-s").val("0");
  $(".set-innershadow-x").val("0");
  $(".set-innershadow-y").val("0");
  $(".set-innershadow-b").val("3");
  $(".set-innershadow-s").val("0");
  return callback();
};

window.styles = [];

panelToJSON = function(div) {
  var elid;
  console.log("panelToJSON");
  elid = div.data("elid");
  if (window.styles[elid] === void 0) {
    window.styles[elid] = {};
  }
  window.styles[elid].width = $(".set-size-w").val();
  window.styles[elid].height = $(".set-size-h").val();
  window.styles[elid].textalign = $(".set-text-align").val();
  window.styles[elid].fontfamily = $(".set-font-family").val();
  window.styles[elid].fontweight = $(".set-font-weight").val();
  window.styles[elid].fontsize = $(".set-font-size").val();
  window.styles[elid].lineheight = $(".set-line-height").val();
  window.styles[elid].color = $(".set-color").val();
  window.styles[elid].borderradius = $(".set-border-radius").val();
  window.styles[elid].border = $(".set-border").val();
  window.styles[elid].bordercolor = $(".set-border-color").val();
  window.styles[elid].margin = $(".set-margin").val();
  window.styles[elid].padding = $(".set-padding").val();
  window.styles[elid].opacity = $(".set-opacity").val();
  window.styles[elid].backgroundcolor = $(".set-bk-color").val();
  window.styles[elid].gradientcode = $(".set-gradient-code").val();
  return window.styles[elid].shadowcode = $(".set-shadow-code").val();
};

displayOnlyDefined = function(text) {
  if (text === void 0) {
    return "";
  } else {
    return text;
  }
};

jsonToPanel = function(div) {
  var elid;
  elid = div.data("elid");
  $(".set-size-w").val(displayOnlyDefined(window.styles[elid].width));
  $(".set-size-h").val(displayOnlyDefined(window.styles[elid].height));
  $(".set-text-align").val(displayOnlyDefined(window.styles[elid].textalign));
  $(".set-font-family").val(displayOnlyDefined(window.styles[elid].fontfamily));
  $(".set-font-weight").val(displayOnlyDefined(window.styles[elid].fontweight));
  $(".set-font-size").val(displayOnlyDefined(window.styles[elid].fontsize));
  $(".set-line-height").val(displayOnlyDefined(window.styles[elid].lineheight));
  $(".set-color").val(displayOnlyDefined(window.styles[elid].color));
  $(".set-border-radius").val(displayOnlyDefined(window.styles[elid].borderradius));
  $(".set-border").val(displayOnlyDefined(window.styles[elid].border));
  $(".set-border-color").val(displayOnlyDefined(window.styles[elid].bordercolor));
  $(".set-margin").val(displayOnlyDefined(window.styles[elid].margin));
  $(".set-padding").val(displayOnlyDefined(window.styles[elid].padding));
  $(".set-opacity").val(displayOnlyDefined(window.styles[elid].opacity));
  $(".set-bk-color").val(displayOnlyDefined(window.styles[elid].backgroundcolor));
  $(".set-gradient-code").val(displayOnlyDefined(window.styles[elid].gradientcode));
  return $(".set-shadow-code").val(displayOnlyDefined(window.styles[elid].shadowcode));
};

displayCSSChunk = function(label, css) {
  if (css === void 0 || css === "") {
    return "";
  } else {
    if (label === void 0 || label === "") {
      return css + "\n";
    } else {
      return ("  " + label + ": ") + css + "; \n";
    }
  }
};

jsonToClass = function(div) {
  var code, elid, stylewrapper;
  elid = div.data("elid");
  if ($("#style-" + elid).length === 0) {
    stylewrapper = $("<style id='style-" + elid + "'></style>");
    $("head").append(stylewrapper);
  }
  code = ("#elid-" + elid + " {\n") + displayCSSChunk("width", window.styles[elid].width) + displayCSSChunk("height", window.styles[elid].height) + displayCSSChunk("top", window.styles[elid].top) + displayCSSChunk("left", window.styles[elid].left) + displayCSSChunk("font-family", window.styles[elid].fontfamily) + displayCSSChunk("font-size", window.styles[elid].fontsize) + displayCSSChunk("line-height", window.styles[elid].lineheight) + displayCSSChunk("font-weight", window.styles[elid].fontweight) + displayCSSChunk("text-align", window.styles[elid].textalign) + displayCSSChunk("color", window.styles[elid].color) + displayCSSChunk("border-radius", window.styles[elid].borderradius) + displayCSSChunk("border", window.styles[elid].border) + displayCSSChunk("border-color", window.styles[elid].bordercolor) + displayCSSChunk("margin", window.styles[elid].margin) + displayCSSChunk("padding", window.styles[elid].padding) + displayCSSChunk("opacity", window.styles[elid].opacity) + displayCSSChunk("background-color", window.styles[elid].backgroundcolor) + displayCSSChunk(false, window.styles[elid].gradientcode) + displayCSSChunk(false, window.styles[elid].shadowcode) + "}";
  return $("#style-" + elid).html(code);
};

inlineToPanel = function(div) {
  var h, l, t, w;
  w = div.css("width");
  h = div.css("height");
  t = div.css("top");
  l = div.css("left");
  $(".set-size-w").val(w);
  $(".set-size-h").val(h);
  $(".set-pos-top").val(t);
  $(".set-pos-left").val(l);
  return div.attr("style", "top: " + t + "; left: " + l);
};

makeActive = function(div, exclusive) {
  if (exclusive === void 0 || exclusive === true) {
    $(".el-active").removeClass("el-active");
  }
  div.addClass("el-active");
  if (div.data("ingroup")) {
    $("." + div.data("ingroup")).addClass("el-active");
  }
  if (window.styles[div.data("elid")] !== void 0) {
    jsonToPanel(div);
    return jsonToClass(div);
  } else {
    panelToJSON(div);
    return jsonToClass(div);
  }
};

updateClasses = function(div) {
  var c, classes, classesString, ignoreClass, _i, _len;
  classes = div.attr("class").split(" ");
  classesString = "";
  ignoreClass = ["el", "el-box", "el-active", "ui-draggable", "ui-draggable-dragging", "ui-resizable"];
  for (_i = 0, _len = classes.length; _i < _len; _i++) {
    c = classes[_i];
    if (ignoreClass.indexOf(c) <= -1) {
      classesString += c + " ";
    }
  }
  return $(".css-includes").val(classesString);
};

getColorLuminance = function(hex, lum) {
  var c, i, rgb;
  hex = String(hex).replace(/[^0-9a-f]/gi, '');
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  lum = lum || 0;
  rgb = "#";
  c = 0;
  i = 0;
  while (i < 3) {
    c = parseInt(hex.substr(i * 2, 2), 16);
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
    rgb += ("00" + c).substr(c.length);
    i++;
  }
  return rgb;
};

rgb2hex = function(rgb) {
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
};

hex = function(x) {
  if (isNaN(x)) {
    return "00";
  } else {
    return hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
  }
};

hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f");
