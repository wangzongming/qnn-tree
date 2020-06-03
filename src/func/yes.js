const yes = function(){
    this.onClose();
    if(this.props.yes){
        this.props.yes(this.getValue())
    }
}

export default yes
