import Vue from 'vue'
import SeeksRelationGraph from 'relation-graph'
import Guides from "@scena/guides"
import { uniqBy } from 'lodash'
import ZoomInPng from '../assets/zoom_in.png'
import ZoomOutPng from '../assets/zoom_out.png'
import RefreshPng from '../assets/refresh.png'

import './style.less'

const width = (str) => {
  const rows = Math.ceil(Math.sqrt(str.length))
  if (rows < 4) return 4 * 18 + 30
  return rows * 18 + 40
}

const remove = HTMLElement.prototype.remove
HTMLElement.prototype.remove = function () {
  if (remove) {
    remove.call(this)
    return
  }
  this.parentNode.removeChild(this)
}

const defaultDataFormatter = (nodes, links) => {
  nodes = uniqBy(nodes.map(o => {
    return {
      id: o.id,
      text: o.name,
      width: width(o.name),
      height: width(o.name),
      styleClass: 'node',
      color: '#3780f3',
      disableDefaultClickEffect: true
    }
  }), 'id')
  links = links.map(o => {
    return {
      from: o.from,
      to: o.to,
      color: '#348ff7'
    }
  })
  return {
    rootId: Math.ceil(Math.random() * 100),
    nodes,
    links
  }
}

const zooms = [45, 55, 65, 80, 100, 125, 150, 200, 250]

const Component = Vue.extend({
  props: {
    width: {
      type: String
    },
    showRuler: {
      type: Boolean,
      default () {
        return false
      }
    },
    height: {
      type: String,
      default () {
        return '100%'
      }
    },
    dataFormatter: {
      type: Function,
      default: defaultDataFormatter
    },
    currentNodeId: {
      type: [String, Number]
    },
    nodes: {
      type: Array
    },
    links: {
      type: Array
    },
    layoutName: {
      type: String,
      default () {
        return 'force'
      }
    },
    showNodeRelation: {
      type: Boolean,
      default () {
        return false
      }
    },
    backgroundColor: {
      type: String
    }
  },
  beforeDestroy () {
    document.removeEventListener('click', this.handleDocumentClick)
    if (this.$refs.circle) {
      this.$refs.circle.removeEventListener('mousedown', this.handleCircleMousedown)
    }
    document.removeEventListener('mouseup', this.handleDocumentMouseup)
    document.removeEventListener('mousemove', this.handleDocumentMousemove)
    this.$refs.graph.$destroy()
  },
  mounted () {
    this.zoomIndex = 4
    if (this.showRuler) {
      const textFormat = number => Math.round(number * 100) / 100
      const leftOptions = { type: 'vertical', width: 30, backgroundColor: '#3780f3', lineColor: '#fff', textFormat }
      const rightOptions = { type: 'horizontal', height: 30, backgroundColor: '#3780f3', lineColor: '#fff', textFormat }
      this.leftRuler = new Guides(this.$refs.leftRuler, leftOptions)
      this.topRuler = new Guides(this.$refs.topRuler, rightOptions)
      this.setZoom()
    }
    this.setCirclePositon()
    if (this.nodes) {
      const graphData = this.graphData = this.dataFormatter(this.nodes, this.links)
      this.$refs.graph.setJsonData(graphData)
    }
    document.addEventListener('click', this.handleDocumentClick)
    this.$refs.circle.addEventListener('mousedown', this.handleCircleMousedown)
    document.addEventListener('mouseup', this.handleDocumentMouseup)
    document.addEventListener('mousemove', this.handleDocumentMousemove)
  },
  watch: {
    data: {
      handler (val) {
        if (val) {
          const graphData = this.graphData = this.dataFormatter(val)
          this.$refs.graph.setJsonData(graphData)
        }
      }
    }
  },
  methods: {
    handleDocumentClick (evt) {
      this.$refs.graph.getNodes().forEach(o => {
        o.opacity = 1
      })
    },
    handleDocumentMouseup (evt) {
      if (this.isCircleDown) {
        this.$refs.graph.animateToZoom(zooms[this.zoomIndex], 0, () => {})
      }
      this.isCircleDown = false
    },
    handleDocumentMousemove (evt) {
      if (!this.isCircleDown) return
      const x = evt.pageX
      const gap = x - this.startX
      if (gap > 0) {
        this.zoomIndex = Math.min(Math.round(gap / 25) + this.startIndex, 8)
      }
      if (gap < 0) {
        this.zoomIndex = Math.max(0, this.startIndex + Math.round(gap / 25))
      }
      if (this.$refs.circle) {
        this.$refs.circle.style.transform = `translate(${(this.zoomIndex - 4) * 100 / 4}px, 0)`
      }
    },
    handleCircleMousedown (evt) {
      this.isCircleDown = true
      this.startX = evt.pageX
      this.startIndex = this.zoomIndex
    },
    setZoom () {
      if (!this.$refs.graph) return
      let graphZoom = this.$refs.graph.graphSetting.canvasZoom
      let zoom = graphZoom / 100
      if (this.leftRuler && this.topRuler) {
        this.leftRuler.zoom = zoom
        this.topRuler.zoom = zoom
        const rate = 50 * (100 / graphZoom)
        this.leftRuler.unit = this.topRuler.unit = rate
      }
      requestAnimationFrame(this.setZoom)
    },
    handleNodeClick (node, evt) {
      evt.stopPropagation()
      this.$emit('change', node.id)
      if (!this.showNodeRelation) return
      const { nodes, links } = this.graphData
      const linkedNodes = links
        .filter(o => o.to === node.id || o.from === node.id)
        .map(o => {
          if (o.to !== node.id) return o.to
          return o.from
        })
      nodes.forEach(o => {
        if (linkedNodes.indexOf(o.id) < 0 && node.id !== o.id) {
          this.$refs.graph.getNodeById(o.id).opacity = 0.5
        } else {
          this.$refs.graph.getNodeById(o.id).opacity = 1
        }
      })
    },
    handleZoomOut () {
      if (this.zoomIndex < 8) {
        this.zoomIndex++
        this.$refs.graph.animateToZoom(zooms[this.zoomIndex], 0, () => {})
      }
    },
    handleZoomIn () {
      if (this.zoomIndex > 0) {
        this.zoomIndex--
        this.$refs.graph.animateToZoom(zooms[this.zoomIndex], 0, () => {})
      }
    },
    setCirclePositon () {
      if (!this.isCircleDown) {
        if (this.$refs.circle) {
          this.$refs.circle.style.transform = `translate(${(this.zoomIndex - 4) * 100 / 4}px, 0)`
        }
      }
      requestAnimationFrame(this.setCirclePositon)
    },
    handleRefresh () {
      if (!this.$refs.graph) return
      this.$refs.graph.refresh()
      this.zoomIndex = 4
    }
  },
  computed: {
    styles () {
      return {
        width: this.width || '100%',
        height: this.height || '100%',
        backgroundColor: this.backgroundColor || '#fff'
      }
    },
    options () {
      return {
        defaultNodeBorderWidth: 0,
        defaultNodeColor: 'rgba(238, 178, 94, 1)',
        allowSwitchLineShape: true,
        allowSwitchJunctionPoint: true,
        defaultJunctionPoint: 'border',
        defaultFocusRootNode: false,
        allowShowMiniToolBar: false,
        disableZoom: true,
        layouts: [
          {
            layoutName: this.layoutName
          }
        ]
      }
    }
  },
  render () {
    return <div class={`relation-graph${this.showRuler ? ' ruler' : ''}`} style={this.styles}>
      {this.showRuler && <div class="left-ruler" ref="leftRuler"></div>}
      {this.showRuler && <div class="top-ruler" ref="topRuler"></div>}
      <div key="root" class="relation-graph-root">
        <SeeksRelationGraph {
          ...{
            props: {
              'on-node-click': this.handleNodeClick
            }
          }
        } ref="graph" options={this.options}></SeeksRelationGraph>
      </div>
      <div key="actions" class="relation-graph-actions">
        <div class="relation-graph-actions-zoom">
          <div class="relation-graph-actions-zoomIn" onClick={this.handleZoomIn}>
            <img width="14" src={ZoomInPng}></img>
          </div>
          <div class="relation-graph-actions-progress">
            <div class="relation-graph-actions-circle" ref="circle"></div>
          </div>
          <div class="relation-graph-actions-zoomOut" onClick={this.handleZoomOut}>
            <img width="14" src={ZoomOutPng}></img>
          </div>
        </div>
        <div class="relation-graph-actions-refresh" onClick={this.handleRefresh}>
          <img width="14" src={RefreshPng}></img>
        </div>
      </div>
    </div>
  }
})

Component.install = (Vue) => {
  Vue.component('vue-relation-graph', Component)
}

export default Component