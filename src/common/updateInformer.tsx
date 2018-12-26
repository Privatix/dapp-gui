import * as React from 'react';
import { connect } from 'react-redux';
// import { translate } from 'react-i18next';
import {State} from 'typings/state';

class UpdateInformer extends React.Component<any, any>{
    render(){
        console.log('INFORMER!!!', this.props.releases);
        return this.props.releases.length ? <span>!</span> : <span>?</span>;
    }
}
export default connect( (state: State) => ({releases: state.releases}) )(UpdateInformer);
