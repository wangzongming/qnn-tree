import React from "react";
import { Input,message as Msg } from "antd";
import $ from "jquery";

const onLoadData = function (treeNode) {
    return new Promise(resolve => {
        const { children,value } = this.keys;
        const _value = this.parmasKey ? this.parmasKey : value;
        if (treeNode.children && treeNode.children.length) {
            resolve();
            return
        }
        this.refresh(
            { [_value]: treeNode[value] },
            data => {
                this.setState({
                    loadedKeys: this.state.loadedKeys.concat(treeNode[value])
                })
                //这步处理将会导致不能同步线上数据 为了测试方便 后期考虑删除 
                if (treeNode[children] && data && data.length) {
                    let allData = [];
                    [...treeNode[children],...data].map(item => {
                        let foo = true;
                        for (let i = 0; i < allData.length; i++) {
                            if (allData[i][value] === item[value]) {
                                foo = false;
                                continue;
                            }
                        }
                        if (foo) {
                            allData.push(item);
                        }
                        return item;
                    });
                    data = allData;
                }

                if (this.props.fetchConfig.success) {
                    this.props.fetchConfig.success(data,treeNode,this.state.data)
                }
                this.insertChildrenNode(treeNode[value],data);
                resolve();
            },
            () => {
                resolve();
            }
        );
    });
};

//选择
const onCheck = function (checkedKeys,{ node,checkedNodes }) {
    const { children } = this.keys;
    const { selectModal = "1" } = this.props; //0不可选  1单选  2多选 
    let _newNode = {
        ...node,
        [children]:null,
        children:null,
        props:null,
    };
    //nodeDelParamsFormat返回回来的可能是个别的格式的数据，所以得提前处理数据
    for (const key in _newNode) {
        if (typeof _newNode[key] === "function" || React.isValidElement(_newNode[key])) {
            delete _newNode[key];
        }
    } 

    this._isMounted && this.setState({
        value: this.getNodeDta(_newNode),
        valueByTree: selectModal === "1" ? [_newNode.key] : checkedKeys.checked
    }); 
    if (this.props.onChange) {
        if (selectModal === '1') {
            this.props.onChange(this.getNodeDta(_newNode));
        } else {
            let datas = checkedNodes.map(item => item)
            this.props.onChange(datas);
        }
    }
    if (this.props.change) {
        if (selectModal === '1') {
            this.props.change(this.getNodeDta(_newNode));
        } else {
            let datas = checkedNodes.map(item => item)
            this.props.change(datas);
        }
    }

};

//点击触发
const onSelect = function (selectedKeys,{ node }) {
    if (!node.onExpand) {
        node.onExpand = () => this.onExpand(node);
    }

    node?.onExpand?.();
    if (this.props.nodeClick) {
        this.props.nodeClick(this.getNodeDta(node),selectedKeys);
    }
};

//节点右键
const onRightClick = function ({ event,node }) {
    event.stopPropagation();
    let { pageY,pageX } = event;
    const commonDom = this.refs.commonContainer;
    if (commonDom) {
        const { top,left } = $(commonDom).offset();
        pageY -= top;
        pageX -= left;
    }
    //设置鼠标信息
    if (!node) {
        //根节点被点击
        this._isMounted && this.setState({
            menuOption: this.props.rightMenuOptionByContainer,
            onRightClickDomInfo: {
                show: true,
                left: pageX,
                top: pageY
            }
        });
        this.rightClickNode = "root";
    } else {
        //普通节点被点击
        let _rightMenuOption = this.props.rightMenuOption;

        if ((typeof _rightMenuOption) === 'function') {
            _rightMenuOption = _rightMenuOption(this.getNodeDta(node),this.props)
        }
        this._isMounted && this.setState({
            menuOption: _rightMenuOption,
            onRightClickDomInfo: {
                show: true,
                left: pageX,
                top: pageY
            }
        });
        //将右键的节点赋值到 this.rightClickNode 
        this.rightClickNode = this.getNodeDta(node);
    }
    if (this.props.nodeRightClick) {
        this.props.nodeRightClick(this.rightClickNode,this.props);
    }
};

//鼠标移除右键菜单
const rightClickDomOnMouseLeave = function () {
    this.rightMenuTimer = setTimeout(() => {
        this._isMounted && this.setState({
            onRightClickDomInfo: {
                show: false
            }
        });
    },300);
};

//渲染具体节点
const renderTreeNodes = function (item) {
    let { label } = this.keys;
    const { nodeRender,setNodeProps } = this.props;

    let { edit = false } = item;
    let name = item[this.keys["label"]];
    let nodeProps = {};
    if (setNodeProps) {
        nodeProps = setNodeProps(item,name,this.keys);
    }
    if (nodeRender && !edit) {
        name = nodeRender(item,name,this.keys);
    } else if (edit) {
        //设置树组件属性
        const inpOver = e => {
            let value = e.target.value;
            item[label] = value;
            //执行新增操作
            this.postEditNodeInfo(item);
        };
        name = (
            <Input
                style={{ width: 200,height: "25px" }}
                defaultValue={name}
                onPressEnter={inpOver}
                onBlur={inpOver}
                autoFocus
            />
        );
    }
    return name;

};

//拖动放入时
const onDrop = function (info) {
    const { value,children } = this.keys;
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.props.pos.split("-");
    const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);

    if (!info.node.props.loaded) {
        Msg.error("请停留片刻，让节点加载出来并展开后再放手，请重试！");
        return;
    }

    const loop = (data,key,callback) => {
        data.forEach((item,index,arr) => {
            if (item[value] === key) {
                return callback(item,index,arr);
            }
            if (item[children]) {
                return loop(item[children],key,callback);
            }
        });
    };
    const data = [...this.state.data];
    let dragObj;
    loop(data,dragKey,(item,index,arr) => {
        arr.splice(index,1);
        dragObj = item;
    });

    if (!info.dropToGap) {
        // Drop on the content
        loop(data,dropKey,item => {
            item[children] = item[children] || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item[children].push(dragObj);
        });
    } else if (
        (info.node.props.children || []).length > 0 && // Has children
        info.node.props.expanded && // Is expanded
        dropPosition === 1 // On the bottom gap
    ) {
        loop(data,dropKey,item => {
            item[children] = item[children] || [];
            // where to insert 示例添加到尾部，可以是随意位置
            item[children].unshift(dragObj);
        });
    } else {
        let ar;
        let i;
        loop(data,dropKey,(item,index,arr) => {
            ar = arr;
            i = index;
        });
        if (dropPosition === -1) {
            ar.splice(i,0,dragObj);
        } else {
            ar.splice(i + 1,0,dragObj);
        }
    }
    this._isMounted && this.setState(
        {
            data
        },
        () => {
            //被拖动节点
            const dragData = info.dragNode;
            //目标节点
            const targetData = info.node;
            if (this.props.onDrop) {
                this.props.onDrop({
                    targetNode: this.getNodeDta(info.node),
                    dragNode: this.getNodeDta(info.dragNode),
                    dragData: this.getNodeDta(dragData),
                    targetData: this.getNodeDta(targetData),
                    callbackFn: this.callbackFn,
                    allDatas: [...data]
                });
            }
        }
    );
};


//在某个节点下插入子节点
//@nodeId <string> 目标节点
//@childrenNodes <array> 要插入的子节点
const insertChildrenNode = function (nodeId,childrenNodes,cb) {
    let { data = [] } = this.state;
    let { value,children,expanded } = this.keys;
    const loopFn = (data) => {
        data = data.map(item => {
            if (item[value] === nodeId) {
                if (!item[children]) { item[children] = [] };
                item[children] = [...childrenNodes,...item[children]];
                item[expanded] = true;
            } else if (item[children] && item[children].length) {
                item[children] = loopFn(item[children]);
            }
            return item;
        });

        return data;
    }
    if (nodeId === "root") {
        data.unshift(childrenNodes[0])
    } else {
        data = loopFn(data);
    }

    this._isMounted && this.setState({ data },() => {
        if (cb) {
            cb(this.state.data);
        }
    });
}

//删除某个节点 
//@nodeId <string> 目标节点id
const delNodeData = function (nodeId) {
    let { data = [] } = this.state;
    let { value,children } = this.keys;

    const loopFn = (data) => {
        return data.filter(item => {
            if (item[children] && item[children].length) {
                item.children = item[children] = loopFn(item[children]);
                item[children] = item.children;
            }
            return item[value] !== nodeId;
        });
    }
    data = loopFn(data);

    //删除节点后需要清除掉点击的节点
    this._isMounted && this.setState({ curClickNodeData: null });
    this._isMounted && this.setdata(data,() => {
        //这块需要在设置set下不然不会重新渲染 
        this.setState({
            data
        })
    });
}

//更新某个节点数据
//@nodeId <string> 目标节点
//@newNodeData <object> 新节点数据 
const updateNode = function (nodeId,newNodeData) {
    let { data = [] } = this.state;
    let { value,children } = this.keys;
    const loopFn = (data) => {
        data = data.map(item => {
            if (item[value] === nodeId) {
                //后台可能不会返回子节点数据 所以在这备份一下
                let childrenDataBackUp = newNodeData[children] && newNodeData[children].length ? newNodeData[children] : item[children];
                item = { ...newNodeData };
                item[children] = childrenDataBackUp;
            } else if (item[children] && item[children].length) {
                item[children] = loopFn(item[children]);
                item.children = item[children];
            }

            return item;
        });
        return data;
    }

    data = loopFn(data);
    this._isMounted && this.setState({ data });
}


//根据节点id获取某个节点
const getNodeDataById = function (nodeId,_data) {
    let { data = [] } = this.state;
    let { value,children } = this.keys;
    let node = null;
    const loopFn = (data) => {
        data = data.map(item => {
            if (item[value] === nodeId) {
                node = item;
            } else if (item[children] && item[children].length) {
                item[children] = loopFn(item[children]);
            }

            return item;
        });
        return data;
    }

    loopFn((_data ? _data : data));

    return node;
}

export {
    onLoadData,
    onCheck,
    onSelect,
    renderTreeNodes,
    onRightClick,
    rightClickDomOnMouseLeave,
    onDrop,

    // setNodeExpand,
    insertChildrenNode,
    delNodeData,
    updateNode,
    getNodeDataById
};
