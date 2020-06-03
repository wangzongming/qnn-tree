//获取当前使用的是移动端还是PC端
const getDeviceType = () => {  
    //简单判断 
    if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
        return 'mobile'
    } else {
        return 'pc'
    }
}

export default getDeviceType;