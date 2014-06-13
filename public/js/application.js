var displayCSSChunk, displayOnlyDefined, getColorLuminance, hex, hexDigits, inlineToPanel, jsonToClass, jsonToPanel, makeActive, panelToJSON, rgb2hex, setDefaultStyle, styles, updateClasses;

$(document).ready(function() {
  var editor, elidCtr;
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
    return $(".el-active").attr("class", "el el-box el-active defaultbox").addClass($(this).val());
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
    return $(".workspace").css("background", "#FFFFFF").css("width", w + "px").css("height", h + "px");
  });
  elidCtr = 0;
  $(".addBox").click(function() {
    return setDefaultStyle(function() {
      var boxDiv;
      boxDiv = $("<div class='el el-box' id='elid-" + elidCtr + "' data-elid='" + elidCtr + "'></div>");
      boxDiv.append($("<div class='el-content'></div>"));
      boxDiv.addClass("defaultbox");
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
      makeActive(boxDiv);
      updateClasses(boxDiv);
      boxDiv.click(function() {
        makeActive($(this));
        return updateClasses($(this));
      });
      $(".workspace").append(boxDiv);
      return elidCtr++;
    });
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

styles = [];

panelToJSON = function(div) {
  var elid;
  elid = div.data("elid");
  if (styles[elid] === void 0) {
    styles[elid] = {};
  }
  styles[elid].width = $(".set-size-w").val();
  styles[elid].height = $(".set-size-h").val();
  styles[elid].textalign = $(".set-text-align").val();
  styles[elid].fontfamily = $(".set-font-family").val();
  styles[elid].fontweight = $(".set-font-weight").val();
  styles[elid].fontsize = $(".set-font-size").val();
  styles[elid].lineheight = $(".set-line-height").val();
  styles[elid].color = $(".set-color").val();
  styles[elid].borderradius = $(".set-border-radius").val();
  styles[elid].border = $(".set-border").val();
  styles[elid].bordercolor = $(".set-border-color").val();
  styles[elid].margin = $(".set-margin").val();
  styles[elid].padding = $(".set-padding").val();
  styles[elid].opacity = $(".set-opacity").val();
  styles[elid].backgroundcolor = $(".set-bk-color").val();
  styles[elid].gradientcode = $(".set-gradient-code").val();
  return styles[elid].shadowcode = $(".set-shadow-code").val();
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
  $(".set-size-w").val(displayOnlyDefined(styles[elid].width));
  $(".set-size-h").val(displayOnlyDefined(styles[elid].height));
  $(".set-text-align").val(displayOnlyDefined(styles[elid].textalign));
  $(".set-font-family").val(displayOnlyDefined(styles[elid].fontfamily));
  $(".set-font-weight").val(displayOnlyDefined(styles[elid].fontweight));
  $(".set-font-size").val(displayOnlyDefined(styles[elid].fontsize));
  $(".set-line-height").val(displayOnlyDefined(styles[elid].lineheight));
  $(".set-color").val(displayOnlyDefined(styles[elid].color));
  $(".set-border-radius").val(displayOnlyDefined(styles[elid].borderradius));
  $(".set-border").val(displayOnlyDefined(styles[elid].border));
  $(".set-border-color").val(displayOnlyDefined(styles[elid].bordercolor));
  $(".set-margin").val(displayOnlyDefined(styles[elid].margin));
  $(".set-padding").val(displayOnlyDefined(styles[elid].padding));
  $(".set-opacity").val(displayOnlyDefined(styles[elid].opacity));
  $(".set-bk-color").val(displayOnlyDefined(styles[elid].backgroundcolor));
  $(".set-gradient-code").val(displayOnlyDefined(styles[elid].gradientcode));
  return $(".set-shadow-code").val(displayOnlyDefined(styles[elid].shadowcode));
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
  code = ("#elid-" + elid + " {\n") + displayCSSChunk("width", styles[elid].width) + displayCSSChunk("height", styles[elid].height) + displayCSSChunk("top", styles[elid].top) + displayCSSChunk("left", styles[elid].left) + displayCSSChunk("font-family", styles[elid].fontfamily) + displayCSSChunk("font-size", styles[elid].fontsize) + displayCSSChunk("line-height", "", styles[elid].lineheight) + displayCSSChunk("font-weight", styles[elid].fontweight) + displayCSSChunk("text-align", styles[elid].textalign) + displayCSSChunk("color", styles[elid].color) + displayCSSChunk("border-radius", styles[elid].borderradius) + displayCSSChunk("border", styles[elid].border) + displayCSSChunk("border-color", styles[elid].bordercolor) + displayCSSChunk("margin", styles[elid].margin) + displayCSSChunk("padding", styles[elid].padding) + displayCSSChunk("opacity", styles[elid].opacity) + displayCSSChunk("background-color", styles[elid].backgroundcolor) + displayCSSChunk(false, styles[elid].gradientcode) + displayCSSChunk(false, styles[elid].shadowcode) + "}";
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

makeActive = function(div) {
  $(".el-active").removeClass("el-active");
  div.addClass("el-active");
  if (styles[div.data("elid")] !== void 0) {
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
