$.ui.plugin.add "draggable", "alsoDrag",
  start: ->
    that = $(this).data("ui-draggable")
    o = that.options
    _store = (exp) ->
      $(exp).each () ->
        el = $(this)
        el.data "ui-draggable-alsoDrag",
          top: parseInt(el.css("top"), 10)
          left: parseInt(el.css("left"), 10)
        return
      return

    if typeof (o.alsoDrag) is "object" and not o.alsoDrag.parentNode
      if o.alsoDrag.length
        o.alsoDrag = o.alsoDrag[0]
        _store o.alsoDrag
      else
        $.each o.alsoDrag, (exp) ->
          _store exp
          return

    else
      _store o.alsoDrag
    return

  drag: ->
    that = $(this).data("ui-draggable")
    o = that.options
    os = that.originalSize
    op = that.originalPosition
    delta =
      top: (that.position.top - op.top) or 0
      left: (that.position.left - op.left) or 0

    _alsoDrag = (exp, c) ->

      $(exp).each ->
        el = $(this)
        start = $(this).data("ui-draggable-alsoDrag")
        style = {}
        css = [
          "top"
          "left"
        ]
        $.each css, (i, prop) ->
          sum = (start[prop] or 0) + (delta[prop] or 0)
          style[prop] = sum or null
          return

        el.css style
        return

      return

    if typeof (o.alsoDrag) is "object" and not o.alsoDrag.nodeType
      $.each o.alsoDrag, (exp, c) ->
        _alsoDrag exp, c
        return

    else
      _alsoDrag o.alsoDrag
    return

  stop: ->
    $(this).removeData "ui-draggable-alsoDrag"
    return
