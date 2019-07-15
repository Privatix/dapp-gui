import {remote} from 'electron';
import i18n from 'i18next/init';
import handlers from 'redux/actions';

export default (dispatch: any) => {
    const {Menu} = remote;
    let template:Electron.MenuItemConstructorOptions[] = [
        {
            label: i18n.t('electronMenu:File'),
            submenu: [
                {
                    label: i18n.t('electronMenu:Quit'),
                    accelerator: 'CmdOrCtrl+Q',
                    role: 'quit'
                }
            ],
        },
        {
            label: i18n.t('electronMenu:Edit'),
            submenu: [
                {
                    label: i18n.t('electronMenu:Undo'),
                    accelerator: 'CmdOrCtrl+Z',
                    role: 'undo'
                },
                {
                    label: i18n.t('electronMenu:Redo'),
                    accelerator: 'Shift+CmdOrCtrl+Z',
                    role: 'redo'
                },
                {
                    type: 'separator'
                },
                {
                    label: i18n.t('electronMenu:Cut'),
                    accelerator: 'CmdOrCtrl+X',
                    role: 'cut'
                },
                {
                    label: i18n.t('electronMenu:Copy'),
                    accelerator: 'CmdOrCtrl+C',
                    role: 'copy'
                },
                {
                    label: i18n.t('electronMenu:Paste'),
                    accelerator: 'CmdOrCtrl+V',
                    role: 'paste'
                },
                {
                    label: i18n.t('electronMenu:PasteAndMatchStyle'),
                    accelerator: 'Shift+CmdOrCtrl+V',
                    role: 'pasteandmatchstyle'
                },
                {
                    label: i18n.t('electronMenu:Delete'),
                    role: 'delete'
                },
                {
                    label: i18n.t('electronMenu:SelectAll'),
                    accelerator: 'CmdOrCtrl+A',
                    role: 'selectall'
                }
            ]
        },
        {
            label: i18n.t('electronMenu:View'),
            submenu: [
                {
                    label: i18n.t('electronMenu:Reload'),
                    accelerator: 'CmdOrCtrl+R',
                    role: 'reload'
                },
                {
                    label: i18n.t('electronMenu:ForceReload'),
                    accelerator: 'Shift+CmdOrCtrl+R',
                    role: 'forcereload'
                },
                {
                    label: i18n.t('electronMenu:ToggleDeveloperTools'),
                    accelerator: 'Shift+CmdOrCtrl+I',
                    role: 'toggledevtools'
                },
                {
                    type: 'separator'
                },
                {
                    label: i18n.t('electronMenu:ActualSize'),
                    accelerator: 'CmdOrCtrl+0',
                    role: 'resetzoom'
                },
                {
                    label: i18n.t('electronMenu:ZoomIn'),
                    accelerator: 'Shift+CmdOrCtrl+=',
                    role: 'zoomin'
                },
                {
                    label: i18n.t('electronMenu:ZoomOut'),
                    accelerator: 'CmdOrCtrl+-',
                    role: 'zoomout'
                },
                {
                    type: 'separator'
                },
                {
                    label: i18n.t('electronMenu:ToggleFullScreen'),
                    accelerator: 'F11',
                    role: 'togglefullscreen'
                }
            ]
        },
        {
            label: i18n.t('electronMenu:Window'),
            role: 'window',
            submenu: [
                {
                    label: i18n.t('electronMenu:Minimize'),
                    accelerator: 'CmdOrCtrl+M',
                    role: 'minimize'
                },
                {
                    label: i18n.t('electronMenu:Close'),
                    accelerator: 'CmdOrCtrl+W',
                    role: 'close'
                },
            ]
        },
        {
            label: i18n.t('electronMenu:Help'),
            role: 'help',
            submenu: [
                {
                    label: i18n.t('electronMenu:AboutProject'),
                    click: function() {
                        dispatch(handlers.showExternalLinkWarning(true, 'https://privatix.io'));
                    }
                },
                {
                    label: i18n.t('electronMenu:Documentation'),
                    click: function() {
                        dispatch(handlers.showExternalLinkWarning(true, 'https://privatix.atlassian.net/wiki/spaces/BVP/pages/270762169/Privatix+DApp+High-level+design'));
                    }
                },
                {
                    label: i18n.t('electronMenu:SearchIssues'),
                    click: function() {
                        dispatch(handlers.showExternalLinkWarning(true, 'https://github.com/Privatix/dapp-gui/issues'));
                    }
                },
                {
                    label: i18n.t('electronMenu:CommunityDiscussion'),
                    click: function() {
                        dispatch(handlers.showExternalLinkWarning(true, 'https://t.me/Privatix'));
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
};
