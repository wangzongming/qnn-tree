### v1.0.2
  稳定打包


### v0.3.4

    新增defaultExpandedKeys
    新增搜索功能

### v0.2.4
    修复删除失败后节点 前端节点删除了 但是后台数据没变的问题

### v0.1.4
    fetchConfig配置中新增otherParmas配置

### v0.0.4

    log:

        第一次加载也会执行success回调

        新增nodeRightClick属性

        新增nodeEditCb、nodeAddCb、nodeDelCb回调
        修复删除后再展开节点后删除的节点又出现的问题
        新增success回调函数  每个节点被点击请求子节点都会执行
        修改nodeRender方法 返回 null 或者 false则不渲染
        修复多选

