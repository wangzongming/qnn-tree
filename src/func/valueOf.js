//获取值 返回节点信息
const getValue = function() {
    const { value } = this.state;
    return value;
};

//设置值  params{[key]:[value], ...}
const setValue = function(value) {
    this._isMounted &&  this.setValue({
        value,
        valueByTree: value[this.keys.value]
    });
};

const clearValue = function() {
    if (this.props.onChange) {
        this.props.onChange(null);
    }
    if(this.props.reset){
        this.props.reset()
    }
    this._isMounted && this.setState({
        value: null,
        valueByTree: null
    });
};

const cancel = function(){
    if(this.props.cancel){
        this.props.cancel()
    }
    this.onClose();
}
export { getValue, setValue, clearValue, cancel };
