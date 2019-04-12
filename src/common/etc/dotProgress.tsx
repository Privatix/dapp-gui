import * as React from 'react';

interface IProps {
    length?: number;
    delay?: number;
    className?: string;
}

interface IState {
    tick: number;
}
export default class DotProgress extends React.Component<IProps, IState> {

    handler = null;
    state = {tick: 0};

    static defaultProps = {
        length: 3,
        delay: 1000
    };

    componentDidMount(){
        this.tick();
    }

    componentWillUnmount(){
        if(this.handler){
            clearTimeout(this.handler);
        }
    }

    tick = () => {

        const { length, delay } = this.props;

        this.setState({tick: (this.state.tick+1)%(length+1)});

        this.handler = setTimeout(this.tick, delay);

    }

    render(){

        const { length, className } = this.props;
        const { tick } = this.state;

        return (
            <>
                <span className={className}>
                    { '.'.repeat(tick) }
                </span>
                <span style={ {visibility: 'hidden'} }>
                    { '.'.repeat(length-tick) }
                </span>
            </>
        );
    }
}
