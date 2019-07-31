import * as React from 'react';
import Modal from 'react-awesome-modal-perfected';
import CopyToClipboard from './copyToClipboard';
import { isNotice } from 'utils/notice';

interface IProps {
    customClass: string;
    wrapClass?: string;
    modalTitle: string;
    text: string;
    visible?: boolean;
    component: any;
    copyToClipboard?: boolean;
    // TODO copyToClipboard component should receive child component
}

interface IState {
    visible: boolean;
    props: IProps;
    modalTitle: string;
    component: any;
    contentChanged: boolean;
}

export default class ModalWindow extends React.Component<IProps, IState> {

    private content = React.createRef<HTMLDivElement>();
    private mounted = false;

    constructor(props: IProps) {

        super(props);
        this.state = {
            visible: props.visible,
            props,
            modalTitle: props.modalTitle,
            component: props.component,
            contentChanged: false
        };
    }

    componentDidMount(){
        this.mounted = true;
    }

    componentWillUnmount(){
        this.mounted = false;
        document.body.classList.remove('modal-open');
    }

    isNotTheCase(element: any){
        return ['A', 'BUTTON'].includes(element.tagName) || !document.body.contains(element) || isNotice(element);
    }

    skip = (event: any) => {
        if(this.isNotTheCase(event.srcElement)){
            return;
        }
        event.preventDefault();
        event.stopPropagation();
    }

    closeModalTop = (event: any) => {

        if(this.isNotTheCase(event.srcElement)){
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
        if(this.mounted){
            this.setState({
                visible: false,
                component,
                modalTitle
            });
        }
    }

    changeContent = (modalTitle: string, component: any) => {
        const props = Object.assign({}, this.state.props, {modalTitle, component});
        if(this.mounted){
            this.setState({props, component, modalTitle, contentChanged: true});
        }
    }

    static getDerivedStateFromProps(props: any, state: any){
        if(!state.contentChanged){
            return {props, modalTitle: props.modalTitle, component: props.component};
        }
        return null;
    }

    showModal = (event: any) => {
        event.preventDefault();
        if(this.mounted){
            this.setState({visible: true});
            document.addEventListener('click', this.closeModalTop);
        }

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
                    <div className='modal-content' ref={this.content}>
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
            : null;

        const copyToClipboard = !props.copyToClipboard ? null :
            <CopyToClipboard text={props.text} />;

        return (
            <div className={props.wrapClass ? props.wrapClass : ''}>
                <a href='#' onClick={this.showModal} className={props.customClass} title={props.text}>{props.text}</a>
                {copyToClipboard}
                {content}
            </div>
        );
    }
}
