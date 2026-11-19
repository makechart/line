# Change Logs

## v0.0.6

 - reset tint in `parse`, so colors used by the sample data don't push real series onto interpolated
   colors ( same as pie / percent-list ). without this a 4-color palette on 4 series silently ends up
   with 4 interpolated colors instead of the declared ones


## v0.0.5

 - resize handling moves to `@plotdb/chart` ( needs >= 3.9.1 ): renders triggered by container resize
   run with `anim.immediate`, so the chart's own `@box` size check is removed. with an older
   `@plotdb/chart`, lines / dots lag behind the axes again while dragging


## v0.0.4

 - fix bug: dots didn't transition with lines ( `cx` / `cy` were set directly ); new dots are
   placed in position on enter instead of flying in from 0
 - resizing the container renders lines / dots immediately, consistent with the axes. tweening on
   every resize frame restarted the ease-in each frame, so lines lagged until dragging stopped.
   data / config changes still transition


## v0.0.3

 - extend the lite base ( `@makechart/base` `lite/index.html`, no d3 ): needs `@makechart/base` >= 0.2.0
   and `@plotdb/chart` >= 3.7.0. scales / shapes / transitions use `chart.utils`, and transitions run on
   `chart.anim`, so animation can be recorded frame by frame ( `anim.manual` / `step` )
 - fix bug: `.transition 150` didn't set the duration
 - add test cases ( `test/index.ls`, run with `npm test` via `@makechart/viewer` )


## v0.0.2

 - brush ( `cfg.brush.enabled`, off by default ): dragging horizontally emits a range filter on
   the `order` dimension. a month or value axis has far too many distinct values to enumerate,
   and next month's data would invalidate the list anyway
 - legend crossfilter ( `cfg.legend.crossfilter` ): the legend picks series, which is the
   `value` dimension — a different field from the data points' `order`, so both can be active
   at the same time. `mod.filterDims` declares both
 - support subset presentation: `shrink` and `partial`. partial is limited to plain line /
   area — stack, bump, diff and streamgraph are left alone
 - brush sync: the box is not re-aligned when it already means the same range, so the box the
   user dragged stays where it was dropped; the half-cell padding is clamped inside the view,
   so a range touching the first or last point no longer draws outside the axis; and render
   only pushes the brush when the binding actually carries a range — otherwise the render
   triggered by `setRaw` cleared the box and the `filter` right after it redrew the box
   somewhere else


## v0.0.2 (upcoming)

 - support order config with `series 1`, `series 2` and `diff` in diff mode
 - fix bug: line.cap doesn't work after initialized


## v0.0.1

init release
