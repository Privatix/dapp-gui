import * as React from 'react';
import * as ReactDOM from 'react-dom';

export interface Notice {
    level: 'info' | 'warning' | 'error';
    header?: string;
    msg: string|JSX.Element;
}

class Message extends React.Component<any, any>{

    render(){

        const { header, msg, level, onClose } = this.props;

        const fa = {
           info: 'md md-album'
          ,warning: 'fa fa-warning'
          ,error: 'fa fa-exclamation'
        };

        const styles = {
            info: 'notifyjs-metro-base notifyjs-metro-custom'
           ,warning: 'notifyjs-metro-base notifyjs-metro-warning'
           ,error: 'notifyjs-metro-base notifyjs-metro-error'
        };

        return (
            <div className='notifyjs-wrapper notifyjs-hidable' onClick={onClose} >
                <div className='notifyjs-arrow'></div>
                <div className='notifyjs-container'>
                    <div className={styles[level]}>
                        <div className='close closeNotice'>×</div>
                        <div className='image' data-notify-html='image'>
                            <i className={fa[level]}></i>
                        </div>
                        <div className='text-wrapper'>
                            <div className='title' data-notify-html='title'>{header}</div>
                            <div className='text' data-notify-html='text'>{msg}</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default function(notice: Notice, delay?: number){

    const target = document.getElementById('noticeHolder');
    const holder = document.createElement('div');

    const selfDestroy = () => {
        ReactDOM.unmountComponentAtNode(holder);
    };

    const noticeEl = <Message header={notice.header} onClose={selfDestroy} msg={notice.msg} level={notice.level} />;

    ReactDOM.render(noticeEl, holder);
    target.insertBefore(holder, target.firstChild);

    if(delay){
        setTimeout(selfDestroy, delay);
    }else{
        if(notice.level === 'info'){
            setTimeout(selfDestroy, 7000);
        }
    }
}

export const clearNotices = function(){

    const target = document.getElementById('noticeHolder');
    while(target.firstChild){
        target.removeChild(target.firstChild);
    }
};

export const isNotice = function(elem:any){
    return document.getElementById('noticeHolder').contains(elem);
};
