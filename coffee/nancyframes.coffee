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
    $(".el-active").attr("class", "el el-box el-active").addClass($(this).val())

  $(".css-editor").keyup () ->
    # $(".el-box").attr("class", "el el-box defaultbox").addClass($(this).val())
    $("#userstyle").empty()
    $("#userstyle").append($(this).val())

  $(".elidstyle").keyup () ->
    updateStyle($(".el-active"))
  $(".elidstyle").change () ->
    updateStyle($(".el-active"))

  # HELPERS
  $(".set-gradient").keyup () ->
    hex = $(".set-bk-color").val()
    darkerhex = getColorLuminance(hex, -$(this).val())

    code = """background-image: -o-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: -moz-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: -ms-linear-gradient(-90deg, #{hex} 0%, #{darkerhex} 100%);
      background-image: linear-gradient(-180deg, #{hex} 0%, #{darkerhex} 100%);
    """

    $(".set-gradient-code").html(code)

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

    $(".set-shadow-code").html(code)

  # DRAGGABLES
  # Update Page Container
  $(".updatePageDim").click () ->
    if $(".page").length == 0
      pageDiv = $ "<div class='page'></div>"
      pageDiv.draggable({snap: true})
      pageDiv.resizable()
    else
      pageDiv = $(".page")

    w = $(".pageWidth").val()
    h = $(".pageHeight").val()
    # pageDiv.css("background", "#FFFFFF").css("width", w+"px").css("height", h+"px")
    $(".workspace").css("background", "#FFFFFF").css("width", w+"px").css("height", h+"px")

    # $(".workspace").append pageDiv

  # Add a Box
  elid = 0;
  $(".addBox").click () ->
    setDefaultStyle() 

    boxDiv = $ "<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>"
    boxDiv.append $ "<div class='el-content'></div>"
    # boxDiv.css("width", "100px").css("height", "100px")
    boxDiv.addClass("defaultbox")
    boxDiv.draggable({
      snap: true,
      start: () ->
        makeActive $(this)
        updateClasses $(this)
      stop: () ->
        moveInlineStyle(boxDiv)
    })
    boxDiv.resizable({
      stop: () ->
        moveInlineStyle(boxDiv)
    })

    makeActive boxDiv
    updateClasses boxDiv
    # moveInlineStyle(boxDiv)
    
    boxDiv.click () ->
      makeActive $(this)
      updateClasses $(this)
    
    updateStyle boxDiv
    $(".workspace").append boxDiv

    elid++

  # create class from elid style
  $(".createclass").click () ->
    elid = $(".el-active").data("elid")
    css = $("#style-" + elid).html()
    css = css.replace("#elid-" + elid, ".newstyle")
    currcss = $(".css-editor").text()
    $(".css-editor").text(css + "\n" + currcss)

setDefaultStyle = () ->
  $(".set-pos-top").val("20px")
  $(".set-pos-left").val("20px")

displayCSSChunk = (css) ->
  if css == undefined
    return ""
  else
    return "  " + css

# From Work Panel --> Class
updateStyle = (div) ->
  css = {}

  width = $(".set-size-w").val()
  if width != ""
    css.width = "width: #{width};\n" 
  
  height = $(".set-size-h").val()
  if height != ""
    css.height = "height: #{height};\n" 

  top = $(".set-pos-top").val()
  if top != ""
    css.top = "top: #{top};\n" 

  left = $(".set-pos-left").val()
  if left != ""
    css.left = "left: #{left};\n" 

  textalign = $(".set-text-align").val()
  if textalign != ""
    css.textalign = "text-align: #{textalign};\n" 

  fontfamily = $(".set-font-family").val()
  if fontfamily != ""
    css.fontfamily = "font-family: #{fontfamily};\n" 

  fontweight = $(".set-font-weight").val()
  if fontweight != ""
    css.fontweight = "font-weight: #{fontweight};\n" 

  fontsize = $(".set-font-size").val()
  if fontsize != ""
    css.fontsize = "font-size: #{fontsize};\n" 

  lineheight = $(".set-line-height").val()
  if lineheight != ""
    css.lineheight = "line-height: #{lineheight};\n" 

  color = $(".set-color").val()
  if color != ""
    css.color = "color: #{color};\n" 

  borderradius = $(".set-border-radius").val()
  if borderradius != ""
    css.borderradius = "border-radius: #{borderradius};\n" 

  border = $(".set-border").val()
  if border != ""
    css.border = "border: #{border};\n" 

  bordercolor = $(".set-border-color").val()
  if bordercolor != ""
    css.bordercolor = "border-color: #{bordercolor};\n" 

  margin = $(".set-margin").val()
  if margin != ""
    css.margin = "margin: #{margin};\n" 

  padding = $(".set-padding").val()
  if padding != ""
    css.padding = "padding: #{padding};\n" 

  opacity = $(".set-opacity").val()
  if opacity != ""
    css.opacity = "opacity: #{opacity};\n" 

  backgroundcolor = $(".set-bk-color").val()
  if backgroundcolor != ""
    css.backgroundcolor = "background-color: #{backgroundcolor};\n" 

  gradientcode = $(".set-gradient-code").html()
  if gradientcode != ""
    css.gradientcode = "#{gradientcode};\n" 

  shadowcode = $(".set-shadow-code").html()
  if shadowcode != ""
    css.shadowcode = "#{shadowcode};\n" 
  
  elid = div.data("elid")
  if $("#style-"+elid).length == 0
    stylewrapper = $ "<style id='style-" + elid + "'></style>"
    $("head").append stylewrapper

  code = "#elid-#{elid} {\n" +
    displayCSSChunk(css.width) + 
    displayCSSChunk(css.height) + 
    displayCSSChunk(css.top) + 
    displayCSSChunk(css.left) + 
    displayCSSChunk(css.fontfamily) + 
    displayCSSChunk(css.fontsize) + 
    displayCSSChunk(css.lineheight) + 
    displayCSSChunk(css.fontweight) + 
    displayCSSChunk(css.textalign) + 
    displayCSSChunk(css.color) + 
    displayCSSChunk(css.borderradius) +
    displayCSSChunk(css.border) +  
    displayCSSChunk(css.bordercolor) + 
    displayCSSChunk(css.margin) + 
    displayCSSChunk(css.padding) + 
    displayCSSChunk(css.opacity) + 
    displayCSSChunk(css.backgroundcolor) + 
    displayCSSChunk(css.gradientcode) + 
    displayCSSChunk(css.shadowcode) +
  "}"
  
  $("#style-"+elid).html(code)

# From Inline --> Work Panel & Style Class
moveInlineStyle = (div) ->
  w = div.css("width")
  h = div.css("height")
  t = div.css("top")
  l = div.css("left")
  bk = rgb2hex(div.css("background-color"))


  $(".set-size-w").val(w)
  $(".set-size-h").val(h)
  $(".set-pos-top").val(t)
  $(".set-pos-left").val(l)
  $(".set-bk-color").val(bk)

  div.attr("style", "")
  updateStyle(div)

makeActive = (div) ->
  $(".el-active").removeClass("el-active")
  div.addClass("el-active")


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