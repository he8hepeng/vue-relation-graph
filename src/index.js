import Vue from 'vue'
import './style.less'
import RelationGraph from '../packages/relationGraph'

const nodes = [
  { id: "x909-xsasasa", name: "中文" },
  { id: "koasasa-xsxs", name: '腾讯' },
  { id: 'alibaba', name: '阿里巴巴' }
]

const links = [
  { from: 'x909-xsasasa', to: 'koasasa-xsxs' },
  { from: 'alibaba', to: 'x909-xsasasa' }
]

Vue.use(RelationGraph)

new Vue({
  data () {
    return {
      destroyed: false
    }
  },
  methods: {
    handleDestroyOrRebuild () {
      this.destroyed = !this.destroyed
    }
  },
  render () {
    return <div>
      {
        !this.destroyed && <vue-relation-graph showRuler nodes={nodes} links={links} height="700px" />
      }
      <button onClick={this.handleDestroyOrRebuild}>销毁/重建</button>
    </div>
  }
}).$mount('#app')