function showDrawer() {
    this._isMounted && this.setState({
        visible: true
    },() => {
        //请求数据
        const { data = [],loading } = this.state;
        // //默认数据存在将不会请求数据
        if (!data.length) {
            this._isMounted && this.setState({ loading: true })
            !loading && this.refresh(this.params,data => {
                this._isMounted && this.setState({ data });
                if (this.props.fetchConfig.success) {
                    this._isMounted && this.props.fetchConfig.success(data)
                }
                this._isMounted && this.setState({ loading: false })
            },() => {
                this._isMounted && this.setState({ loading: false })
            });
        }
    });
}

function onClose() {
    this._isMounted && this.setState({
        visible: false
    });
}

function onCloseBySelectTip() {
    this._isMounted && this.setState({
        visibleBySelectTip: false
    });
}
function showDrawerBySelectTip() {
    this._isMounted && this.setState({
        visible: true
    });
}

export { showDrawer,onClose,onCloseBySelectTip,showDrawerBySelectTip };
