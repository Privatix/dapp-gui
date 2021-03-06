import fetch from 'node-fetch';
import { LocalSettings } from 'typings/settings';

class UpdateChecker {

    start(settings: LocalSettings, announce: Function){
        this.checkUpdate(settings, announce);
        setTimeout(this.checkUpdate.bind(this, settings, announce), settings.updateCheckFreq*60*1000);
    }

    private async checkUpdate(settings: LocalSettings, announce: Function){

        const res = await fetch(settings.releasesEndpoint);

        try{
            const _releases = JSON.parse(await res.text());
            const releases = _releases.map(release => ({platforms: release.platforms
                                                      ,name: release.name
                                                      ,tag_name: release.tag_name
                                                      ,html_url: release.html_url
                                                      }));
            const versions = releases.map(release => release.tag_name);

            versions.forEach(async (version) => {

                const endpoint = settings.platformsEndpoint.replace(/\%([a-zA-Z]+)\%/, ((subs, _, name) => {
                    return name in subs ? subs[name] : '';
                }).bind(null, {version}));
                const res = await fetch(endpoint);
                if(res.status !== 200){
                   return;
                }
                const desc = JSON.parse(await (res as any).text());
                announce({[version]: Object.assign({}, releases.find(release => release.tag_name === version), {'platforms': desc})});
            });

        } catch ( e ){
            // DO NOTHING
        }
    }
}

export const updateChecker = new UpdateChecker();
