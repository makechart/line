# Change Logs

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
