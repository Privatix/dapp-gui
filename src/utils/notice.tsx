import * as React from 'react';
import * as ReactDOM from 'react-dom';
// declare var $: any;

export default function(target:any, notice: any, delay?: number){

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

    const noticeEl = <div className='notifyjs-corner' style={{top: '0px', right: '0px'}}>
        <div className='notifyjs-wrapper notifyjs-hidable'>
            <div className='notifyjs-arrow'></div>
            <div className='notifyjs-container'>
                <div className={styles[notice.level]}>
                    <div className='image' data-notify-html='image'>
                        <i className={fa[notice.level]}></i>
                    </div>
                    <div className='text-wrapper'>
                        <div className='title' data-notify-html='title'>{notice.header}</div>
                        <div className='text' data-notify-html='text'>{notice.msg}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>;

    ReactDOM.render(noticeEl, target);
    setTimeout(() => {
        ReactDOM.unmountComponentAtNode(target);
    }, delay ? delay : 3000);
    // $.notify('Sample Notification');
}
