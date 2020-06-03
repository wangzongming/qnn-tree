##### 介绍

  qnn树组件
  使用 react + antd 开发
  功能：点击加载节点数据、搜索、节点选中、右键菜单、拖动等

##### 安装

  yarn add qnn-tree | npm i qnn-tree

##### 在线体验

<a href="https://codesandbox.io/s/qnn-tree-pqvn8">点击进入项目 codesandbox</a>

##### 调用

    使用时应该给容器设置一个高，

    <Tree

        是否开启搜索
        search={false}

        搜索的key值
        searchKey="searchKey"

        默认数据 默认数据存在fetchConfig属性将失去意义 [array]
        data = {[]}

        默认展开的节点 Array<string>
        defaultExpandedKeys={[]}

        树结构是否处于出现状态
        visible

        common | drawer  抽屉出现方式或者普通的
        modalType:"drawer",

         false为不显示
        selectText="选择"

         0 不可选 1 单选(默认) 2 多选
        selectModal="1"

        myFetch={this.props.myFetch}

        true(默认)  false
        btnShow={true}

        ()=>void
        yes={value => {
            console.log("确定:", value);
        }}

        ()=>void
        reset={() => {
            console.log("重置");
        }}

        取消按钮
        cancel={()=>{}}

        (obj{nodeInfo})=>void
        change={value => {
            console.log("切换值:", value);
        }}

        将选择的值自定义渲染
        (obj{nodeInfo})=>string
        valueRender={(obj | array) => {
            let parentNameAll = obj.parentNameAll;
            let \_fLabel = parentNameAll.replace(/,/gi, "→");
            return \_fLabel;
        }}

         设置树节点props（eg:禁用某一项）
        setNodeProps = {(item, name, this.keys)=>obj};

         树节点点击
        nodeClick = (node, selectedKeys) => void

        树节点右键
        nodeRightClick = (node, props) => void

        设置节点属性 可设置项【disableCheckbox、disabled、iconisLeaf、key、selectable、title】
        setNodeProps={nodeInfo => {
            return { disableCheckbox: false };
        }}

        右键菜单选项
        可为(rightClickNode)=>rightMenuOption
        rightMenuOption={[
            {
                label: "新增子节点",
                name: "add",  内置 add del edit  addRootNode（新增跟节点）
            },
            {
                label: "自定义",
                name: "diyXXX",
                cb: newNodeInfo => {
                    console.log(newNodeInfo);
                }
            },
        ]}

        树结构容器中的右键菜单 [ array | null ]
        rightMenuOptionByContainer={[
            {
                label: "新增根节点",
                name: "addRoot"
            }
        ]}

        节点的自定义渲染(obj{nodeInfo})=>string   返回 null 或者 false则不渲染
        nodeRender={nodeData => {
            return (
                <span>
                    {nodeData["levelName"]}（总
                    {nodeData["totalNum"]}道工序，已完成
                    {nodeData["finishedNum"]}道）
                </span>
            );
        }}

        /*
        ***** 参数注释 ****
        *
        *   event：事件对象
        *   node、dragNode:被拖动的节点
        *   dragData:拖动的节点数据
        *   targetData：目标节点数据
        *   callbackFn：
        *       {
        *           Toast, antd-mobile  Toast(消息提示组件)
        *           props, 页面props
        *           onLoadData:this.onLoadData, 加载节点数据，调用传入需要加载的node节点 [treeNode]
        *
        *       }
        */

        是否开启拖动 [bool]
        draggable

        拖动开始
        onDragStart={({event, node, callbackFn})=>void}

        拖动中
        onDragLeave={({event, node, callbackFn})=>void}

        拖动放下后
        onDrop={({event, allDatas, dragNode, targetNode, dragData, targetData, callbackFn})=>void}

        fetchConfig={{
            parmasKey: "parentId",  点击节点后将节点id赋值该key上传递给后台
            apiName: "appGetGxProjectLevel",
            searchApiName: "",
            params: {
                parentId: "0"
            },
            //没次请求树结构都会调用
            success(data,treeNode,allNodeData):void

            新增节点的接口
            nodeAddApiName:"",
            数据处理 新增根节时parentNode === 'root'
            nodeAddParamsFormat:(nodeInfo, parentNode)=>object
            nodeAddCb:(response:{success, message, data}, props)=>void

            //编辑
            nodeEditApiName:"",
            nodeEditParamsFormat:(nodeInfo, curNode)=>object
            nodeEditCb:(response:{success, message, data}, props)=>void

            //删除
            nodeDelApiName:"",
            nodeDelParamsFormat:(nodeInfo, curNode)=>object
            nodeDelCb:(response:{success, message, data}, props)=>void
        }}

        keys={{
            label: "levelName",
            value: "levelId",
            children: "zlProjectLevelList"
        }}

         弹出抽屉配置  参考antd Drawer配置   modalType="drawer"时 有效
        drawerConfig={{}}

        treeProps={{}}  tree配置
    />
