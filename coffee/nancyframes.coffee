$(document).ready ->

  # EDITOR
  editor = new Behave({
    textarea:     document.getElementById('css-editor'),
    replaceTab:   true,
    softTabs:     true,
    tabSize:    2,
    autoOpen:     true,
    overwrite:    true,
    autoStrip:    true,
    autoIndent:   true
  });

  $(".input-color").minicolors({position: 'bottom right'})

  # Trigger to edit text
  $(document).on "dblclick", ".el", () ->
  # $(".el").dblclick () ->
    $(this).find(".el-content").attr("contentEditable", true).focus()
    # $(this).attr("contentEditable", true).focus()
    console.log "hi"

  # Triggers to update style
  $(".css-includes").keyup () ->
    $(".el-active").attr("class", "el el-box el-active defaultbox").addClass($(this).val())

  $(".css-editor").keyup () ->
    # $(".el-box").attr("class", "el el-box defaultbox").addClass($(this).val())
    $("#userstyle").empty()
    $("#userstyle").append($(this).val())

  $(".elidstyle").keyup () ->
    # updateStyle($(".el-active"))
    panelToJSON($(".el-active"))
    jsonToClass($(".el-active"))
  $(".elidstyle").change () ->
    panelToJSON($(".el-active"))
    jsonToClass($(".el-active"))

  # HELPERS
  $(".set-gradient").bind "keyup change", () ->
    hex = $(".set-bk-color").val()
    darkerhex = getColorLuminance(hex, -$(this).val())

    code = """background-image: -o-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: -moz-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: -ms-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: linear-gradient(-180deg, #{hex} 0%, #{darkerhex} 100%);
    """

    $(".set-gradient-code").val(code)

  $(".set-shadow").bind "keyup change", (e) ->
    x = $(".set-outershadow-x").val()
    y = $(".set-outershadow-y").val()
    b = $(".set-outershadow-b").val()
    s = $(".set-outershadow-s").val()
    c = $(".set-outershadow-c").val()
    if $(".set-outershadow-c").val() != ""
      outershadowcode = "#{x}px #{y}px #{b}px #{s}px #{c}"

    x = $(".set-innershadow-x").val()
    y = $(".set-innershadow-y").val()
    b = $(".set-innershadow-b").val()
    s = $(".set-innershadow-s").val()
    c = $(".set-innershadow-c").val()
    if $(".set-innershadow-c").val() != ""
      innershadowcode = "inset #{x}px #{y}px #{b}px #{s}px #{c}"

    if outershadowcode != undefined && innershadowcode == undefined
      code = "-moz-box-shadow: " + outershadowcode + "; \nbox-shadow: " + outershadowcode + ";"
    else if outershadowcode == undefined && innershadowcode != undefined
      code = "-moz-box-shadow: " + innershadowcode + "; \nbox-shadow: " + innershadowcode+ ";"
    else if outershadowcode != undefined && innershadowcode != undefined
      code = "-moz-box-shadow: " + outershadowcode + ", " + innershadowcode + "; \nbox-shadow: " + outershadowcode + ", " + innershadowcode + ";"
    else
      code = ""

    $(".set-shadow-code").val(code)

  # DRAGGABLES
  # Update Page Container
  $(".updatePageDim").click () ->
    if $(".page").length == 0
      pageDiv = $ "<div class='page'></div>"
      pageDiv.draggable({})
      pageDiv.resizable()
    else
      pageDiv = $(".page")

    w = $(".pageWidth").val()
    h = $(".pageHeight").val()
    # pageDiv.css("background", "#FFFFFF").css("width", w+"px").css("height", h+"px")
    $(".workspace").css("background", "#FFFFFF").css("width", w+"px").css("height", h+"px")

    # $(".workspace").append pageDiv

  # Add a Box
  elidCtr = 0;
  $(".addBox").click () ->
    setDefaultStyle () ->
      boxDiv = $ "<div class='el el-box' id='elid-" + elidCtr + "' data-elid='" + elidCtr + "'></div>"
      boxDiv.append $ "<div class='el-content'></div>"
      # boxDiv.css("width", "100px").css("height", "100px")
      boxDiv.addClass("defaultbox")
      boxDiv.draggable({
        # snap: true,
        grid: [5,5],
        start: () ->
          makeActive $(this)
          updateClasses $(this)
        stop: () ->
          inlineToPanel(boxDiv)
      })
      boxDiv.resizable({
        grid: [5,5],
        stop: () ->
          inlineToPanel boxDiv
          panelToJSON boxDiv
          jsonToClass boxDiv
      })

      makeActive boxDiv
      updateClasses boxDiv
      
      boxDiv.click () ->
        makeActive $(this)
        updateClasses $(this)
      
      # updateStyle boxDiv
      $(".workspace").append boxDiv

      elidCtr++

  # create class from elid style
  $(".createclass").click () ->
    elid = $(".el-active").data("elid")
    css = $("#style-" + elid).html()
    css = css.replace("#elid-" + elid, ".newstyle")
    currcss = $(".css-editor").val()
    $(".css-editor").val(css + "\n" + currcss)

  # reset to default, keep classes
  $(".resetcss").click () ->
    setDefaultStyle () ->
      # updateStyle($(".el-active"))
      panelToJSON($(".el-active"))
      jsonToClass($(".el-active"))

setDefaultStyle = (callback) ->
  $(".elidstyle").val("")
  $(".set-pos-top").val("20px")
  $(".set-pos-left").val("20px")
  # $(".set-size-w").val("200px")
  # $(".set-size-h").val("50px")
  # $(".set-bk-color").val("#EEEEEE")
  $(".set-outershadow-x").val("1")
  $(".set-outershadow-y").val("1")
  $(".set-outershadow-b").val("3")
  $(".set-outershadow-s").val("0")
  $(".set-innershadow-x").val("0")
  $(".set-innershadow-y").val("0")
  $(".set-innershadow-b").val("3")
  $(".set-innershadow-s").val("0")

  callback()


# UPDATE STYLE
styles = []
panelToJSON = (div) ->
  elid = div.data("elid")
  if styles[elid] == undefined
    styles[elid] = {}

  styles[elid].width = $(".set-size-w").val()
  styles[elid].height = $(".set-size-h").val()
  styles[elid].textalign = $(".set-text-align").val()
  styles[elid].fontfamily = $(".set-font-family").val()
  styles[elid].fontweight = $(".set-font-weight").val()
  styles[elid].fontsize = $(".set-font-size").val()
  styles[elid].lineheight = $(".set-line-height").val()
  styles[elid].color  = $(".set-color").val()
  styles[elid].borderradius = $(".set-border-radius").val()
  styles[elid].border  = $(".set-border").val()
  styles[elid].bordercolor = $(".set-border-color").val()
  styles[elid].margin = $(".set-margin").val()
  styles[elid].padding = $(".set-padding").val()
  styles[elid].opacity = $(".set-opacity").val()
  styles[elid].backgroundcolor = $(".set-bk-color").val()
  styles[elid].gradientcode = $(".set-gradient-code").val()
  styles[elid].shadowcode = $(".set-shadow-code").val()
  


#helper function
displayOnlyDefined = (text) ->
  if text == undefined
    return ""
  else
    return text

jsonToPanel = (div) ->
  elid = div.data("elid")
  $(".set-size-w").val(displayOnlyDefined(styles[elid].width))
  $(".set-size-h").val(displayOnlyDefined(styles[elid].height))
  $(".set-text-align").val(displayOnlyDefined(styles[elid].textalign))
  $(".set-font-family").val(displayOnlyDefined(styles[elid].fontfamily))
  $(".set-font-weight").val(displayOnlyDefined(styles[elid].fontweight))
  $(".set-font-size").val(displayOnlyDefined(styles[elid].fontsize))
  $(".set-line-height").val(displayOnlyDefined(styles[elid].lineheight))
  $(".set-color").val(displayOnlyDefined(styles[elid].color))
  $(".set-border-radius").val(displayOnlyDefined(styles[elid].borderradius))
  $(".set-border").val(displayOnlyDefined(styles[elid].border))
  $(".set-border-color").val(displayOnlyDefined(styles[elid].bordercolor))
  $(".set-margin").val(displayOnlyDefined(styles[elid].margin))
  $(".set-padding").val(displayOnlyDefined(styles[elid].padding))
  $(".set-opacity").val(displayOnlyDefined(styles[elid].opacity))
  $(".set-bk-color").val(displayOnlyDefined(styles[elid].backgroundcolor))
  $(".set-gradient-code").val(displayOnlyDefined(styles[elid].gradientcode))
  $(".set-shadow-code").val(displayOnlyDefined(styles[elid].shadowcode))


#helper function
displayCSSChunk = (label, css) ->
  if css == undefined or css == ""
    return ""
  else
    if label == undefined or label == ""
      return css + "\n"
    else
      return "  #{label}: " + css  + "; \n"

# From Work Panel --> Class
jsonToClass = (div) ->
  elid = div.data("elid")
  if $("#style-"+elid).length == 0
    stylewrapper = $ "<style id='style-" + elid + "'></style>"
    $("head").append stylewrapper

  code = "#elid-#{elid} {\n" +
    displayCSSChunk("width", styles[elid].width) + 
    displayCSSChunk("height", styles[elid].height) + 
    displayCSSChunk("top", styles[elid].top) + 
    displayCSSChunk("left", styles[elid].left) + 
    displayCSSChunk("font-family", styles[elid].fontfamily) + 
    displayCSSChunk("font-size", styles[elid].fontsize) + 
    displayCSSChunk("line-height", styles[elid].lineheight) + 
    displayCSSChunk("font-weight", styles[elid].fontweight) + 
    displayCSSChunk("text-align", styles[elid].textalign) + 
    displayCSSChunk("color", styles[elid].color) + 
    displayCSSChunk("border-radius", styles[elid].borderradius) +
    displayCSSChunk("border", styles[elid].border) +  
    displayCSSChunk("border-color", styles[elid].bordercolor) + 
    displayCSSChunk("margin", styles[elid].margin) + 
    displayCSSChunk("padding", styles[elid].padding) + 
    displayCSSChunk("opacity", styles[elid].opacity) + 
    displayCSSChunk("background-color", styles[elid].backgroundcolor) + 
    displayCSSChunk(false, styles[elid].gradientcode) + 
    displayCSSChunk(false, styles[elid].shadowcode) +
  "}"
  
  $("#style-"+elid).html(code)

# From Inline --> Work Panel & Style Class
inlineToPanel = (div) ->
  w = div.css("width")
  h = div.css("height")
  t = div.css("top")
  l = div.css("left")
  # bk = rgb2hex(div.css("background-color"))


  $(".set-size-w").val(w)
  $(".set-size-h").val(h)
  $(".set-pos-top").val(t)
  $(".set-pos-left").val(l)
  # $(".set-bk-color").val(bk)

  div.attr("style", "top: #{t}; left: #{l}")
  # updateStyle(div)

makeActive = (div) ->
  $(".el-active").removeClass("el-active")
  div.addClass("el-active")

  if styles[div.data("elid")] != undefined
    jsonToPanel div
    jsonToClass div
  else
    panelToJSON div
    jsonToClass div

updateClasses = (div) ->
  classes = div.attr("class").split(" ")
  classesString = ""
  ignoreClass = ["el", "el-box",  "el-active", "defaultbox",
    "ui-draggable", "ui-draggable-dragging", "ui-resizable"]
  for c in classes
    if ignoreClass.indexOf(c) <= -1
      classesString = c + " "

  $(".css-includes").val(classesString)

getColorLuminance = (hex, lum) ->

  # // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if hex.length < 6
    hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2]
  lum = lum || 0

  # // convert to decimal and change luminosity
  rgb = "#"
  c = 0
  i = 0
  while i<3
    c = parseInt(hex.substr(i*2,2), 16)
    c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
    rgb += ("00"+c).substr(c.length)
    i++

  rgb

#Function to convert hex format to a rgb color
rgb2hex = (rgb) ->
  rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)
  "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3])
hex = (x) ->
  (if isNaN(x) then "00" else hexDigits[(x - x % 16) / 16] + hexDigits[x % 16])
hexDigits = new Array("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f")