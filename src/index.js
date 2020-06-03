import React,{ Component } from "react";
import {
    refresh,
    getDeviceType,
    showDrawer,
    onClose,
    onLoadData,
    onCheck,
    onSelect,
    onCloseBySelectTip,
    renderTreeNodes,
    clearValue,
    getValue,
    setValue,
    yes,
    onRightClick,
    rightClickDomOnMouseLeave,
    nodeAdd,
    nodeDel,
    nodeEdit,
    rightMenuOptionClick,
    postEditNodeInfo,
    cancel,
    onDrop,
    onExpand,

    // setNodeExpand,
    insertChildrenNode,
    delNodeData,
    updateNode,
    getNodeDataById
} from "./func";
import { Drawer,Button,Tree,Popconfirm,Input,Spin } from "antd";
import { Toast } from "antd-mobile";
import PropTypes from "prop-types";
import s from "./style.less";

class index extends Component {
    static getDerivedStateFromProps(props,state) {
        let obj = {
            ...state,
            ...props
        };
        return obj;
    }

    //初始为被卸载状态
    _isMounted = false;

    constructor(...args) {
        super(...args);
        const props = this.props;
        const { apiName,params = {},parmasKey } = props.fetchConfig;
        let _onRightClickDomInfo = {
            //右键节点的信息
            show: false,
            left: 0,
            top: 0
        };
        this.state = {
            params,
            visible: props.visible || false,
            disabled: props.disabled || false,
            visibleBySelectTip: false,
            data: props.data || [],
            valueByTree: props.valueByTree || [], //树结构的value
            value: props.value || null, //最终取的节点信息
            onRightClickDomInfo: _onRightClickDomInfo,
            rightMenuOption: props.rightMenuOption,
            rightMenuOptionByContainer: props.rightMenuOptionByContainer,
            menuOption: [], //实际的右键菜单选项
            modalType: props.modalType,
            selectText:
                props.selectText === false ? null : props.selectText || "选择",
            searchTreeNodeText: null,
            loading: false,
            expandedKeys: this.props.defaultExpandedKeys || [],
            loadedKeys: []
        };

        this.myFetch = props.myFetch;
        this.refresh = refresh.bind(this);
        this.showDrawer = showDrawer.bind(this);
        this.onClose = onClose.bind(this);
        this.onLoadData = onLoadData.bind(this);
        this.onCheck = onCheck.bind(this);
        this.onSelect = onSelect.bind(this);
        this.onCloseBySelectTip = onCloseBySelectTip.bind(this);
        this.clearValue = clearValue.bind(this);
        this.cancel = cancel.bind(this);
        this.renderTreeNodes = renderTreeNodes.bind(this);
        this.getValue = getValue.bind(this);
        this.setValue = setValue.bind(this);
        this.yes = yes.bind(this);
        this.nodeAdd = nodeAdd.bind(this);
        this.nodeDel = nodeDel.bind(this);
        this.nodeEdit = nodeEdit.bind(this);
        this.rightMenuOptionClick = rightMenuOptionClick.bind(this);
        this.postEditNodeInfo = postEditNodeInfo.bind(this);
        this.onRightClick = onRightClick.bind(this);
        this.rightClickDomOnMouseLeave = rightClickDomOnMouseLeave.bind(this);
        this.onDrop = onDrop.bind(this);
        this.onExpand = onExpand.bind(this);
        // this.setNodeExpand = setNodeExpand.bind(this);
        this.insertChildrenNode = insertChildrenNode.bind(this);
        this.delNodeData = delNodeData.bind(this);
        this.updateNode = updateNode.bind(this);
        this.getNodeDataById = getNodeDataById.bind(this);

        this.getNodeDta = (node) => {
            return {
                ...node,
                onExpand: () => this.onExpand(node),
                getNodeChildren: () => {
                    return node[this.keys.children] || [];
                },
                props: {
                    // ...node,
                    expanded: node.expanded,
                    dataRef: {
                        ...node,
                    }
                }
            }
        };

        this.isMobiele = getDeviceType() === "mobile";
        this.keys = {
            label: "label",
            value: "value",
            expanded: "expanded",
            children: "children",
            disabled: "disabled",
            selectable: "selectable",
            checkable: "checkable",
            ...props.keys
        };
        this.apiName = apiName;
        this.params = params;
        this.parmasKey = parmasKey;
        this.curNode = null; //当前操作的对象 改名等操作会用到
        this.rightClickNode = null; //当前右键的节点

        this.callbackFn = {
            Toast, //antd-mobile  Toast(消息提示组件)
            props, //页面props
            onLoadData: this.onLoadData //加载节点数据，需要传入node数据
        };
    }
    componentDidMount() {
        this._isMounted = true;

        const { data = [],loading,modalType,visible } = this.state;
        if (modalType !== "drawer") {
            // //默认数据存在将不会请求数据
            if (!data.length) {
                Toast.loading("loading...",0);
                this._isMounted && this.setState({ loading: true })
                !loading && this.refresh(this.params,data => {
                    this._isMounted && this.setState({ data });
                    Toast.hide();
                    if (this.props.fetchConfig.success) {
                        this._isMounted && this.props.fetchConfig.success(data)
                    }
                    this._isMounted && this.setState({ loading: false })
                },() => {
                    Toast.hide();
                    this._isMounted && this.setState({ loading: false })
                });
            }
        } else if (!data.length && !loading && visible) {
            Toast.loading("loading...",0);
            this._isMounted && this.setState({ loading: true })
            this.refresh(this.params,data => {
                this._isMounted && this.setState({ data });
                Toast.hide();
                if (this.props.fetchConfig.success) {
                    this._isMounted && this.props.fetchConfig.success(data)
                }
                this._isMounted && this.setState({ loading: false })
            },() => {
                Toast.hide();
                this._isMounted && this.setState({ loading: false })
            });
        }
    }

    componentWillUnmount() {
        this._isMounted = false;
        Toast.hide();
    }

    searchTreeNode = (e) => {
        // const { value } = this.keys;
        let val = e.target.value;
        const { searchKey = "searchKey" } = this.props;
        clearTimeout(window.sTimer);
        window.sTimer = setTimeout(() => {
            if (this._isMounted) {
                //将值设置进seate中暂时未用到
                this._isMounted && this.setState({
                    searchTreeNodeText: val,
                    expandedKeys: [],
                    loadedKeys: []
                },() => {
                    Toast.loading("请稍等...",0);
                    this.refresh({
                        ...this.params,
                        [searchKey]: val
                    },data => {
                        //判断是否在当前数据中能找到相同，有相同的则不使用搜索来的数据 因为这样展开会出问题，因为key一样
                        const realData = data;
                        this._isMounted && this.setState({ data: realData });
                        Toast.hide();
                        if (this.props.fetchConfig.success) {
                            this.props.fetchConfig.success(realData)
                        }
                    });
                })
            }
        },500);
    }

    loopTreeData = (data = []) => {
        const { value,selectable,disabled,checkable,children } = this.keys;
        if (data.length) {
            const _data = [...data];
            return _data.map(item => {
                let title = this.renderTreeNodes(item);
                if (!title) {
                    return false
                }
                return {
                    ...item,
                    key: item[value],
                    title: title,
                    selectable: item[selectable],
                    disabled: item[disabled],
                    checkable: item[checkable],
                    children: (item[children] && item[children].length) ? this.loopTreeData(item[children]) : [],
                }
            }).filter(item => item !== false)
        }
    }

    render() {
        const {
            visible,
            // value,
            data,
            visibleBySelectTip,
            onRightClickDomInfo: { show,left,top },
            menuOption = [],
            modalType,
            selectText,
            search,
            loading,
            expandedKeys = [],
            loadedKeys = []
        } = this.state;
        const {
            selectModal = "1",
            valueRender,
            btnShow = true,
            drawerConfig = {},
            disabled,
            draggable,
            onDragStart,
            onDragLeave,
            treeProps = {},
            value,
            fns = {}
        } = this.props; //0不可选  1单选  2多选 
        let { valueByTree } = this.state;
        // console.log("==========")
        // console.log('渲染数据：',data)
        // console.log('展开的节点：',expandedKeys, loadedKeys)
        if (selectModal === '2' && value && value.length) {
            valueByTree = value && value.map(item => item[this.keys.value])
        }
        //节点中包含parentIdAll属性则会展开父节点
        let defaultExpandedKeys = valueByTree;
        if (selectModal === '2' && value && value.length) {
            let _defaultExpandedKeys = [];
            value.map(item => {
                if (item.parentIdAll) {
                    return item.parentIdAll;
                } else {
                    return item[this.keys.value];
                }
            }).map(item => {
                if (!item) return item;
                let nodeItem = item.split(',');
                _defaultExpandedKeys = _defaultExpandedKeys.concat(nodeItem);
                return item;
            });
            defaultExpandedKeys = Array.from(new Set(_defaultExpandedKeys));
        }
        // 切换选择时的提醒   ----暂未完成
        const selectTip = (
            <Drawer
                placement={"top"}
                width={"50%"}
                height={35}
                closable={false}
                mask={false}
                onClose={this.onCloseBySelectTip}
                visible={visibleBySelectTip}
                className={s.myDrawerBySelectTip}
            >
                <div className={s.selectedValue}>已选择{1111}</div>
            </Drawer>
        );
        //右键弹出菜单
        const onRightClickDom = (
            <div
                onMouseLeave={this.rightClickDomOnMouseLeave}
                onMouseEnter={() => clearTimeout(this.rightMenuTimer)}
                className={s.onRightClickDom}
                style={{
                    display:
                        menuOption && menuOption.length && show
                            ? "block"
                            : "none",
                    left: left,
                    top: top
                }}
            >
                <ul>
                    {menuOption &&
                        menuOption.map((item,index) => {
                            let { label,name } = item;
                            if (name === "del") {
                                return (
                                    <Popconfirm
                                        placement="topLeft"
                                        title={"确认删除吗？"}
                                        key={index}
                                        onConfirm={this.rightMenuOptionClick.bind(
                                            this,
                                            item
                                        )}
                                        okText="确认"
                                        cancelText="取消"
                                    >
                                        <li>{label}</li>
                                    </Popconfirm>
                                );
                            }
                            return (
                                <li
                                    key={index}
                                    onClick={this.rightMenuOptionClick.bind(
                                        this,
                                        item
                                    )}
                                >
                                    {label}
                                </li>
                            );
                        })}
                </ul>
            </div>
        );
 
        //具体数dom
        const treeDom = (
            <div style={{ height: "100%" }}>
                {data && data.length ? (
                    <Tree
                        // height={300}
                        checkStrictly
                        onCheck={this.onCheck}
                        checkedKeys={valueByTree}
                        checkable={selectModal !== "0" ? true : false}
                        loadData={this.onLoadData}
                        onSelect={this.onSelect}
                        defaultExpandedKeys={defaultExpandedKeys}
                        expandedKeys={expandedKeys}
                        loadedKeys={loadedKeys}
                        defaultSelectedKeys={valueByTree}
                        defaultCheckedKeys={valueByTree}
                        onRightClick={this.onRightClick}
                        draggable={draggable}
                        onDragStart={({ event,node }) => {
                            //拖动开始
                            if (onDragStart) {
                                onDragStart({
                                    event,
                                    node,
                                    callbackFn: this.callbackFn
                                });
                            }
                        }}
                        onDragLeave={({ event,node }) => {
                            //拖动中...
                            if (onDragLeave) {
                                onDragLeave({
                                    event,
                                    node,
                                    callbackFn: this.callbackFn
                                });
                            }
                        }}
                        // onDragEnter={()=>{
                        //     console.log("进入可放区域")
                        // }}
                        // onDragOver={()=>{
                        //     console.log("离开可放区域")
                        // }}
                        // blockNode={true}
                        onDrop={this.onDrop}
                        treeData={this.loopTreeData(data)}
                        {...treeProps}
                        onExpand={(expandedKeys,{ expanded,node }) => {
                            this.setState({
                                expandedKeys: expanded ? expandedKeys : expandedKeys.filter(item => item !== node.key)
                            })
                            if (treeProps) {
                                treeProps.onExpand && treeProps.onExpand(expandedKeys,{ expanded,node })
                            }
                        }}
                    >
                        {/* {this.renderTreeNodes(data)} */}
                    </Tree>
                ) : (
                        <div className={s.noData}>暂无数据，右键新增一个吧！</div>
                    )}
            </div>
        );

        const createTreeDomFn = (
            <div className={"TreeDom"}>
                {onRightClickDom}
                <div className={s.con}>{treeDom}</div>
                {btnShow === false ? null : (
                    <div className={s.btns}>
                        <Button onClick={this.cancel}>取消</Button>
                        <Button
                            type="danger"
                            onClick={this.clearValue}
                            style={{ marginLeft: 8 }}
                        >
                            重置
                        </Button>
                        <Button
                            onClick={this.yes}
                            type="primary"
                            style={{ marginLeft: 8 }}
                        >
                            确定
                        </Button>
                    </div>
                )}
            </div>
        );
        //树结构弹出容器
        const treeModal = (
            <Drawer
                placement={this.isMobiele ? "right" : "left"}
                width={this.isMobiele ? "100%" : "50%"}
                closable={false}
                onClose={this.onClose}
                visible={visible}
                style={{
                    height: "100%"
                }}
                className={`${s.myDrawer} ${
                    !this.isMobiele ? s.myDrawerByPc : null
                    }`}
                {...drawerConfig}
            >
                {selectTip}
                {loading ? <Spin style={{ margin: "24px auto",display: "block",textAlign: "center" }} tip="loading..." /> : createTreeDomFn}
            </Drawer>
        );
        let text =
            !value || JSON.stringify(value) === "{}" || JSON.stringify(value) === "[]"
                ? selectText
                : valueRender
                    ? valueRender(value)
                    : value[this.keys.label];

        if (!value && disabled) {
            text = null;
        }
        return (
            <div
                className={s.treeContainer}
                //阻止右键菜单
                onContextMenu={e => {
                    e.preventDefault();
                    //右键是根节右键
                    this.onRightClick({ event: e,node: null });
                }}
            >
                <div className={`${s.valueCon} ${fns?.isMobile?.() ? "" : s.valueConPc}`}>
                    {disabled ? text : <a onClick={this.showDrawer}>{text}</a>}
                </div>
                {/* 搜索框 */}
                {
                    search ? <div className={s.searchContainer}>
                        <Input
                            placeholder="查找"
                            onChange={this.searchTreeNode}
                            style={{ width: "100%" }}
                            allowClear
                        />
                    </div> : null
                }
                {modalType === "common" ? (
                    visible ? (
                        <div
                            ref="commonContainer"
                            className={s.commonContainer}
                            name="commonContainer"
                            //搜索框存在时需要给 
                            style={{ paddingTop: search ? "32px" : 0 }}
                        >
                            {createTreeDomFn}
                        </div>
                    ) : null
                ) : (
                        <div name="modalContainer">{visible ? treeModal : null}</div>
                    )}
            </div>
        );
    }
}

index.propTypes = {
    myFetch: PropTypes.func,
    nodeClick: PropTypes.func,
    fetchConfig: PropTypes.object,
    keys: PropTypes.object,
    yes: PropTypes.func,
    reset: PropTypes.func,
    visible: PropTypes.bool,
    search: PropTypes.bool,
    searchKey: PropTypes.string,
    selectModal: PropTypes.string,
    valueRender: PropTypes.func,
    nodeRender: PropTypes.func,
    btnShow: PropTypes.bool,
    rightMenuOption: PropTypes.any,
    rightMenuOptionByContainer: PropTypes.array,
    modalType: PropTypes.string,
    disabled: PropTypes.bool,
    draggable: PropTypes.bool
};
index.defaultProps = {
    modalType: "drawer", //common  drawer
    fetchConfig: {},
    rightMenuOption: [
        {
            label: "新增子节点",
            name: "add",
            cb: newNodeInfo => {
                console.log(newNodeInfo);
            }
        },
        {
            label: "删除节点",
            name: "del",
            cb: deelNodeInfo => {
                console.log(deelNodeInfo);
            }
        },
        {
            label: "修改节点",
            name: "edit",
            cb: newNodeInfo => {
                console.log(newNodeInfo);
            }
        }
    ]
};

export default index;
