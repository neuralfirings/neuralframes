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

  $(".input-color").minicolors()

  $(".css-includes").keyup () ->
    $(".el-active").attr("class", "el el-box el-active").addClass($(this).val())

  $(".css-editor").keyup () ->
    # $(".el-box").attr("class", "el el-box defaultbox").addClass($(this).val())
    $("#userstyle").empty()
    $("#userstyle").append($(this).val())

  $(".elidstyle").keyup () ->
    # console.log "hi"
    updateStyle($(".el-active"))

  # HELPERS
  $(".helper-gradient").keyup () ->
    hex = $(".helper-colorhex").val()
    darkerhex = getColorLuminance(hex, -$(this).val())
    console.log darkerhex

    code = """background-image: -o-linear-gradient(-90deg, """ + hex + """ 0%, """ + darkerhex + """ 100%);
      background-image: -moz-linear-gradient(-90deg, """ + hex + """ 0%, """ + darkerhex + """ 100%);
      background-image: -ms-linear-gradient(-90deg, """ + hex + """ 0%, """ + darkerhex + """ 100%);
      background-image: linear-gradient(-180deg, """ + hex + """ 0%, """ + darkerhex + """ 100%);
    """

    $(".helper-gradient-code").html(code)

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
    boxDiv = $ "<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>"
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
    
    $(".workspace").append boxDiv

    elid++

updateStyle = (div) ->
  width = $(".set-size-w").val()
  height = $(".set-size-h").val()
  top = $(".set-pos-top").val()
  left = $(".set-pos-left").val()
  
  elid = div.data("elid")
  if $("#style-"+elid).length == 0
    stylewrapper = $ "<style id='style-" + elid + "'></style>"
    $("head").append stylewrapper

  css = "#elid-" + elid + " {" +
        "width: " + width + ";" +
        "height: " + height + ";" +
        "top: " + top + ";" +
        "left: " + left + ";" +
        "}"

  $("#style-"+elid).html(css)

moveInlineStyle = (div) ->
  w = div.css("width")
  h = div.css("height")
  t = div.css("top")
  l = div.css("left")

  $(".set-size-w").val(w)
  $(".set-size-h").val(h)
  $(".set-pos-top").val(t)
  $(".set-pos-left").val(l)

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