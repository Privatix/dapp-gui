import * as React from 'react';
import { translate } from 'react-i18next';

const translated = translate('logs/logsList');

interface IProps {
    t?: any;
    searchText: string;
    handleSearch(evt: any): void;
    handleChangeSearch(evt: any): void;
    handleClearSearch(evt: any): void;
}

function search(props: IProps) {

    const { t, searchText, handleSearch, handleChangeSearch, handleClearSearch } = props;

    return (
        <div className='form-group row'>
            <div className='col-md-12 m-t-10 m-b-10'>
                <div className='input-group searchInputGroup'>
                    <div className='input-group-prepend'>
                        <span className='input-group-text'><i className='fa fa-search'></i></span>
                    </div>
                    <input className='form-control logsSearchInput' type='search' name='query'
                           placeholder={t('LogsSearchPlaceholder')} value={searchText}
                           onKeyPress={handleSearch}
                           onChange={handleChangeSearch} />
                    <div className={`searchClear${searchText === '' ? ' hidden' : ''}`}>
                        <button className='btn btn-icon waves-effect waves-light btn-danger'
                                onClick={handleClearSearch}>
                            <i className='fa fa-remove'></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default translated(search);
