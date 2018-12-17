import * as React from 'react';

export default function externalLink(props: any) {
    const shell = require('electron').shell;

    const openExternalLink = (evt:any) => {
        evt.preventDefault();
        shell.openExternal(props.href);
    };

    return <a href='#' onClick={openExternalLink}>{props.text || props.children}</a>;
}
