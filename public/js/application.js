var getColorLuminance, makeActive, moveInlineStyle, updateClasses, updateStyle;

$(document).ready(function() {
  var editor, elid;
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
  $(".input-color").minicolors();
  $(".css-includes").keyup(function() {
    return $(".el-active").attr("class", "el el-box el-active").addClass($(this).val());
  });
  $(".css-editor").keyup(function() {
    $("#userstyle").empty();
    return $("#userstyle").append($(this).val());
  });
  $(".elidstyle").keyup(function() {
    return updateStyle($(".el-active"));
  });
  $(".helper-gradient").keyup(function() {
    var code, darkerhex, hex;
    hex = $(".helper-colorhex").val();
    darkerhex = getColorLuminance(hex, -$(this).val());
    console.log(darkerhex);
    code = "background-image: -o-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -moz-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -ms-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: linear-gradient(-180deg, " + hex + " 0%, " + darkerhex + " 100%);";
    return $(".helper-gradient-code").html(code);
  });
  $(".updatePageDim").click(function() {
    var h, pageDiv, w;
    if ($(".page").length === 0) {
      pageDiv = $("<div class='page'></div>");
      pageDiv.draggable({
        snap: true
      });
      pageDiv.resizable();
    } else {
      pageDiv = $(".page");
    }
    w = $(".pageWidth").val();
    h = $(".pageHeight").val();
    return $(".workspace").css("background", "#FFFFFF").css("width", w + "px").css("height", h + "px");
  });
  elid = 0;
  return $(".addBox").click(function() {
    var boxDiv;
    boxDiv = $("<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>");
    boxDiv.addClass("defaultbox");
    boxDiv.draggable({
      snap: true,
      start: function() {
        makeActive($(this));
        return updateClasses($(this));
      },
      stop: function() {
        return moveInlineStyle(boxDiv);
      }
    });
    boxDiv.resizable({
      stop: function() {
        return moveInlineStyle(boxDiv);
      }
    });
    makeActive(boxDiv);
    updateClasses(boxDiv);
    boxDiv.click(function() {
      makeActive($(this));
      return updateClasses($(this));
    });
    $(".workspace").append(boxDiv);
    return elid++;
  });
});

updateStyle = function(div) {
  var css, elid, height, left, stylewrapper, top, width;
  width = $(".set-size-w").val();
  height = $(".set-size-h").val();
  top = $(".set-pos-top").val();
  left = $(".set-pos-left").val();
  elid = div.data("elid");
  if ($("#style-" + elid).length === 0) {
    stylewrapper = $("<style id='style-" + elid + "'></style>");
    $("head").append(stylewrapper);
  }
  css = "#elid-" + elid + " {" + "width: " + width + ";" + "height: " + height + ";" + "top: " + top + ";" + "left: " + left + ";" + "}";
  return $("#style-" + elid).html(css);
};

moveInlineStyle = function(div) {
  var h, l, t, w;
  w = div.css("width");
  h = div.css("height");
  t = div.css("top");
  l = div.css("left");
  $(".set-size-w").val(w);
  $(".set-size-h").val(h);
  $(".set-pos-top").val(t);
  $(".set-pos-left").val(l);
  div.attr("style", "");
  return updateStyle(div);
};

makeActive = function(div) {
  $(".el-active").removeClass("el-active");
  return div.addClass("el-active");
};

updateClasses = function(div) {
  var c, classes, classesString, ignoreClass, _i, _len;
  classes = div.attr("class").split(" ");
  classesString = "";
  ignoreClass = ["el", "el-box", "el-active", "defaultbox", "ui-draggable", "ui-draggable-dragging", "ui-resizable"];
  for (_i = 0, _len = classes.length; _i < _len; _i++) {
    c = classes[_i];
    if (ignoreClass.indexOf(c) <= -1) {
      classesString = c + " ";
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
