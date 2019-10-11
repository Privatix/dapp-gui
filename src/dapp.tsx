import React from 'react';
import { render } from 'react-dom';

import Start from 'common/start';

import { registerBugsnag } from 'utils/bugsnag';

registerBugsnag();

render(<Start />, document.getElementById('app'));
