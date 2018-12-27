import * as React from 'react';

export default function externalLink(props: any) {

    const shell = require('electron').shell;
    const { href, className, text, children } = props;

    const openExternalLink = (evt:any) => {
        evt.preventDefault();
        shell.openExternal(href);
    };

    return <a href='#' className={className} onClick={openExternalLink}>{text || children}</a>;
}
