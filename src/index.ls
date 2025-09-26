module.exports =
  pkg:
    name: 'line', version: '0.0.1'
    extend: {name: "base", version: "0.0.1"}
    dependencies: []
    i18n:
      "zh-TW":
        "y axis": "Y軸"
        "x axis": "X軸"
        "rank": "順位"

  init: ({root, context, pubsub, t}) ->
    pubsub.fire \init, mod: mod {context, t}

mod = ({context, t}) ->
  {d3,chart,axis,format} = context
  sample-count = 4
  sample: ->
    raw: [0 to 20].map (val) ~>
      ret = {}
      [1 to sample-count].map (i) ->
        ret["val#i"] = 100 + +(i * Math.random! * (10 - Math.abs(10 - val)) + val).toFixed(2) >? 0.1
        ret["val#i"] = (ret["val#i"]).toFixed(2)
      ret.order = val
      ret
    binding:
      value: [1 to sample-count].map -> {key: "val#it"}
      order: {key: \order}
  config: chart.utils.config.from({
    preset: \default
    legend: \legend
    label: \label
    xaxis: \axis
    tip: \tip
  }) <<<
    yaxis: chart.utils.config.from({preset: \axis}) <<<
      cutoff: type: \number, default: 0, min: 0, max: 100, step: 0.5
    mode: type: \choice, values: <[line area streamgraph bump diff]>, default: \line
    stack: type: \boolean
    area:
      opacity: type: \number, default: 0.5, min: 0.01, max: 1, step: 0.01
      offset: type: \number, default: 0, min: 0, max: 1, step: 0.01
      percent: type: \boolean, default: false
    line:
      mode: type: \choice, values: <[curve linear]>, default: \linear
      stroke-width: type: \number, default: 1, min: 0, max: 100, step: 0.5
      cap: type: \choice, values: <[butt round square]>, default: \round
      join: type: \choice, values: <[bevel miter round]>, default: \round
    diff:
      positive: type: \color, default: \#09f
      negative: type: \color, default: \#f90
    dot:
      show: type: \boolean, default: true
      stroke-width: type: \number, default: 1, min: 0, max: 100, step: 0.5
      fill:
        type: \color, default: \auto, presets: <[auto]>
        i18n: en: {"auto": "Auto"}, "zh-TW": {"auto": "自動"}
      size: type: \number, default: 3, min: 1, max: 100, step: 0.5
  dimension:
    value: {type: \R, name: "y axis", multiple: true}
    order: {type: \ON, name: "x axis"}
  init: ->
    svg = d3.select @svg
    <[yaxis xaxis view legend]>.map ~> @{}g[it] = d3.select(@layout.get-group(it))
    <[diff line dot]>.map ~> @g[it] = @g.view.append \g
    @tint = tint = new chart.utils.tint!
    @line = d3.line!
      .defined ~>
        !isNaN(it.y1)
      .x ~> @scale.x it.x
      .y ~> @scale.y it.y1
    @area = d3.area!
      .defined ~>
        !isNaN(it.y1) and !isNaN(it.y0)
      .x ~> @scale.x it.x
      .y0 ~> @scale.y it.y0
      .y1 ~> @scale.y it.y1
    @xaxis = new chart.utils.axis layout: @layout, name: \xaxis, direction: \bottom
    @yaxis = new chart.utils.axis layout: @layout, name: \yaxis, direction: \left
    @tip = new chart.utils.tip {
      root: @root,
      range: ~> return @layout.get-node \view .getBoundingClientRect!
    }
    @_evthdr = {}
    @root.addEventListener \mouseout, @_evthdr.out = (evt) ~> @tip.hide!now!
    @root.addEventListener \mousemove, @_evthdr.move = (evt) ~>
      x = evt.clientX - @layout.get-node(\view).getBoundingClientRect!x
      y = evt.clientY - @layout.get-node(\view).getBoundingClientRect!y
      if @cfg.mode == \streamgraph =>
        series = d3.select(evt.target).datum!
        if !(series and series.pts) => return
        bind = series.bind
        min = {d: -1, p: null}
        for j from 0 til series.pts.length =>
          p = series.pts[j]
          if isNaN(p.y1) or isNaN(p.x) => continue
          dx = Math.abs(@scale.x(p.x) - x)
          if min.d < 0 or min.d > dx => min <<< {d: dx, p}
        pt = min.p
      else
        min = {d: -1, p: null, series: null}
        for i from 0 til @parsed.length =>
          series = @parsed[i]
          for j from 0 til series.pts.length =>
            p = series.pts[j]
            if isNaN(p.y1) or isNaN(p.x) => continue
            dx = Math.abs(@scale.x(p.x) - x)
            dy = Math.abs(@scale.y(p.y1) - y)
            d = (dx ** 2) + (dy ** 2)
            if min.d < 0 or min.d > d => min <<< {d, p, series}
        if !(min.p and min.d and min.series) => return
        bind = min.series.bind
        pt = min.p

      data = {
        name: """#{if bind => bind.name or bind.key or ''} /
        #{pt.data.orderText or pt.data.order or pt.x}#{(@binding.order or {}).unit or ''}
        """
        value: if isNaN(pt.v) => '-' else "#{@fmt pt.v}#{if bind => (bind.unit or '') else ''}"
      }
      box = x: @scale.x(pt.x), y: @scale.y(pt.y)
      @tip.render {data, evt: evt, box}

    @legend = new chart.utils.legend do
      layout: @layout
      root: @root
      name: \legend
      shape: (d) -> d3.select(@).attr \fill, tint.get d.text
      direction: \vertical
      cfg: selectable: true
    @legend.on \select, ~> @bind!; @resize!; @render!
    @scale = { x: d3.scaleLinear!, y: d3.scaleLinear! }

  destroy: ->
    @root.removeEventListener \mouseout, @_evthdr.out
    @root.removeEventListener \mousemove, @_evthdr.move
    @tip.destroy!

  parse: ->
    @data.map (d,i) ->
      d.order-text = '' + (if !(d.order?) => i else d.order)
      d._order = if !(d.order?) or isNaN(+d.order) => i else +d.order
    @data.sort (a,b) -> if a._order > b._order => 1 else if a._order == b._order => 0 else -1

  bind: ->
    @legend.config({} <<< @cfg.legend <<< (if @cfg.mode == \diff => {selectable: false} else {}))
    bind-value = @binding.value or []
    @legend.data(
      (
        if @cfg.mode == \diff => [bind-value.0, bind-value.1].filter(-> it)
        else @binding.value or []
      ).map -> {key: it.key, text: it.key}
    )
    binds = bind-value.map((b,i) -> {b, i}).filter (d,i) ~> @legend.is-selected d.b.key

    # if bump
    if @cfg.mode == \bump =>
      @parsed = []
      dd = @data.map (d) ~>
        ret = {} <<< d
        v = ret.value.map (d,i) ~> {i: i, v: if @legend.is-selected(@binding.value[i].key) => d else NaN}
        v.sort (a,b) ->
          if isNaN(a.v) and isNaN(b.v) => return 0
          else if isNaN(b.v) => return -1
          else if isNaN(a.v) => return 1
          return b.v - a.v
        v.map (d,i) -> d.r = i + 1
        v.sort (a,b) -> a.i - b.i
        ret.value = v.map ->
          # there is a rank even if v is NaN ...
          it.r
          # or alternatively, dont show rank for a NaN value.
          #if isNaN(it.v) => NaN else it.r
        ret.original-value = v.map -> it.v
        ret

    dd = dd or @data

    if @cfg.mode == \streamgraph =>
      sums = dd.map (d) ->
        sum = 0
        for i from 0 til d.value.length => sum += d.value[i]
        sum
      [smin, smax] = [Math.min.apply(Math, sums), Math.max.apply(Math, sums)]
    else
      [sums, smin, smax] = [dd.map(-> 0), 0, 0]
    @parsed = []
    line0 = dd.map -> 0
    # 100% stacked area chart
    if @cfg.mode == \area and @cfg.stack and @cfg.area.percent =>
      sum = dd.map (d) -> binds.reduce(((a,b) -> a + d.value[b.i]),0) or 1
    else
      sum = dd.map -> 1
    for i from 0 til binds.length =>
      [p,b] = [(if i > 0 => binds[i - 1] else null), binds[i]]
      line1 = dd.map (d,j) -> line0[j] + (d.value[b.i]/sum[j])
      @parsed.push {
        pts: (dd or @data).map (d,j) ->
          data: d
          y0: line0[j] - (sums[j] / 2) + (smax - smin) / 2
          y1: line1[j] - (sums[j] / 2) + (smax - smin) / 2
          x: d._order
          v: if d.original-value => d.original-value[b.i] else d.value[b.i]
        bind: b.b
        color: b.b.name or b.b.key
      }
      if (@cfg.stack and !(@cfg.mode in <[bump diff]>)) or (@cfg.mode in <[streamgraph]>) => line0 = line1

    # for difference chart
    @bars = []
    if @cfg.mode == \diff =>
      for i from 0 til dd.length =>
        d = dd[i]
        [yl, yh] = if !(d.value?) => [undefined, undefined]
        else if d.value.1 > d.value.0 => [d.value.0, d.value.1]
        else [d.value.1, d.value.0]
        if isNaN(yl) or isNaN(yh) => continue
        @bars.push {y0: d.value.0, y1: d.value.1, yl, yh, x: d._order}
      @parsed = if !@parsed.1 => [] else [@parsed.0, @parsed.1]

  resize: ->
    @fmt = chart.utils.format.from @cfg.label.format
    @root.querySelector('.pdl-layout').classList.toggle \legend-bottom, @cfg.legend.position == \bottom
    # ensure dot rendered inside canvas
    view-node = @root.querySelector('.pdl-layout div[data-type=layout]')
    view-node.style.padding = "#{Math.max(@cfg.dot.size + @cfg.dot.strokeWidth/2, @cfg.line.strokeWidth/2)}px"
    @line.curve if @cfg.line.mode == \curve => d3.curveCatmullRom else d3.curveLinear
    @area.curve if @cfg.line.mode == \curve => d3.curveCatmullRom else d3.curveLinear
    @tip.toggle(if @cfg.{}tip.enabled? => @cfg.tip.enabled else true)
    [miny,maxy] = [NaN,NaN]
    for i from 0 til @parsed.length =>
      for j from 0 til @parsed[i].pts.length =>
        p = @parsed[i].pts[j]
        if !(@cfg.mode in <[line diff]>) =>
          if !isNaN(p.y0) and (miny > p.y0 or isNaN(miny)) => miny = p.y0
        if !isNaN(p.y1) and (miny > p.y1 or isNaN(miny)) => miny = p.y1
        if !isNaN(p.y0) and (maxy < p.y0 or isNaN(maxy)) => maxy = p.y0
        if !isNaN(p.y1) and (maxy < p.y1 or isNaN(maxy)) => maxy = p.y1
    if isNaN(miny) => miny = 0
    if isNaN(maxy) => maxy = 0
    if @cfg.mode in <[line diff]> =>
      if miny > 0 => miny = miny * (@cfg.yaxis.cutoff or 0) / 100
      if maxy < 0 => maxy = maxy * (@cfg.yaxis.cutoff or 0) / 100
    @extent =
      x: d3.extent @data, -> (it._order)
      y: [
        if @cfg.mode == \bump => miny >? 1 else miny,
        if @cfg.mode == \bump => @parsed.length or 1
        else if maxy == miny => miny + 1
        else maxy
      ]

    @scale.x.domain @extent.x
    @scale.y.domain (if @cfg.mode == \bump => [@extent.y.1, @extent.y.0] else @extent.y)

    max-tick = Math.ceil(@layout.get-box \yaxis .height / 40) >? 2
    yticks = if @cfg.mode == \bump => [1 to ((@parsed.length or 1) >? 1)]
    else @scale.y.ticks((@cfg.{}yaxis.tick.count or 4) <? max-tick)
    yfmt = chart.utils.format.auto yticks

    @legend.config({} <<< @cfg.legend <<< (if @cfg.mode == \diff => {selectable: false} else {}))
    @legend.update!

    @yaxis.config @cfg.yaxis
    @yaxis.ticks yticks
    @yaxis.scale @scale.y
    if @cfg.mode == \bump =>
      @yaxis.caption t \rank
    else
      if @parsed.length > 1 =>
        units = Array.from(new Set(@parsed.map -> it.bind.unit)).filter -> it
        if units.length > 1 => @yaxis.caption('')
        else @yaxis.caption( units.0 or '')
      else
        v = (@parsed.0 or {}).bind or {}
        @yaxis.caption( (v.name or v.key or '') + if v.unit => "(#{v.unit})" else '')

    @xaxis.config @cfg.xaxis
    @xaxis.ticks @data.map -> {v: it._order, t: it.order-text}
    @xaxis.scale @scale.x
    @xaxis.caption(
      if @binding.order =>
        ((that.name or that.key or '') + (if @binding.order.unit => "(#{@binding.order.unit})" else ''))
      else ''
    )

    # xaxis and yaxis affect each other and they all affect view.
    # we may need to update them until stable but for now we simply layout twice.
    for i from 0 til 2 =>
      @layout.update false
      box = @layout.get-box('view')
      [w,h] = [box.width, box.height]
      @tint.set @cfg.palette
      r = @cfg.dot.size + @cfg.dot.strokeWidth
      offset = if !@cfg.stack and @cfg.mode == \area => @cfg.area.offset else 0
      @scale.x.range [0, w - r]
      @scale.y.range [h, h * offset]
      @xaxis.render!
      @yaxis.render!

  render: ->
    {scale,tint,extent,cfg} = @
    r = @cfg.dot.size
    vbox = @layout.get-box \view
    lbox = @layout.get-box \yaxis
    yseg = @parsed.length >? 1
    yoffset = if !@cfg.stack and @cfg.mode == \area => (@box.height - @cfg.dot.size) * @cfg.area.offset else 0

    @g.diff.selectAll \line.data .data(@bars)
      ..exit!remove!
      ..enter!append \line .attr \class, \data
        .attr \x1, (d,i) -> scale.x d.x
        .attr \x2, (d,i) -> scale.x d.x
        .attr \y1, (d,i) -> scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl)) / 2
        .attr \y2, (d,i) -> scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl)) / 2
        .attr \stroke-linecap, cfg.line.cap
        .attr \opacity, 0

    @g.diff.selectAll \line.data
      .transition!duration 150
      .attr \x1, (d,i) -> scale.x d.x
      .attr \x2, (d,i) -> scale.x d.x
      .attr \y1, (d,i) -> scale.y d.yh
      .attr \y2, (d,i) -> scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl))
      .attr \stroke, (d,i) -> if (d.y1 > d.y0) > 0 => cfg.diff.positive else cfg.diff.negative
      .attr \stroke-width, cfg.line.stroke-width
      .attr \opacity, 1

    p = [@parsed[i] for i from @parsed.length - 1 to 0 by -1]
    @g.line.selectAll \path.data .data((if @cfg.mode == \diff => [] else p), -> it.bind.key)
      ..exit!remove!
      ..enter!append \path .attr \class, \data
        .attr \fill, \none
        .attr \d, (d,i) ~>
          if @cfg.mode in <[streamgraph area]> => @area d.pts
          else @line d.pts
        .attr \stroke, (d,i) ~> @tint.get d.color
        .attr \stroke-width, cfg.line.stroke-width
    @g.line.selectAll \path.data
      .transition!duration 150
      .attr \transform, (d,i) -> "translate(0,-#{(yseg - i - 1) * yoffset / yseg})"
      .style \opacity, (d,i) ~> if @legend.is-selected(d.bind.key) => 1 else 0.3
      .attr \d, (d,i) ~>
        if @cfg.mode in <[streamgraph area]> => @area d.pts
        else @line d.pts
      .attr \stroke, (d,i) ~> @tint.get d.color
      .attr \stroke-width, cfg.line.stroke-width
      .attr \fill, (d,i) ~> if @cfg.mode in <[streamgraph area]> => @tint.get(d.color) else \none
      .attr \fill-opacity, cfg.area.opacity
      .attr \stroke-linecap, cfg.line.cap
      .attr \stroke-linejoin, cfg.line.join

    dot-data = if !@cfg.dot.show => [] else @parsed
    @g.dot.selectAll \g.dot .data(dot-data, -> it.bind.key)
      ..exit!remove!
      ..enter!append \g .attr \class, \dot
    @g.dot.selectAll \g.dot
      .style \opacity, (d,i) ~> if @legend.is-selected(d.bind.key) => 1 else 0.3
      .each (d,j) ->
        # old dot.fill is of type `boolean` which controls if we should fill or not
        # new config provides color with customized `auto` value,
        # indicating use the value of corresponding line automatically.
        fill = if typeof(cfg.dot.fill) == \bool or !(cfg.dot.fill?) or cfg.dot.fill == \auto =>
          if cfg.dot.fill => tint.get(d.color) else cfg.background
        else cfg.dot.fill
        d3.select(@).selectAll \circle.dot .data d.pts
          ..exit!remove!
          ..enter!append \circle .attr \class, \dot
            .attr \r, r
            .attr \fill, fill
            .attr \stroke, tint.get(d.bind.name or d.bind.key)
            .attr \stroke-width, cfg.dot.stroke-width
        d3.select(@).selectAll \circle.dot
          .filter (d,i) -> isNaN d.y1
          .attr \cx, (d,i) -> if isNaN(scale.x d.x) => scale.x(extent.x.0) else scale.x(d.x)
          .attr \cy, (d,i) -> scale.y(extent.y.0) # - (yseg - j - 1) * yoffset / yseg
          .transition 150
          .attr \opacity, 0
        d3.select(@).selectAll \circle.dot
          .filter (d,i) -> !isNaN d.y1
          .attr \cx, (d,i) -> scale.x d.x
          .attr \cy, (d,i) -> scale.y(d.y1) - j * yoffset / yseg
          .attr \r, r
          .attr \fill, fill
          .attr \stroke, tint.get d.color
          .attr \stroke-width, cfg.dot.stroke-width
          .transition 150
          .attr \opacity, 1

    @legend.render!
    @xaxis.render!
    @yaxis.render!
