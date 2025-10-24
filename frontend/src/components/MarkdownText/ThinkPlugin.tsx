import {visit} from 'unist-util-visit'

function ThinkPlugin() {
  return (tree) => {
    visit(tree, (node) => {
      if (node.type === 'containerDirective' && node.name === 'think') {
        const data = node.data || (node.data = {})
        data.hName = 'think'
        data.hProperties = {className: 'custom-think'}
      }
    })
  }
}

export default ThinkPlugin
