const Application = require('spectron').Application
const assert = require('assert')
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.
const path = require('path')

describe('Application launch', function () {

  this.timeout(10000)

  beforeEach(function () {
    console.log('before application\'s creation');
    this.app = new Application({
      path: electronPath,
      args: [path.join(__dirname, '..')]
    })
    console.log('after application\'s creation');
    return this.app.start().then(res => {
        console.log('app started!!');
        return res;
    }).catch(err => {
        console.log('app crashed: ', err);
    });
  })

  afterEach(function () {
    if (this.app && this.app.isRunning()) {
      return this.app.stop()
    }
  })

  it('shows an initial window', function () {
/*
      return this.app.client.getText('#h').then(function (hText) {
          assert.equal("Privatix dapp", hText)
      })
*/
  })

})
