(function(){
  var mod;
  module.exports = {
    pkg: {
      name: 'line',
      version: '0.0.1',
      extend: {
        name: "base",
        version: "0.0.1"
      },
      dependencies: [],
      i18n: {
        "zh-TW": {
          "y axis": "Y軸",
          "x axis": "X軸",
          "rank": "順位"
        }
      }
    },
    init: function(arg$){
      var root, context, pubsub, t;
      root = arg$.root, context = arg$.context, pubsub = arg$.pubsub, t = arg$.t;
      return pubsub.fire('init', {
        mod: mod({
          context: context,
          t: t
        })
      });
    }
  };
  mod = function(arg$){
    var context, t, d3, chart, axis, format, sampleCount, ref$, ref1$;
    context = arg$.context, t = arg$.t;
    d3 = context.d3, chart = context.chart, axis = context.axis, format = context.format;
    sampleCount = 4;
    return {
      sample: function(){
        return {
          raw: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(function(val){
            var ret;
            ret = {};
            (function(){
              var i$, to$, results$ = [];
              for (i$ = 1, to$ = sampleCount; i$ <= to$; ++i$) {
                results$.push(i$);
              }
              return results$;
            }()).map(function(i){
              var ref$;
              ret["val" + i] = (ref$ = 100 + +(i * Math.random() * (10 - Math.abs(10 - val)) + val).toFixed(2)) > 0.1 ? ref$ : 0.1;
              return ret["val" + i] = ret["val" + i].toFixed(2);
            });
            ret.order = val;
            return ret;
          }),
          binding: {
            value: (function(){
              var i$, to$, results$ = [];
              for (i$ = 1, to$ = sampleCount; i$ <= to$; ++i$) {
                results$.push(i$);
              }
              return results$;
            }()).map(function(it){
              return {
                key: "val" + it
              };
            }),
            order: {
              key: 'order'
            }
          }
        };
      },
      config: (ref$ = chart.utils.config.from({
        preset: 'default',
        legend: 'legend',
        label: 'label',
        xaxis: 'axis',
        tip: 'tip'
      }), ref$.yaxis = (ref1$ = chart.utils.config.from({
        preset: 'axis'
      }), ref1$.cutoff = {
        type: 'number',
        'default': 0,
        min: 0,
        max: 100,
        step: 0.5
      }, ref1$), ref$.mode = {
        type: 'choice',
        values: ['line', 'area', 'streamgraph', 'bump', 'diff'],
        'default': 'line'
      }, ref$.stack = {
        type: 'boolean'
      }, ref$.area = {
        opacity: {
          type: 'number',
          'default': 0.5,
          min: 0.01,
          max: 1,
          step: 0.01
        },
        offset: {
          type: 'number',
          'default': 0,
          min: 0,
          max: 1,
          step: 0.01
        },
        percent: {
          type: 'boolean',
          'default': false
        }
      }, ref$.line = {
        mode: {
          type: 'choice',
          values: ['curve', 'linear'],
          'default': 'linear'
        },
        strokeWidth: {
          type: 'number',
          'default': 1,
          min: 0,
          max: 100,
          step: 0.5
        },
        cap: {
          type: 'choice',
          values: ['butt', 'round', 'square'],
          'default': 'round'
        },
        join: {
          type: 'choice',
          values: ['bevel', 'miter', 'round'],
          'default': 'round'
        }
      }, ref$.diff = {
        positive: {
          type: 'color',
          'default': '#09f'
        },
        negative: {
          type: 'color',
          'default': '#f90'
        }
      }, ref$.dot = {
        show: {
          type: 'boolean',
          'default': true
        },
        strokeWidth: {
          type: 'number',
          'default': 1,
          min: 0,
          max: 100,
          step: 0.5
        },
        fill: {
          type: 'color',
          'default': 'auto',
          presets: ['auto'],
          i18n: {
            en: {
              "auto": "Auto"
            },
            "zh-TW": {
              "auto": "自動"
            }
          }
        },
        size: {
          type: 'number',
          'default': 3,
          min: 1,
          max: 100,
          step: 0.5
        }
      }, ref$),
      dimension: {
        value: {
          type: 'R',
          name: "y axis",
          multiple: true
        },
        order: {
          type: 'ON',
          name: "x axis"
        }
      },
      init: function(){
        var svg, tint, this$ = this;
        svg = d3.select(this.svg);
        ['yaxis', 'xaxis', 'view', 'legend'].map(function(it){
          return (this$.g || (this$.g = {}))[it] = d3.select(this$.layout.getGroup(it));
        });
        ['diff', 'line', 'dot'].map(function(it){
          return this$.g[it] = this$.g.view.append('g');
        });
        this.tint = tint = new chart.utils.tint();
        this.line = d3.line().defined(function(it){
          return !isNaN(it.y1);
        }).x(function(it){
          return this$.scale.x(it.x);
        }).y(function(it){
          return this$.scale.y(it.y1);
        });
        this.area = d3.area().defined(function(it){
          return !isNaN(it.y1) && !isNaN(it.y0);
        }).x(function(it){
          return this$.scale.x(it.x);
        }).y0(function(it){
          return this$.scale.y(it.y0);
        }).y1(function(it){
          return this$.scale.y(it.y1);
        });
        this.xaxis = new chart.utils.axis({
          layout: this.layout,
          name: 'xaxis',
          direction: 'bottom'
        });
        this.yaxis = new chart.utils.axis({
          layout: this.layout,
          name: 'yaxis',
          direction: 'left'
        });
        this.tip = new chart.utils.tip({
          root: this.root,
          range: function(){
            return this$.layout.getNode('view').getBoundingClientRect();
          }
        });
        this._evthdr = {};
        this.root.addEventListener('mouseout', this._evthdr.out = function(evt){
          return this$.tip.hide().now();
        });
        this.root.addEventListener('mousemove', this._evthdr.move = function(evt){
          var x, y, series, bind, min, i$, to$, j, p, dx, pt, i, j$, to1$, dy, d, data, box;
          x = evt.clientX - this$.layout.getNode('view').getBoundingClientRect().x;
          y = evt.clientY - this$.layout.getNode('view').getBoundingClientRect().y;
          if (this$.cfg.mode === 'streamgraph') {
            series = d3.select(evt.target).datum();
            if (!(series && series.pts)) {
              return;
            }
            bind = series.bind;
            min = {
              d: -1,
              p: null
            };
            for (i$ = 0, to$ = series.pts.length; i$ < to$; ++i$) {
              j = i$;
              p = series.pts[j];
              if (isNaN(p.y1) || isNaN(p.x)) {
                continue;
              }
              dx = Math.abs(this$.scale.x(p.x) - x);
              if (min.d < 0 || min.d > dx) {
                min.d = dx;
                min.p = p;
              }
            }
            pt = min.p;
          } else {
            min = {
              d: -1,
              p: null,
              series: null
            };
            for (i$ = 0, to$ = this$.parsed.length; i$ < to$; ++i$) {
              i = i$;
              series = this$.parsed[i];
              for (j$ = 0, to1$ = series.pts.length; j$ < to1$; ++j$) {
                j = j$;
                p = series.pts[j];
                if (isNaN(p.y1) || isNaN(p.x)) {
                  continue;
                }
                dx = Math.abs(this$.scale.x(p.x) - x);
                dy = Math.abs(this$.scale.y(p.y1) - y);
                d = Math.pow(dx, 2) + Math.pow(dy, 2);
                if (min.d < 0 || min.d > d) {
                  min.d = d;
                  min.p = p;
                  min.series = series;
                }
              }
            }
            if (!(min.p && min.d && min.series)) {
              return;
            }
            bind = min.series.bind;
            pt = min.p;
          }
          data = {
            name: (bind ? bind.name || bind.key || '' : void 8) + " /\n" + (pt.data.orderText || pt.data.order || pt.x) + ((this$.binding.order || {}).unit || ''),
            value: isNaN(pt.v)
              ? '-'
              : this$.fmt(pt.v) + "" + (bind ? bind.unit || '' : '')
          };
          box = {
            x: this$.scale.x(pt.x),
            y: this$.scale.y(pt.y)
          };
          return this$.tip.render({
            data: data,
            evt: evt,
            box: box
          });
        });
        this.legend = new chart.utils.legend({
          layout: this.layout,
          root: this.root,
          name: 'legend',
          shape: function(d){
            return d3.select(this).attr('fill', tint.get(d.text));
          },
          direction: 'vertical',
          cfg: {
            selectable: true
          }
        });
        this.legend.on('select', function(){
          this$.bind();
          this$.resize();
          return this$.render();
        });
        return this.scale = {
          x: d3.scaleLinear(),
          y: d3.scaleLinear()
        };
      },
      destroy: function(){
        this.root.removeEventListener('mouseout', this._evthdr.out);
        this.root.removeEventListener('mousemove', this._evthdr.move);
        return this.tip.destroy();
      },
      parse: function(){
        this.data.map(function(d, i){
          d.orderText = '' + (!(d.order != null)
            ? i
            : d.order);
          return d._order = !(d.order != null) || isNaN(+d.order)
            ? i
            : +d.order;
        });
        return this.data.sort(function(a, b){
          if (a._order > b._order) {
            return 1;
          } else if (a._order === b._order) {
            return 0;
          } else {
            return -1;
          }
        });
      },
      bind: function(){
        var bindValue, binds, dd, sums, ref$, smin, smax, line0, sum, i$, to$, i, p, b, line1, d, yl, yh, this$ = this;
        this.legend.config(import$(import$({}, this.cfg.legend), this.cfg.mode === 'diff'
          ? {
            selectable: false
          }
          : {}));
        bindValue = this.binding.value || [];
        this.legend.data((this.cfg.mode === 'diff'
          ? [bindValue[0], bindValue[1]].filter(function(it){
            return it;
          })
          : this.binding.value || []).map(function(it){
          return {
            key: it.key,
            text: it.key
          };
        }));
        binds = bindValue.map(function(b, i){
          return {
            b: b,
            i: i
          };
        }).filter(function(d, i){
          return this$.legend.isSelected(d.b.key);
        });
        if (this.cfg.mode === 'bump') {
          this.parsed = [];
          dd = this.data.map(function(d){
            var ret, v;
            ret = import$({}, d);
            v = ret.value.map(function(d, i){
              return {
                i: i,
                v: this$.legend.isSelected(this$.binding.value[i].key) ? d : NaN
              };
            });
            v.sort(function(a, b){
              if (isNaN(a.v) && isNaN(b.v)) {
                return 0;
              } else if (isNaN(b.v)) {
                return -1;
              } else if (isNaN(a.v)) {
                return 1;
              }
              return b.v - a.v;
            });
            v.map(function(d, i){
              return d.r = i + 1;
            });
            v.sort(function(a, b){
              return a.i - b.i;
            });
            ret.value = v.map(function(it){
              return it.r;
            });
            ret.originalValue = v.map(function(it){
              return it.v;
            });
            return ret;
          });
        }
        dd = dd || this.data;
        if (this.cfg.mode === 'streamgraph') {
          sums = dd.map(function(d){
            var sum, i$, to$, i;
            sum = 0;
            for (i$ = 0, to$ = d.value.length; i$ < to$; ++i$) {
              i = i$;
              sum += d.value[i];
            }
            return sum;
          });
          ref$ = [Math.min.apply(Math, sums), Math.max.apply(Math, sums)], smin = ref$[0], smax = ref$[1];
        } else {
          ref$ = [
            dd.map(function(){
              return 0;
            }), 0, 0
          ], sums = ref$[0], smin = ref$[1], smax = ref$[2];
        }
        this.parsed = [];
        line0 = dd.map(function(){
          return 0;
        });
        if (this.cfg.mode === 'area' && this.cfg.stack && this.cfg.area.percent) {
          sum = dd.map(function(d){
            return binds.reduce(function(a, b){
              return a + d.value[b.i];
            }, 0) || 1;
          });
        } else {
          sum = dd.map(function(){
            return 1;
          });
        }
        for (i$ = 0, to$ = binds.length; i$ < to$; ++i$) {
          i = i$;
          ref$ = [i > 0 ? binds[i - 1] : null, binds[i]], p = ref$[0], b = ref$[1];
          line1 = dd.map(fn$);
          this.parsed.push({
            pts: (dd || this.data).map(fn1$),
            bind: b.b,
            color: b.b.name || b.b.key
          });
          if ((this.cfg.stack && !((ref$ = this.cfg.mode) === 'bump' || ref$ === 'diff')) || this.cfg.mode === 'streamgraph') {
            line0 = line1;
          }
        }
        this.bars = [];
        if (this.cfg.mode === 'diff') {
          for (i$ = 0, to$ = dd.length; i$ < to$; ++i$) {
            i = i$;
            d = dd[i];
            ref$ = !(d.value != null)
              ? [undefined, undefined]
              : d.value[1] > d.value[0]
                ? [d.value[0], d.value[1]]
                : [d.value[1], d.value[0]], yl = ref$[0], yh = ref$[1];
            if (isNaN(yl) || isNaN(yh)) {
              continue;
            }
            this.bars.push({
              y0: d.value[0],
              y1: d.value[1],
              yl: yl,
              yh: yh,
              x: d._order
            });
          }
          return this.parsed = !this.parsed[1]
            ? []
            : [this.parsed[0], this.parsed[1]];
        }
        function fn$(d, j){
          return line0[j] + d.value[b.i] / sum[j];
        }
        function fn1$(d, j){
          return {
            data: d,
            y0: line0[j] - sums[j] / 2 + (smax - smin) / 2,
            y1: line1[j] - sums[j] / 2 + (smax - smin) / 2,
            x: d._order,
            v: d.originalValue
              ? d.originalValue[b.i]
              : d.value[b.i]
          };
        }
      },
      resize: function(){
        var viewNode, ref$, miny, maxy, i$, to$, i, j$, to1$, j, p, maxTick, yticks, ref1$, yfmt, units, v, that, box, w, h, r, offset, results$ = [];
        this.fmt = chart.utils.format.from(this.cfg.label.format);
        this.root.querySelector('.pdl-layout').classList.toggle('legend-bottom', this.cfg.legend.position === 'bottom');
        viewNode = this.root.querySelector('.pdl-layout div[data-type=layout]');
        viewNode.style.padding = Math.max(this.cfg.dot.size + this.cfg.dot.strokeWidth / 2, this.cfg.line.strokeWidth / 2) + "px";
        this.line.curve(this.cfg.line.mode === 'curve'
          ? d3.curveCatmullRom
          : d3.curveLinear);
        this.area.curve(this.cfg.line.mode === 'curve'
          ? d3.curveCatmullRom
          : d3.curveLinear);
        this.tip.toggle(((ref$ = this.cfg).tip || (ref$.tip = {})).enabled != null ? this.cfg.tip.enabled : true);
        ref$ = [NaN, NaN], miny = ref$[0], maxy = ref$[1];
        for (i$ = 0, to$ = this.parsed.length; i$ < to$; ++i$) {
          i = i$;
          for (j$ = 0, to1$ = this.parsed[i].pts.length; j$ < to1$; ++j$) {
            j = j$;
            p = this.parsed[i].pts[j];
            if (!((ref$ = this.cfg.mode) === 'line' || ref$ === 'diff')) {
              if (!isNaN(p.y0) && (miny > p.y0 || isNaN(miny))) {
                miny = p.y0;
              }
            }
            if (!isNaN(p.y1) && (miny > p.y1 || isNaN(miny))) {
              miny = p.y1;
            }
            if (!isNaN(p.y0) && (maxy < p.y0 || isNaN(maxy))) {
              maxy = p.y0;
            }
            if (!isNaN(p.y1) && (maxy < p.y1 || isNaN(maxy))) {
              maxy = p.y1;
            }
          }
        }
        if (isNaN(miny)) {
          miny = 0;
        }
        if (isNaN(maxy)) {
          maxy = 0;
        }
        if ((ref$ = this.cfg.mode) === 'line' || ref$ === 'diff') {
          if (miny > 0) {
            miny = miny * (this.cfg.yaxis.cutoff || 0) / 100;
          }
          if (maxy < 0) {
            maxy = maxy * (this.cfg.yaxis.cutoff || 0) / 100;
          }
        }
        this.extent = {
          x: d3.extent(this.data, function(it){
            return it._order;
          }),
          y: [
            this.cfg.mode === 'bump' ? miny > 1 ? miny : 1 : miny, this.cfg.mode === 'bump'
              ? this.parsed.length || 1
              : maxy === miny ? miny + 1 : maxy
          ]
        };
        this.scale.x.domain(this.extent.x);
        this.scale.y.domain(this.cfg.mode === 'bump'
          ? [this.extent.y[1], this.extent.y[0]]
          : this.extent.y);
        maxTick = (ref$ = Math.ceil(this.layout.getBox('yaxis').height / 40)) > 2 ? ref$ : 2;
        yticks = this.cfg.mode === 'bump'
          ? (function(){
            var i$, to$, ref$, results$ = [];
            for (i$ = 1, to$ = (ref$ = this.parsed.length || 1) > 1 ? ref$ : 1; i$ <= to$; ++i$) {
              results$.push(i$);
            }
            return results$;
          }.call(this))
          : this.scale.y.ticks((ref$ = ((ref1$ = this.cfg).yaxis || (ref1$.yaxis = {})).tick.count || 4) < maxTick ? ref$ : maxTick);
        yfmt = chart.utils.format.auto(yticks);
        this.legend.config(import$(import$({}, this.cfg.legend), this.cfg.mode === 'diff'
          ? {
            selectable: false
          }
          : {}));
        this.legend.update();
        this.yaxis.config(this.cfg.yaxis);
        this.yaxis.ticks(yticks);
        this.yaxis.scale(this.scale.y);
        if (this.cfg.mode === 'bump') {
          this.yaxis.caption(t('rank'));
        } else {
          if (this.parsed.length > 1) {
            units = Array.from(new Set(this.parsed.map(function(it){
              return it.bind.unit;
            }))).filter(function(it){
              return it;
            });
            if (units.length > 1) {
              this.yaxis.caption('');
            } else {
              this.yaxis.caption(units[0] || '');
            }
          } else {
            v = (this.parsed[0] || {}).bind || {};
            this.yaxis.caption((v.name || v.key || '') + (v.unit ? "(" + v.unit + ")" : ''));
          }
        }
        this.xaxis.config(this.cfg.xaxis);
        this.xaxis.ticks(this.data.map(function(it){
          return {
            v: it._order,
            t: it.orderText
          };
        }));
        this.xaxis.scale(this.scale.x);
        this.xaxis.caption((that = this.binding.order) ? (that.name || that.key || '') + (this.binding.order.unit ? "(" + this.binding.order.unit + ")" : '') : '');
        for (i$ = 0; i$ < 2; ++i$) {
          i = i$;
          this.layout.update(false);
          box = this.layout.getBox('view');
          ref$ = [box.width, box.height], w = ref$[0], h = ref$[1];
          this.tint.set(this.cfg.palette);
          r = this.cfg.dot.size + this.cfg.dot.strokeWidth;
          offset = !this.cfg.stack && this.cfg.mode === 'area' ? this.cfg.area.offset : 0;
          this.scale.x.range([0, w - r]);
          this.scale.y.range([h, h * offset]);
          this.xaxis.render();
          results$.push(this.yaxis.render());
        }
        return results$;
      },
      render: function(){
        var scale, tint, extent, cfg, r, vbox, lbox, yseg, ref$, yoffset, x$, p, res$, i$, i, y$, dotData, z$, this$ = this;
        scale = this.scale, tint = this.tint, extent = this.extent, cfg = this.cfg;
        r = this.cfg.dot.size;
        vbox = this.layout.getBox('view');
        lbox = this.layout.getBox('yaxis');
        yseg = (ref$ = this.parsed.length) > 1 ? ref$ : 1;
        yoffset = !this.cfg.stack && this.cfg.mode === 'area' ? (this.box.height - this.cfg.dot.size) * this.cfg.area.offset : 0;
        x$ = this.g.diff.selectAll('line.data').data(this.bars);
        x$.exit().remove();
        x$.enter().append('line').attr('class', 'data').attr('x1', function(d, i){
          return scale.x(d.x);
        }).attr('x2', function(d, i){
          return scale.x(d.x);
        }).attr('y1', function(d, i){
          return scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl)) / 2;
        }).attr('y2', function(d, i){
          return scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl)) / 2;
        }).attr('stroke-linecap', cfg.line.cap).attr('opacity', 0);
        this.g.diff.selectAll('line.data').transition().duration(150).attr('x1', function(d, i){
          return scale.x(d.x);
        }).attr('x2', function(d, i){
          return scale.x(d.x);
        }).attr('y1', function(d, i){
          return scale.y(d.yh);
        }).attr('y2', function(d, i){
          return scale.y(d.yh) + Math.abs(scale.y(d.yh) - scale.y(d.yl));
        }).attr('stroke', function(d, i){
          if ((d.y1 > d.y0) > 0) {
            return cfg.diff.positive;
          } else {
            return cfg.diff.negative;
          }
        }).attr('stroke-width', cfg.line.strokeWidth).attr('opacity', 1);
        res$ = [];
        for (i$ = this.parsed.length - 1; i$ >= 0; --i$) {
          i = i$;
          res$.push(this.parsed[i]);
        }
        p = res$;
        y$ = this.g.line.selectAll('path.data').data(this.cfg.mode === 'diff' ? [] : p, function(it){
          return it.bind.key;
        });
        y$.exit().remove();
        y$.enter().append('path').attr('class', 'data').attr('fill', 'none').attr('d', function(d, i){
          var ref$;
          if ((ref$ = this$.cfg.mode) === 'streamgraph' || ref$ === 'area') {
            return this$.area(d.pts);
          } else {
            return this$.line(d.pts);
          }
        }).attr('stroke', function(d, i){
          return this$.tint.get(d.color);
        }).attr('stroke-width', cfg.line.strokeWidth);
        this.g.line.selectAll('path.data').transition().duration(150).attr('transform', function(d, i){
          return "translate(0,-" + (yseg - i - 1) * yoffset / yseg + ")";
        }).style('opacity', function(d, i){
          if (this$.legend.isSelected(d.bind.key)) {
            return 1;
          } else {
            return 0.3;
          }
        }).attr('d', function(d, i){
          var ref$;
          if ((ref$ = this$.cfg.mode) === 'streamgraph' || ref$ === 'area') {
            return this$.area(d.pts);
          } else {
            return this$.line(d.pts);
          }
        }).attr('stroke', function(d, i){
          return this$.tint.get(d.color);
        }).attr('stroke-width', cfg.line.strokeWidth).attr('fill', function(d, i){
          var ref$;
          if ((ref$ = this$.cfg.mode) === 'streamgraph' || ref$ === 'area') {
            return this$.tint.get(d.color);
          } else {
            return 'none';
          }
        }).attr('fill-opacity', cfg.area.opacity).attr('stroke-linecap', cfg.line.cap).attr('stroke-linejoin', cfg.line.join);
        dotData = !this.cfg.dot.show
          ? []
          : this.parsed;
        z$ = this.g.dot.selectAll('g.dot').data(dotData, function(it){
          return it.bind.key;
        });
        z$.exit().remove();
        z$.enter().append('g').attr('class', 'dot');
        this.g.dot.selectAll('g.dot').style('opacity', function(d, i){
          if (this$.legend.isSelected(d.bind.key)) {
            return 1;
          } else {
            return 0.3;
          }
        }).each(function(d, j){
          var fill, x$;
          fill = typeof cfg.dot.fill === 'bool' || !(cfg.dot.fill != null) || cfg.dot.fill === 'auto'
            ? cfg.dot.fill
              ? tint.get(d.color)
              : cfg.background
            : cfg.dot.fill;
          x$ = d3.select(this).selectAll('circle.dot').data(d.pts);
          x$.exit().remove();
          x$.enter().append('circle').attr('class', 'dot').attr('r', r).attr('fill', fill).attr('stroke', tint.get(d.bind.name || d.bind.key)).attr('stroke-width', cfg.dot.strokeWidth);
          d3.select(this).selectAll('circle.dot').filter(function(d, i){
            return isNaN(d.y1);
          }).attr('cx', function(d, i){
            if (isNaN(scale.x(d.x))) {
              return scale.x(extent.x[0]);
            } else {
              return scale.x(d.x);
            }
          }).attr('cy', function(d, i){
            return scale.y(extent.y[0]);
          }).transition(150).attr('opacity', 0);
          return d3.select(this).selectAll('circle.dot').filter(function(d, i){
            return !isNaN(d.y1);
          }).attr('cx', function(d, i){
            return scale.x(d.x);
          }).attr('cy', function(d, i){
            return scale.y(d.y1) - j * yoffset / yseg;
          }).attr('r', r).attr('fill', fill).attr('stroke', tint.get(d.color)).attr('stroke-width', cfg.dot.strokeWidth).transition(150).attr('opacity', 1);
        });
        this.legend.render();
        this.xaxis.render();
        return this.yaxis.render();
      }
    };
  };
  function import$(obj, src){
    var own = {}.hasOwnProperty;
    for (var key in src) if (own.call(src, key)) obj[key] = src[key];
    return obj;
  }
}).call(this);
