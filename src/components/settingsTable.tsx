import * as React from 'react';
import { withRouter } from 'react-router-dom';

// export default withRouter(function AsyncSettings(props:any){
// class SettingsCell extends React.Component<any, any> {
//     constructor(props: any) {
//         super(props);
//         this.state = {key: props.key, value: props.value, description: props.description, name: props.name};
//     }
//
//     static getDerivedStateFromProps(props: any, prevState: any){
//         return {key: props.key, value: props.value, description: props.description, name: props.name};
//     }
//
//     render(){
//         return <div className='form-control text-right'>
//                     <input id={this.state.key} type='text' defaultValue={this.state.value} data-desc={this.state.description} data-name={this.state.name}/>
//                     <label htmlFor={this.state.key} className='m-b-15'></label>
//                 </div>;
//     }
// }
class SettingsTable extends React.Component<any, any> {

    constructor(props: any) {
        super(props);
        this.state = {
          data: this.props.options,
          filtered: [],
          filterAll: '',
        };
        this.filterAll = this.filterAll.bind(this);
    }

    filterAll(e:any) {
        console.log(e);
        const { value } = e.target;
        const filterAll = value;
        const filtered = [{ id: 'all', value: filterAll }];
        // NOTE: this completely clears any COLUMN filters
        this.setState({ filterAll, filtered });
    }

    onFilteredChange(filtered: Array<any>) {
        // console.log('filtered:',filtered);
        // const { sortedData } = this.reactTable.getResolvedState();
        // console.log('sortedData:', sortedData);

        // extra check for the "filterAll"
        if (filtered.length > 1 && this.state.filterAll.length) {
          // NOTE: this removes any FILTER ALL filter
          const filterAll = '';
          this.setState({ filtered: filtered.filter((item) => item.id !== 'all'), filterAll });
        } else{
          this.setState({ filtered });
        }
    }

    saveOptions(evt:any){
        evt.preventDefault();
        const inputs = document.getElementById('optionsForm').querySelectorAll('input');
        const payload = [].slice.call(inputs, 0).map(option => ({
            key: option.id
           ,value: option.value
           ,description: option.dataset.desc
           ,name: option.dataset.name
        }));
        fetch('/settings', {method: 'put', body: payload}).then(res => {
            // TODO notice?
            this.props.history.push('/app');
        });
    }

    render(){
        console.log('RENEDER', this.state);
        // const { data } = this.state;
        const optionsDOM = (this.state.data as any).map(option => <tr>
                                        <td>{option.name}:</td>
                                        <td>
                                            <div className='form-control text-right'>
                                                <input id={option.key} type='text' defaultValue={option.value} data-desc={option.description} data-name={option.name}/>
                                                <label htmlFor={option.key} className='m-b-15'></label>
                                            </div>
                                        </td>
                                        <td>{option.description}</td>
                                    </tr>);

  // const columns = [{
  //   Header: 'Name',
  //   accessor: 'name' // String-based value accessors!
  // }, {
  //   Header: 'Val',
  //   accessor: 'value',
  //   Cell: <SettingsCell /> /* props => <div className='form-control text-right'>
  //                       <input id={props.key} type='text' defaultValue={props.value} data-desc={props.description} data-name={props.name}/>
  //                       <label htmlFor={props.key} className='m-b-15'></label>
  //                   </div> */,
  //   filterAll: true
  // }, {
  //   Header: 'desc',
  //   accessor: 'description' // Custom value accessors!
  // },
  // {
  //             // NOTE - this is a "filter all" DUMMY column
  //             // you can't HIDE it because then it wont FILTER
  //             // but it has a size of ZERO with no RESIZE and the
  //             // FILTER component is NULL (it adds a little to the front)
  //             // You culd possibly move it to the end
  //             Header: 'All',
  //             id: 'all',
  //             width: 0,
  //             resizable: false,
  //             sortable: true,
  //             Filter: () => { /* */ },
  //             getProps: () => {
  //               return {
  //                 // style: { padding: "0px"}
  //               };
  //             },
  //             filterMethod: (filter, rows) => {
  //                 console.log('FILTER!!!', filter, rows);
  //
  //                 const res = rows.filter(row => {
  //                     if(row.description.indexOf(filter.value) !== -1){
  //                         console.log(row.description, filter.value);
  //                     }
  //                     if(row.name.indexOf(filter.value) !== -1){
  //                         console.log(row.name, filter.value);
  //                     }
  //                     if(row.value.indexOf(filter.value) !== -1){
  //                         console.log(row.value, filter.value);
  //                     }
  //                     return row.description.indexOf(filter.value) !== -1 ||  row.name.indexOf(filter.value) !== -1 || row.value.indexOf(filter.value) !== -1;
  //                 }
  //                 );
  //                 console.log('RESULT!!!', res);
  //                 return res;
  //             },
  //             filterAll: true
  //           }
  // ];
        return (
            <div className='container-fluid'>
                <div className='row'>
                    <div className='col-sm-12 m-b-15'>
                        <h3 className='page-title'>Settings</h3>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-12'>
                        <div className='card-box'>
                            {/*<div className='form-group row'>*/}
                                {/*<div className='col-md-12 m-t-10 m-b-10'>*/}
                                    {/*<div className='input-group searchInputGroup'>*/}
                                        {/*<div className='input-group-prepend'>*/}
                                            {/*<span className='input-group-text'><i className='fa fa-search'></i></span>*/}
                                        {/*</div>*/}
                                        {/*<input className='form-control' type='search' name='search' placeholder='search'*/}
                                            {/*value={this.state.filterAll}*/}
                                            {/*onChange={this.filterAll.bind(this)} />*/}
                                    {/*</div>*/}
                                {/*</div>*/}
                            {/*</div>*/}
                            <form id='optionsForm'>
                                {/*<ReactTable*/}
                                    {/*data={data}*/}
                                    {/*columns={columns}*/}
                                    {/*showPagination={false}*/}
                                    {/*defaultPageSize={(this.state.data as any).length}*/}
                                    {/*filterable={false}*/}
                                    {/*filtered={this.state.filtered}*/}
                                    {/*ref={r => (this as any).reactTable = r}*/}
                                    {/*onFilteredChange={this.onFilteredChange.bind(this)}*/}

                                {/*/>*/}
                                {/*<hr />*/}
                                <table className='table table-bordered table-striped'>
                                    <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Value</th>
                                        <th>Description</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {optionsDOM}
                                    </tbody>
                                </table>
                                <button className='btn btn-default waves-effect waves-light' onClick={this.saveOptions}>Save</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(SettingsTable);
