var displayCSSChunk, getColorLuminance, hex, hexDigits, makeActive, moveInlineStyle, rgb2hex, setDefaultStyle, updateClasses, updateStyle;

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
  $(".input-color").minicolors({
    position: 'bottom right'
  });
  $(document).on("dblclick", ".el", function() {
    $(this).find(".el-content").attr("contentEditable", true).focus();
    return console.log("hi");
  });
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
  $(".elidstyle").change(function() {
    return updateStyle($(".el-active"));
  });
  $(".set-gradient").keyup(function() {
    var code, darkerhex, hex;
    hex = $(".set-bk-color").val();
    darkerhex = getColorLuminance(hex, -$(this).val());
    code = "background-image: -o-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -moz-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: -ms-linear-gradient(-90deg, " + hex + " 0%, " + darkerhex + " 100%);\nbackground-image: linear-gradient(-180deg, " + hex + " 0%, " + darkerhex + " 100%);";
    return $(".set-gradient-code").html(code);
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
    return $(".set-shadow-code").html(code);
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
  $(".addBox").click(function() {
    var boxDiv;
    setDefaultStyle();
    boxDiv = $("<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>");
    boxDiv.append($("<div class='el-content'></div>"));
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
    updateStyle(boxDiv);
    $(".workspace").append(boxDiv);
    return elid++;
  });
  return $(".createclass").click(function() {
    var css, currcss;
    elid = $(".el-active").data("elid");
    css = $("#style-" + elid).html();
    css = css.replace("#elid-" + elid, ".newstyle");
    currcss = $(".css-editor").text();
    return $(".css-editor").text(css + "\n" + currcss);
  });
});

setDefaultStyle = function() {
  $(".set-pos-top").val("20px");
  return $(".set-pos-left").val("20px");
};

displayCSSChunk = function(css) {
  if (css === void 0) {
    return "";
  } else {
    return "  " + css;
  }
};

updateStyle = function(div) {
  var backgroundcolor, border, bordercolor, borderradius, code, color, css, elid, fontfamily, fontsize, fontweight, gradientcode, height, left, lineheight, margin, opacity, padding, shadowcode, stylewrapper, textalign, top, width;
  css = {};
  width = $(".set-size-w").val();
  if (width !== "") {
    css.width = "width: " + width + ";\n";
  }
  height = $(".set-size-h").val();
  if (height !== "") {
    css.height = "height: " + height + ";\n";
  }
  top = $(".set-pos-top").val();
  if (top !== "") {
    css.top = "top: " + top + ";\n";
  }
  left = $(".set-pos-left").val();
  if (left !== "") {
    css.left = "left: " + left + ";\n";
  }
  textalign = $(".set-text-align").val();
  if (textalign !== "") {
    css.textalign = "text-align: " + textalign + ";\n";
  }
  fontfamily = $(".set-font-family").val();
  if (fontfamily !== "") {
    css.fontfamily = "font-family: " + fontfamily + ";\n";
  }
  fontweight = $(".set-font-weight").val();
  if (fontweight !== "") {
    css.fontweight = "font-weight: " + fontweight + ";\n";
  }
  fontsize = $(".set-font-size").val();
  if (fontsize !== "") {
    css.fontsize = "font-size: " + fontsize + ";\n";
  }
  lineheight = $(".set-line-height").val();
  if (lineheight !== "") {
    css.lineheight = "line-height: " + lineheight + ";\n";
  }
  color = $(".set-color").val();
  if (color !== "") {
    css.color = "color: " + color + ";\n";
  }
  borderradius = $(".set-border-radius").val();
  if (borderradius !== "") {
    css.borderradius = "border-radius: " + borderradius + ";\n";
  }
  border = $(".set-border").val();
  if (border !== "") {
    css.border = "border: " + border + ";\n";
  }
  bordercolor = $(".set-border-color").val();
  if (bordercolor !== "") {
    css.bordercolor = "border-color: " + bordercolor + ";\n";
  }
  margin = $(".set-margin").val();
  if (margin !== "") {
    css.margin = "margin: " + margin + ";\n";
  }
  padding = $(".set-padding").val();
  if (padding !== "") {
    css.padding = "padding: " + padding + ";\n";
  }
  opacity = $(".set-opacity").val();
  if (opacity !== "") {
    css.opacity = "opacity: " + opacity + ";\n";
  }
  backgroundcolor = $(".set-bk-color").val();
  if (backgroundcolor !== "") {
    css.backgroundcolor = "background-color: " + backgroundcolor + ";\n";
  }
  gradientcode = $(".set-gradient-code").html();
  if (gradientcode !== "") {
    css.gradientcode = "" + gradientcode + ";\n";
  }
  shadowcode = $(".set-shadow-code").html();
  if (shadowcode !== "") {
    css.shadowcode = "" + shadowcode + ";\n";
  }
  elid = div.data("elid");
  if ($("#style-" + elid).length === 0) {
    stylewrapper = $("<style id='style-" + elid + "'></style>");
    $("head").append(stylewrapper);
  }
  code = ("#elid-" + elid + " {\n") + displayCSSChunk(css.width) + displayCSSChunk(css.height) + displayCSSChunk(css.top) + displayCSSChunk(css.left) + displayCSSChunk(css.fontfamily) + displayCSSChunk(css.fontsize) + displayCSSChunk(css.lineheight) + displayCSSChunk(css.fontweight) + displayCSSChunk(css.textalign) + displayCSSChunk(css.color) + displayCSSChunk(css.borderradius) + displayCSSChunk(css.border) + displayCSSChunk(css.bordercolor) + displayCSSChunk(css.margin) + displayCSSChunk(css.padding) + displayCSSChunk(css.opacity) + displayCSSChunk(css.backgroundcolor) + displayCSSChunk(css.gradientcode) + displayCSSChunk(css.shadowcode) + "}";
  return $("#style-" + elid).html(code);
};

moveInlineStyle = function(div) {
  var bk, h, l, t, w;
  w = div.css("width");
  h = div.css("height");
  t = div.css("top");
  l = div.css("left");
  bk = rgb2hex(div.css("background-color"));
  $(".set-size-w").val(w);
  $(".set-size-h").val(h);
  $(".set-pos-top").val(t);
  $(".set-pos-left").val(l);
  $(".set-bk-color").val(bk);
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
