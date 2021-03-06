groupctr = 0

$(document).keydown (e) ->
  k = e.keyCode
  if $(".el-active").length > 0
    if k >= 38 and k <= 40
      e.preventDefault()
    if (k == 38)  
      $(".el-active").each () ->
        t = parseInt($(this).css("top"))
        $(this).css("top", t-1 + "px")
    else if (k == 40)
      $(".el-active").each () ->
        t = parseInt($(this).css("top"))
        $(this).css("top", t+1  + "px")
    else if (k == 37)
      $(".el-active").each () ->
        l = parseInt($(this).css("left"))
        $(this).css("left", l-1 + "px")
    else if (k == 39)
      $(".el-active").each () ->
        l = parseInt($(this).css("left"))
        $(this).css("left", l+1 + "px")

$(document).ready () ->

  # Tool tips
  $(".maketooltip").tooltip()

  # Show toggle
  $(".showclass").click () ->
    element = $(this).data("element")
    $(element).toggle()

  #FIREBASE
  fb = new Firebase("https://neuralframes.firebaseio.com/");

  auth = new FirebaseSimpleLogin fb, (error, user) ->
    if !error and user
      console.log ("Welcome back, #{user.email} (#{user.id})")
      $(".requirelogin").show()
      $(".signin-section").hide()
      $(".signedin-section").show()
      $(".canvas-list").show()
      $(".new-canvas-title").show()
      $(".hello-msg").text("Signed in: #{user.email}")

      # show list
      titlelist = fb.child("userdata").child(user.id).child("frames")
      titlelist.on "value", (snapshot) ->
        if snapshot.val() != null
          $(".frames-list").empty()
          for key, value of snapshot.val()
            $(".frames-list").append("<option value='#{key}' data-key='#{key}'>#{value.title}</option>")
            $(".frame-title-container").hide()
          $(".frames-list").append("<option value='framenew'>New Entry</option>")

      # show new title
      if $(".frames-list").val() == 'framenew'
        $(".frame-title-container").show()
      else
        $(".frame-title-container").hide()

      $(".frames-list").change () ->
        if $(this).val() == 'framenew'
          $(".frame-title-container").show()
        else
          $(".frame-title-container").hide()


      # save button
      $(".save").show()
      $(".save").click () ->
        title = $(".frame-title").val()
        if $(".frames-list").val() == "framenew" and (title == "" or title == undefined)
          alert("no title")
        else
          if $(".frames-list").val() == "framenew"
            entry_key = fb.child("userdata").child(user.id).child("frames").push({title: title})
            entry_id = entry_key.name()
          else
            entry_id = $(".frames-list").val()
          
          entry = fb.child("userdata").child(user.id).child("frames").child(entry_id)
          
          order = []
          $(".workspace").find(".el").each () ->
            order.push $(this).data("elid")
          for style, index in window.styles   # for each element
            if style != undefined and $("#elid-"+index) != undefined
              div = $("#elid-"+index)
              entry.child("elements").child(index).child("el-style").set(style)
              entry.child("elements").child(index).child("inc-class").set(div.attr("class"))
              entry.child("elements").child(index).child("inline-style").child("top").set(div.css("top"))
              entry.child("elements").child(index).child("inline-style").child("left").set(div.css("left"))
              entry.child("elements").child(index).child("text").set(div.text())
              if div.data("ingroup")
                entry.child("elements").child(index).child("ingroup").set(div.data("ingroup"))
            else 
              entry.child("elements").child(index).remove()

          entry.child("css").set($(".css-editor").val())
          entry.child("elidCtr").set(window.elidCtr)
          entry.child("order").set(order)

          $(".frames-list").val(entry_id)

      # delete button
      $(".delete").click () ->
        title = $(".frame-title").val()
        
      # open button
      $(".open").click () ->
        if $(".frames-list").val() == 'framenew'
          $(".frame-title-container").show()
        else
          $(".frame-title-container").hide()

        entry_id = $(".frames-list").val()
        entry = fb.child("userdata").child(user.id).child("frames").child(entry_id)
        $(".workspace").empty()
        window.styles = []
        entry.once "value", (data) ->
          if data.val() != null
            window.elidCtr = data.val().elidCtr

            if data.val().order
              for index in data.val().order 
                value = data.val().elements[index]
                if value 
                  window.styles[index] = {}
                  for key, val of value["el-style"]
                    window.styles[index][key] = val
                  loadBox index
                  jsonToPanel($("#elid-#{index}"))
                  jsonToClass($("#elid-#{index}"))
                  $("#elid-#{index}").css("top", value["inline-style"].top)
                  $("#elid-#{index}").css("left", value["inline-style"].left)
                  currClass = $("#elid-#{index}").attr("class")
                  $("#elid-#{index}").attr("class", value["inc-class"])
                  if value["ingroup"]
                    $("#elid-#{index}").attr("data-ingroup", value["ingroup"])
                    currgroupid = Number(value["ingroup"].substr(6))
                    groupctr = Math.max(groupctr, currgroupid) + 1
                  $("#elid-#{index}").find(".el-content").text(value["text"])
            else
              for value, index in data.val().elements # each element
                if value != undefined
                  window.styles[index] = {}
                  for key, val of value["el-style"]
                    window.styles[index][key] = val
                  loadBox index
                  jsonToPanel($("#elid-#{index}"))
                  jsonToClass($("#elid-#{index}"))
                  $("#elid-#{index}").css("top", value["inline-style"].top)
                  $("#elid-#{index}").css("left", value["inline-style"].left)
                  currClass = $("#elid-#{index}").attr("class")
                  $("#elid-#{index}").attr("class", value["inc-class"])
                  $("#elid-#{index}").find(".el-content").text(value["text"])

            # page wide CSS editor
            $(".css-editor").val(data.val().css)
            $(".css-editor").keyup()

          $(".frames-list").val(entry_id)
    else
      $(".signin-section").show()

  $(".login").click () ->
    auth.login('password', {
      email: $(".log-email").val(),
      password: $(".log-pw").val(),
      rememberMe: true
    });

  $(".signup").click () ->
    auth.createUser $(".log-email").val(), $(".log-pw").val(), (error, user) ->
      if (!error)
        console.log ('New User, Id: ' + user.uid + ', Email: ' + user.email)

  # Bring back and forward
  $(".fwdallBox").click () ->
    div = $(".el-active")
    lastel = $(".workspace").find(".el").last()
    div.insertAfter(lastel)
  $(".fwdBox").click () ->
    div = $(".el-active")
    nextdiv = $(".el-active").next()
    if nextdiv.length != 0
      div.insertAfter(nextdiv)
  $(".backBox").click () ->
    div = $(".el-active")
    prevdiv = $(".el-active").prev()
    if prevdiv.length != 0
      div.insertBefore(prevdiv)
  $(".backallBox").click () ->
    div = $(".el-active")
    firstel = $(".workspace").find(".el").first()
    div.insertBefore(firstel)

  # Group
  $(".groupBox").click () ->
    $(".el-active").each () ->
      # if $(this).data("ingroup") 
      #   $(this).removeClass $(this).data("ingroup")
    $(".el-active").attr("data-ingroup", "group-"+groupctr)
    # $(".el-active").addClass("group-"+groupctr)
    $(".el-active").draggable("option", "alsoDrag", ".el[data-ingroup='group-" + groupctr + "']")
    $(".el-active").resizable("option", "alsoResize", ".el[data-ingroup='group-" + groupctr + "']") #".group-"+groupctr)
    groupctr++

  # Ungroup
  $(".ungroupBox").click () ->
    $(".el-active").each () ->
      # $(this).removeClass (index, css) ->
      #   (css.match (/(^|\s)group-\S+/g) || []).join(' ')
      $(this).removeAttr("data-ingroup")
      $(this).removeClass("el-active")


  # Delete
  $(".deleteBox").click () ->
    if $(".el-active").length != 0
      elid = $(".el-active").data("elid")
      styles[elid] = undefined
      $(".el-active").remove()


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

  $(".set-color").minicolors({position: 'bottom right'})
  $(".set-bk-color").minicolors({position: 'bottom right'})
  $(".set-border-color").minicolors({position: 'bottom right'})
  $(".set-outershadow-c").minicolors({position: 'bottom right'})
  $(".set-innershadow-c").minicolors({position: 'bottom right'})
  $(".dummy-color").minicolors({position: 'top right'})

  # Trigger to edit text
  $(document).on "dblclick", ".el", () ->
    $(this).find(".el-content").attr("contentEditable", true).focus()

  # Triggers to update style
  $(".css-includes").keyup () ->
    $(".el-active").attr("class", "el el-box el-active").addClass($(this).val())

  $(".css-editor").keyup () ->
    $("#userstyle").empty()
    $("#userstyle").append($(this).val())

  $(".elidstyle").keyup () ->
    # updateStyle($(".el-active"))
    panelToInline($(".el-active"))
    panelToJSON($(".el-active"))
    jsonToClass($(".el-active"))
  $(".elidstyle").change () ->
    panelToInline($(".el-active"))
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
    $(".workspace").css("background", "#FFFFFF").css("width", w)#.css("height", h+"px")

    # $(".workspace").append pageDiv

  # Duplicate a Box
  $(".dupBox").click () ->
    if $(".el-active").length != 0
      parent_eid = $(".el-active").data("elid")
      parent_classes = $(".el-active").attr("class")
      $(".addBox").click()
      child_eid = $(".el-active").data("elid")
      $(".el-active").attr("class", parent_classes)

      window.styles[child_eid] = {}
      for key, value of styles[parent_eid]
        window.styles[child_eid][key] = window.styles[parent_eid][key]

      jsonToPanel($(".el-active"))
      jsonToClass($(".el-active"))


  $(".workspace").click (e) ->
    if $(e.target).hasClass("workspace")
      $(".el-active").removeClass("el-active")

  # Add a Box
  window.elidCtr = 0;
  $(".addBox").click () ->
    addBox(elidCtr)
    elidCtr++

  # create class from elid style
  $(".createclass").click () ->
    elid = $(".el-active").data("elid")
    css = $("#style-" + elid).html()
    css = css.replace("#elid-" + elid, ".newstyle")
    currcss = $(".css-editor").val()
    $(".css-editor").val(css + "\n" + currcss)
    $("#csseditorlink").click()

  # reset to default, keep classes
  $(".resetcss").click () ->
    setDefaultStyle () ->
      # updateStyle($(".el-active"))
      panelToJSON($(".el-active"))
      jsonToClass($(".el-active"))

loadBox = (elid) ->
  boxDiv = $ "<div class='el el-box' id='elid-#{elid}' data-elid='#{elid}'></div>"
  boxDiv.append $ "<div class='el-content'></div>"
  # boxDiv.addClass("defaultbox")
  boxDiv.draggable({
    # snap: true,
    grid: [5,5],
    alsoDrag: ".el-active",
    start: () ->
      # makeActive $(this)
      updateClasses $(this)
    stop: () ->
      inlineToPanel(boxDiv)
  })
  # boxDiv.draggable("option", "alsoDrag", ".group")

  boxDiv.resizable({
    grid: [5,5],
    alsoResize: ".el-active",
    stop: () ->
      if boxDiv.attr("ingroup")
        $("." + boxDiv.attr("ingroup")).each () ->
          inlineToPanel $(this)
          panelToJSON $(this)
          jsonToClass $(this)
      $(".el-active").each () ->
        inlineToPanel $(this)
        panelToJSON $(this)
        jsonToClass $(this)
  })

  boxDiv.click (e) ->
    if e.shiftKey
      makeActive $(this), false
    else
      makeActive $(this), true
    updateClasses $(this)
    inlineToPanel $(this)
  
  # updateStyle boxDiv
  $(".workspace").append boxDiv


addGroupBox = (elid) ->
  boxDiv = $ "<div class='el el-group' id='elid-#{elid}' data-elid='#{elid}'></div>"
  boxDiv.append $ "<div class='el-content'></div>"
  # boxDiv.addClass("defaultbox")
  boxDiv.draggable({
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
  
  boxDiv.click (e) ->
    if e.shiftKey
      makeActive $(this), false
    else
      makeActive $(this), true
    updateClasses $(this)
    inlineToPanel $(this)
  
  # updateStyle boxDiv
  $(".workspace").append boxDiv

addBox = (elid) ->
  setDefaultStyle () ->
    boxDiv = $ "<div class='el el-box' id='elid-" + elid + "' data-elid='" + elid + "'></div>"
    boxDiv.append $ "<div class='el-content'></div>"
    # boxDiv.css("width", "100px").css("height", "100px")
    boxDiv.addClass("defaultbox")
    boxDiv.draggable({
      # snap: true,
      grid: [5,5],
      alsoDrag: ".el-active",
      start: () ->
        # makeActive $(this)
        updateClasses $(this)
      stop: () ->
        inlineToPanel(boxDiv)
    })
    boxDiv.resizable({
      grid: [5,5],
      alsoResize: ".el-active",
      stop: () ->
        if boxDiv.attr("ingroup")
          $("." + boxDiv.attr("ingroup")).each () ->
            inlineToPanel $(this)
            panelToJSON $(this)
            jsonToClass $(this)
        $(".el-active").each () ->
          inlineToPanel $(this)
          panelToJSON $(this)
          jsonToClass $(this)
    })

    makeActive boxDiv
    updateClasses boxDiv
    
    boxDiv.click (e) ->
      if e.shiftKey
        makeActive $(this), false 
      else
        makeActive $(this), true
      updateClasses $(this)
      inlineToPanel $(this)
    
    # updateStyle boxDiv
    $(".workspace").append boxDiv

    # inlineToPanel boxDiv
    $(".set-size-w").val("200px")
    $(".set-size-h").val("50px")
    panelToJSON boxDiv
    jsonToClass boxDiv

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
window.styles = []
panelToInline = (div) ->
  elid = div.data("elid")
  div.css("top", $(".set-pos-top").val())
  div.css("left", $(".set-pos-left").val())

panelToJSON = (div) ->
  elid = div.data("elid")
  if window.styles[elid] == undefined
    window.styles[elid] = {}

  window.styles[elid].width = $(".set-size-w").val()
  window.styles[elid].height = $(".set-size-h").val()
  window.styles[elid].textalign = $(".set-text-align").val()
  window.styles[elid].fontfamily = $(".set-font-family").val()
  window.styles[elid].fontweight = $(".set-font-weight").val()
  window.styles[elid].fontsize = $(".set-font-size").val()
  window.styles[elid].lineheight = $(".set-line-height").val()
  window.styles[elid].color  = $(".set-color").val()
  window.styles[elid].borderradius = $(".set-border-radius").val()
  window.styles[elid].border  = $(".set-border").val()
  window.styles[elid].bordercolor = $(".set-border-color").val()
  window.styles[elid].margin = $(".set-margin").val()
  window.styles[elid].padding = $(".set-padding").val()
  window.styles[elid].opacity = $(".set-opacity").val()
  window.styles[elid].backgroundcolor = $(".set-bk-color").val()
  window.styles[elid].gradientcode = $(".set-gradient-code").val()
  window.styles[elid].shadowcode = $(".set-shadow-code").val()
  


#helper function
displayOnlyDefined = (text) ->
  if text == undefined
    return ""
  else
    return text

jsonToPanel = (div) ->
  elid = div.data("elid")
  $(".set-size-w").val(displayOnlyDefined(window.styles[elid].width))
  $(".set-size-h").val(displayOnlyDefined(window.styles[elid].height))
  $(".set-text-align").val(displayOnlyDefined(window.styles[elid].textalign))
  $(".set-font-family").val(displayOnlyDefined(window.styles[elid].fontfamily))
  $(".set-font-weight").val(displayOnlyDefined(window.styles[elid].fontweight))
  $(".set-font-size").val(displayOnlyDefined(window.styles[elid].fontsize))
  $(".set-line-height").val(displayOnlyDefined(window.styles[elid].lineheight))
  $(".set-color").val(displayOnlyDefined(window.styles[elid].color))
  $(".set-border-radius").val(displayOnlyDefined(window.styles[elid].borderradius))
  $(".set-border").val(displayOnlyDefined(window.styles[elid].border))
  $(".set-border-color").val(displayOnlyDefined(window.styles[elid].bordercolor))
  $(".set-margin").val(displayOnlyDefined(window.styles[elid].margin))
  $(".set-padding").val(displayOnlyDefined(window.styles[elid].padding))
  $(".set-opacity").val(displayOnlyDefined(window.styles[elid].opacity))
  $(".set-bk-color").val(displayOnlyDefined(window.styles[elid].backgroundcolor))
  $(".set-gradient-code").val(displayOnlyDefined(window.styles[elid].gradientcode))
  $(".set-shadow-code").val(displayOnlyDefined(window.styles[elid].shadowcode))


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
    displayCSSChunk("width", window.styles[elid].width) + 
    displayCSSChunk("height", window.styles[elid].height) + 
    displayCSSChunk("top", window.styles[elid].top) + 
    displayCSSChunk("left", window.styles[elid].left) + 
    displayCSSChunk("font-family", window.styles[elid].fontfamily) + 
    displayCSSChunk("font-size", window.styles[elid].fontsize) + 
    displayCSSChunk("line-height", window.styles[elid].lineheight) + 
    displayCSSChunk("font-weight", window.styles[elid].fontweight) + 
    displayCSSChunk("text-align", window.styles[elid].textalign) + 
    displayCSSChunk("color", window.styles[elid].color) + 
    displayCSSChunk("border-radius", window.styles[elid].borderradius) +
    displayCSSChunk("border", window.styles[elid].border) +  
    displayCSSChunk("border-color", window.styles[elid].bordercolor) + 
    displayCSSChunk("margin", window.styles[elid].margin) + 
    displayCSSChunk("padding", window.styles[elid].padding) + 
    displayCSSChunk("opacity", window.styles[elid].opacity) + 
    displayCSSChunk("background-color", window.styles[elid].backgroundcolor) + 
    displayCSSChunk(false, window.styles[elid].gradientcode) + 
    displayCSSChunk(false, window.styles[elid].shadowcode) +
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

makeActive = (div, exclusive) ->
  if exclusive == undefined or exclusive == true 
    $(".el-active").removeClass("el-active")
  div.addClass("el-active")

  if div.data("ingroup")
    $(".el[data-ingroup='"+div.data("ingroup")+"']").addClass("el-active")

  if window.styles[div.data("elid")] != undefined
    jsonToPanel div
    jsonToClass div
  else
    panelToJSON div
    jsonToClass div

updateClasses = (div) ->
  classes = div.attr("class").split(" ")
  classesString = ""
  ignoreClass = ["el", "el-box",  "el-active", "ui-draggable", "ui-draggable-dragging", "ui-resizable"]
  for c in classes
    if ignoreClass.indexOf(c) <= -1
      classesString += c + " "

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