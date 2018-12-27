import * as React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';

import Start from 'common/start';

import { registerBugsnag } from 'utils/bugsnag';
import { store } from 'utils/storage';

registerBugsnag();

render(<Provider store={store}><Start /></Provider>, document.getElementById('app'));
