[![npm version](https://badge.fury.io/js/dappctrlgui.svg)](https://badge.fury.io/js/dappctrlgui)
[![Dependency Status](https://david-dm.org/Privatix/dapp-gui.svg)](https://david-dm.org/Privatix/dapp-gui)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-gui.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FPrivatix%2Fdapp-gui?ref=badge_shield)
[![Maintainability](https://api.codeclimate.com/v1/badges/36cd4ddf298a54226e1a/maintainability)](https://codeclimate.com/github/Privatix/dapp-gui/maintainability)

[master](https://github.com/Privatix/dapp-gui):
<img align="center" src="https://ci.privatix.net/plugins/servlet/wittified/build-status/PNG-TES">

[develop](https://github.com/Privatix/dapp-gui/tree/develop):
<img align="center" src="https://ci.privatix.net/plugins/servlet/wittified/build-status/PNG-TES0">

# Privatix Network GUI

This GUI provide user interface for Privatix Agent and Privatix Client.

This GUI based on [electronjs](https://electronjs.org/).

# Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

## Prerequisites

Install prerequisite software:
* [npm v5.6+](https://www.npmjs.com/)
* [node.js 9.3+](https://nodejs.org/en/)

## Installation steps

Clone the `dapp-gui` repository using git:

```
git clone https://github.com/Privatix/dapp-gui.git
cd dapp-gui
git checkout master
```

If Windows is a target OS, install `windows-build-tools`:

```
npm install --global --production windows-build-tools
```

Install dependencies:

```
npm install
```

Checking installation succeed:

```
npm run build
npm start
```

# Tests

## Running the tests

Tests are run using the following command:

```
npm test
```

# Packaging

* Linux:

    ```bash
    npm run package-linux
    ```

* MacOS:

    ```bash
    npm run package-mac
    ```    

* Win:

    ```bash
    npm run package-win
    ```

# Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/Privatix/dapp-gui/tags).

## Authors

* [gonzazoid](https://github.com/gonzazoid)
* [lart5](https://github.com/lart5)
* [Vitold55](https://github.com/Vitold55)

See also the list of [contributors](https://github.com/Privatix/dapp-gui/contributors) who participated in this project.


# License

This project is licensed under the **GPL-3.0 License** - see the [COPYING](COPYING) file for details.
