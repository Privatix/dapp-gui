import * as React from 'react';

export default class MessageStatus extends React.Component<any, any>{

    handler: number;

    constructor(props: any){
        super(props);
    }

    get classes() {
        return {
            unpublished: {
                label: 'warning',
                alias: 'Unpublished'
            },
            bchain_publishing: {
                label: 'primary',
                alias: 'Publishing on blockchain'
            },
            bchain_published: {
                label: 'primary',
                alias: 'Published on blockchain'
            },
            msg_channel_published: {
                label: 'success',
                alias: 'Published'
            }
        };
    }

    render() {
        const status = this.props.status;
        return <span className={`label label-table label-${this.classes[status].label ? this.classes[status].label : 'inverse'}`} >
                {this.classes[status].alias}
            </span>;
    }
}
