# line 的 test case ( @makechart/viewer 的 mctest )
mk = (n = 4, len = 12, opt = {}) ->
  rnd = mctest.random (opt.seed or (n * 100 + len))
  raw: [0 til len].map (o) ->
    r = {order: 2000 + o}
    for i from 1 to n => r["v#i"] = Math.round(50 + rnd! * 100)
    if opt.gap and o in [4 5] => r.v1 = ''
    r
  binding:
    value: [1 to n].map -> {key: "v#it", name: "S#it"}
    order: {key: \order}
with-subset = (d) ->
  r = mctest.random 42
  d.subset = d.raw.map (row) ->
    ret = {} <<< row
    for k of row => if k != \order => ret[k] = Math.round(row[k] * r!)
    ret
  d

mctest.suite do
  size: [560, 340]
  data:
    four: mk 4
    two: mk 2
    one: mk 1
    gap: mk 3, 12, {gap: true}
    subset: with-subset mk 3
  cases:
    * name: "line", data: \four
    * name: "line:curve", data: \four, config: {line: {mode: \curve}}
    * name: "area", data: \four, config: {mode: \area}
    * name: "area:stack", data: \four, config: {mode: \area, stack: true}
    * name: "area:percent", data: \four, config: {mode: \area, stack: true, area: {percent: true}}
    * name: "streamgraph", data: \four, config: {mode: \streamgraph}
    * name: "bump", data: \four, config: {mode: \bump}
    * name: "diff", data: \two, config: {mode: \diff}
    * name: "single", data: \one
    * name: "gap", data: \gap
    * name: "gap:curve", data: \gap, config: {line: {mode: \curve}}
    * name: "dot:off", data: \four, config: {dot: {show: false}}
    * name: "partial", data: \subset, config: {common: {subset: {mode: \partial}}}
    * name: "legend:dim", data: \four, config: {legend: {subset: {mode: \dim}}}
      steps: (c) ->
        c.legend.select <[v1 v3 v4]>
        c.bind!; c.resize!; c.render!
    * name: "brush:external", data: \four, config: {brush: {enabled: true}}
      steps:
        * (c, ctx) ->
            c.filter {order: {type: \range, value: [2003, 2006]}}
            ctx.snap \filtered
        * (c) -> c.filter {order: undefined}
    * name: "brush:drag", data: \four, config: {brush: {enabled: true}}
      steps:
        * (c, ctx) ->
            c._f = []
            c.on \filter, -> c._f.push it
            ctx.drag ctx.root.querySelector('rect.overlay'), [0.2, 0.5], [0.6, 0.5]
        * (c) ->
            f = c._f[* - 1]
            if !(f and f.order and f.order.type == \range) => throw new Error("drag 之後沒有發 range filter")
    * name: "update", data: \four, steps: (c) -> d = mk 3, 8, {seed: 5}; c.set-raw d.raw, d.binding

# lite 版才有: anim 的 manual 時鐘拍動畫中間格
mctest.suite do
  size: [560, 340]
  data: {four: mk(4)}
  cases:
    * name: "anim:update-frames", data: \four
      steps: (c, ctx) ->
        d = mk 4, 12, {seed: 77}
        c.set-raw d.raw, d.binding
        for i from 1 to 3
          c.anim.step 50
          ctx.capture "t#{i * 50}"
