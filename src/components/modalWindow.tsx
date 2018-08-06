import * as React from 'react';
import Modal from 'react-awesome-modal-perfected';

export default class ModalWindow extends React.Component<any, any> {

    constructor(props: any) {

        super(props);
        this.state = {
            visible: props.visible,
            props,
            modalTitle: props.modalTitle,
            component: props.component
        };
    }

    closeModal(event: any) {

        if(event){
            event.preventDefault();
        }

        document.body.classList.remove('modal-open');
        this.setState({
            visible: false,
            component: this.props.component,
            modalTitle: this.props.modalTitle
        });
    }

    componentWillUnmount(){
        document.body.classList.remove('modal-open');
    }

    changeContent(modalTitle: string, component: any){
        const props = Object.assign({}, this.state.props, {modalTitle, component});
        this.setState({props, component, modalTitle});
    }

    static getDerivedStateFromProps(props: any, state: any){
        if (state.component !== props.component && state.visible) {
            return {props};
        } else {
            return {props, modalTitle: props.modalTitle, component: props.component};
        }
    }

    showModal(event: any) {
        event.preventDefault();
        this.setState({visible: true});
    }

    render(){

        if (this.state.visible === true) {
            document.body.classList.add('modal-open');
        }

        const content = this.state.visible
            ? <div className='modalWrap'>
                  <Modal
                      visible={this.state.visible}
                      width='90%'
                      effect='fadeInUp'
                      onClickAway={this.closeModal.bind(this)}
                  >
                      <div className='modal-content'>
                          <div className='modal-header'>
                              <h4 className='modal-title'>{this.state.modalTitle}</h4>
                              <button type='button' className='close' onClick={this.closeModal.bind(this)}>×</button>
                          </div>
                          <div className='modal-body'>
                              {React.cloneElement(this.state.component, {closeModal: this.closeModal.bind(this)
                                                                              ,render: this.changeContent.bind(this)
                                                                              ,visible: this.state.visible
                                                                              }
                              )}
                          </div>
                      </div>
                  </Modal>
              </div>
            : <div></div>;

        return (
            <div>
                <a href='#' onClick={this.showModal.bind(this)} className={this.state.props.customClass}>{this.state.props.text}</a>
                {content}
            </div>
        );
    }
}
