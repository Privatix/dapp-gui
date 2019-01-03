import * as React from 'react';
import Modal from 'react-awesome-modal-perfected';
import CopyToClipboard from './copyToClipboard';

export default class ModalWindow extends React.Component<any, any> {

    private content = React.createRef<HTMLDivElement>();

    constructor(props: any) {

        super(props);
        this.state = {
            visible: props.visible,
            props,
            modalTitle: props.modalTitle,
            component: props.component,
            contentChanged: false
        };
    }

    skip = (event: any) => {
        console.log(event);
        if(['A', 'BUTTON'].includes(event.srcElement.tagName)){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
    }

    closeModalTop = (event: any) => {

        if(['A', 'BUTTON'].includes(event.srcElement.tagName)){
            return;
        }else{
            this.closeModal(event);
        }
    }

    closeModal = (event: any) => {

        if(event){
            event.preventDefault();
        }

        document.body.classList.remove('modal-open');
        document.removeEventListener('click', this.closeModalTop);

        const { component, modalTitle } = this.props;
        this.setState({
            visible: false,
            component,
            modalTitle
        });
    }

    componentWillUnmount(){
        document.body.classList.remove('modal-open');
    }

    changeContent = (modalTitle: string, component: any) => {
        const props = Object.assign({}, this.state.props, {modalTitle, component});
        this.setState({props, component, modalTitle, contentChanged: true});
    }

    static getDerivedStateFromProps(props: any, state: any){
        if(!state.contentChanged){
            return {props, modalTitle: props.modalTitle, component: props.component};
        }
        return null;
    }

    showModal = (event: any) => {
        event.preventDefault();
        this.setState({visible: true});
        document.addEventListener('click', this.closeModalTop);

    }

    componentDidUpdate(){
        if(this.state.visible){
            this.content.current.addEventListener('click', this.skip, false);
        }
    }

    render() {
        const { visible, props} = this.state;

        if (visible === true) {
            document.body.classList.add('modal-open');
        }

        const content = visible
            ? <div className='modalWrap'>
                <Modal
                    visible={visible}
                    width='90%'
                    effect='fadeInUp'
                    onClickAway={this.closeModal}
                >
                    <div ref={this.content} className='modal-content'>
                        <div className='modal-header'>
                            <h4 className='modal-title'>{this.state.modalTitle}</h4>
                            <button type='button' className='close' onClick={this.closeModal}>×</button>
                        </div>
                        <div className='modal-body'>
                            {React.cloneElement(this.state.component, {closeModal: this.closeModal
                                    ,render: this.changeContent
                                    ,visible
                                }
                            )}
                        </div>
                    </div>
                </Modal>
            </div>
            : <div></div>;

        const copyToClipboard = !props.copyToClipboard ? '' :
            <CopyToClipboard text={props.text} />;

        return (
            <div>
                <a href='#' onClick={this.showModal} className={props.customClass} title={props.text}>{props.text}</a>
                {copyToClipboard}
                {content}
            </div>
        );
    }
}
