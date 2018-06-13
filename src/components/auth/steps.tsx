import * as React from 'react';
import { Link } from 'react-router-dom';

export default function(props: any){

	return <div className='steps clearfix'>
                <div id='noticeHolder'></div>
                <ul role='tablist'>
                    <li role='tab' className={props.step>1?'first done':'first current'} style={{width:'auto'}}>
                        <Link id='steps-uid-0-t-0' to='#'>
                            <span className='current-info audible'>current step: </span>
                            <span className='number'>1.</span>
                            Password
                        </Link>
                    </li>
                    <li role='tab' className={props.step>=2? (props.step>2?'done':'current'):'disabled'} style={{width:'auto'}}>
                        <Link id='steps-uid-0-t-1' to='#'>
                            <span className='number'>2.</span>
                            Import
                        </Link>
                    </li>
                    <li role='tab' className={props.step>=3? (props.step>3?'done':'current'):'disabled'} style={{width:'auto'}}>
                        <a id='steps-uid-0-t-2' href='#'>
                            <span className='number'>3.</span>
                            Account
                        </a>
                    </li>
                    <li role='tab' className={props.step==='4'?'current':'disabled'} style={{width:'auto'}}>
                        <a id='steps-uid-0-t-3' href='#'>
                            <span className='number'>4.</span>
                            Backup
                        </a>
                    </li>
                </ul>
            </div>;

}
