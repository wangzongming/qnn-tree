import { Toast } from "antd-mobile";
import { notification } from "antd"

export default function (_params,cb,ecd) {
    const { apiName,props } = this;
    const { otherParams } = props.fetchConfig;
    if (!apiName) {
        cb([]);
        return;
    }
    if (apiName) {
        this.myFetch(apiName,{ ...otherParams,..._params }).then(({ success,message,data }) => {
            Toast.hide()
            if (success) {
                if (cb) {
                    cb(data);
                }
            } else {
                // Toast.fail(message);
                notification.error({
                    message: '系统遇到问题，请联系运维人员',
                    description: `${message}`,
                    duration: 3
                });
                if (ecd) {
                    ecd(message);
                }
            }
        });
    }

}
