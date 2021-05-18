复合表单组件

# vue-relation-graph

## 本地开发

```
npm install
npm run dev
open http://localhost:8222
```

## 用法


### 全局方式

```javascript
import RelationGraph from 'vue-relation-graph'
import 'vue-relation-graph/dist/main.css'

Vue.use(RelationGraph)
```

```html
<vue-relation-graph :nodes="nodes" :links="links" @change="handleChange" />
```

### 属性

```javascript
Vue.extend({
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
    /**
     * 暂为无效属性
     */
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
      type: String,
      default () {
        return false
      }
    }
  }
})
```

### 定义数据源

```javascript
const nodes = [
  { id: "x909-xsasasa", name: "IFIND" },
  { id: "koasasa-xsxs", name: 'Tecent' }
]

const links = [
  { from: 'x909-xsasasa', to: 'koasasa-xsxs' }
]
```

- note: 只有source/target为有效引用字段

## 组件参考

[RelationGraph](https://github.com/seeksdream/relation-graph)