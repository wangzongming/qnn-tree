
import * as React from 'react';
interface TreeProps {
    myFetch?: (apiName?: string, body?: object, type?: string) => any,
    nodeClick?: (node?: any, selectedKeys?: any) => void,
    fetchConfig?: object,
    keys?: object,
    yes?: (value?: any) => void,
    reset?: () => void,
    visible?: boolean,
    search?: boolean,
    searchKey?: string,
    selectModal?: string,
    valueRender?: (value?: any) => void,
    nodeRender?: (nodeData?: object) => void,
    btnShow?: boolean,
    rightMenuOption?: Array<Object>,
    rightMenuOptionByContainer?: Array<Object>,
    modalType?: string,
    disabled?: boolean,
    draggable?: boolean,
    selectText?: boolean,
    [propName: string]: any
}
declare class Tree extends React.Component<TreeProps, any> {

    constructor(props: any);
    componentDidMount(): void;
    componentDidUpdate(prevProps: any): void;
    componentWillUnmount(): void;
    render(): any;
}
export default Tree;
