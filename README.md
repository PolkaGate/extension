<img src="https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/logo/534b.PNG" data-canonical-src="https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/logo/534b.PNG" width="100" height="100" />

# PolkaGate
![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
![](https://img.shields.io/github/issues-raw/PolkaGate/polkagate-extension)
[![ci](https://github.com/PolkaGate/polkagate-extension/actions/workflows/ci-workflow.yml/badge.svg?event=push)](https://github.com/PolkaGate/polkagate-extension/actions/workflows/ci-workflow.yml)
![supported by](https://img.shields.io/badge/Supported%20by-Kusama%20Treasury-%20black?logo=polkadot&style=flat-square)

A user-friendly wallet for seamless browser-based interaction with Polkadot/Substrate-based blockchains. It allows users to access their Polkadot/Kusama ecosystem account(s), which can also be used to interact with decentralized apps. It injects a [@polkadot/api](https://github.com/polkadot-js/api) signer into a page, along with any associated accounts.

Polkagate extension not only has all the abilities of the original Polkadot extension, but also many new functionalities as listed below are available, where more features are coming.

## New functionalities

Currently, the following features are available:
  - Add watch-only account ( can be used as a proxied address) 
  - Crowdloans (View Contributions/Auctions, and contribute to Crowdloans)
  - Governance 
  - Identity management
  - Proxy management
  - Staking (Solo and Pool Staking)
  - Support different endpoints
  - Transfer funds (Cross chain transfer)
  - View balances (crypto/USD)
  - View transaction history
  - View an address as QR code

The following features will be available in the next milestone:

  - Light client integration   
  - Social recovery
  

# ![Polkagate extension intro](https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/new/intro.png)

<!-- ### More photos [wiki](https://github.com/Nick-1979/polkadot-Js-Plus-extension/wiki/How-To's) -->


## Installation 

### Add-on

**FireFox**: The extension for firefox can be downloaded from Firefox add-ons page [here](https://addons.mozilla.org/en-US/firefox/addon/polkagate/)

**Chrome** and **Microsoft Edge**: The extension for these browsers can be downloaded from [here]( https://chrome.google.com/webstore/detail/polkagate-the-gateway-to/ginchbkmljhldofnbjabmeophlhdldgp)


### Development version

Steps to build the extension and view your changes in a browser:

1. Download the files via `git clone https://github.com/polkagate/polkagate-extension.git`
2. Go to downloaded folder via `cd polkagate-extension`
3. Install dependencies via `yarn` (yarn version: 3.2.0)
4. Replace @polkadot/networks/interfaces.js with ./interfaces/interfaces.js 
5. Build via `yarn build`
6. Install the extension
  - Chrome:
    - go to `chrome://extensions/`
    - ensure you have the Development flag set
    - "Load unpacked" and point to `packages/extension/build`
    - if developing, after making changes - refresh the extension
  - Firefox:
    - go to `about:debugging#addons`
    - check "Enable add-on debugging"
    - click on "Load Temporary Add-on" and point to `packages/extension/build/manifest.json`
    - if developing, after making changes - reload the extension


Once added, you can create an account or import via multiple options. To view helpful videos follow our channel on [Youtube](https://youtube.com/@polkagate);


### Testing

* To run unit tests, first install dependencies using `yarn` then use: `yarn test`

* Test on Westend blockchain:

   - It is possible via the extension. To receive some westies (Westend's native token) for a created account use [Westend Faucet](https://matrix.to/#/#westend_faucet:matrix.org)

   - Note that you need to check 'Enable testnet chains' in the Menu/Settings to be able to work with Westend.


<!-- ## More information 

for more information about the extension and how it works, please go to the project [wiki](https://github.com/Nick-1979/polkadot-Js-Plus-extension/wiki)  -->

<!-- ## To support 


<img src="./packages/extension-polkagate/docs/logos/dot.svg" width="20" />  17VdcY2F3WvhSLFHBGZreubzQNQ3NZzLbQsugGzHmzzprSG

<img src="./packages/extension-polkagate/docs/logos/ksm.svg" width="20" />  Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2 -->
