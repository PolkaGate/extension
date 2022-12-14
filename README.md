<img src="https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/logo/534b.PNG" data-canonical-src="https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/logo/534b.PNG" width="100" height="100" />

# PolkaGate
![license](https://img.shields.io/badge/License-Apache%202.0-blue?logo=apache&style=flat-square)
![supported by](https://img.shields.io/badge/Supported%20by-Kusama%20Treasury-%20black?logo=polkadot&style=flat-square)

A user-friendly wallet to interact with the Polkadot/Substrate based blockchains through a browser. It allows users to access their Polkadot/Kusama ecosystem account(s), which can also be used to interact with decentralized apps. It injects a [@polkadot/api](https://github.com/polkadot-js/api) signer into a page, along with any associated accounts.

Polkagate extension not only has all the abilities of the original Polkadot extension, but also many new functionalities as listed below are available, where more features are coming.

## New functionalities

Currently, the following features are available:
  - Add address only account ( to be used as a watch only and proxied address) 
  - Crowdloans (View Contributions/Auctions, and contribute to Crowdloans)
  - Staking (Solo and Pool Staking)
  - Proxy management
  - Support different endpoints
  - Transfer funds
  - View balances (crypto/USD)
  - View transaction history
  - View an address as QR code

The following features will be available in the next milestone:

  - Governance 1 (vote referendums, endorse proposals, vote/unvote councils, propose treasury proposals and tips, etc.)
  - Identity management
  - Light client integration 
  - OPenGov (Governance 2)
  - Social Recovery
  

# ![Polkagate extension intro](https://raw.githubusercontent.com/Nick-1979/PolkadotJsPlusPictures/main/polkagate/new/intro.png)

<!-- ### More photos [wiki](https://github.com/Nick-1979/polkadot-Js-Plus-extension/wiki/How-To's) -->


## Installation 

### Add-on

FireFox: The extension for firefox can be downloaded from Firefox add-ons page [here](https://addons.mozilla.org/en-US/firefox/addon/polkagate/)

Chrome: 
   1. Download the [zip file](https://github.com/Nick-1979/polkagate-chrome-developer-version/archive/refs/heads/main.zip)
   2. Go to [`chrome://extensions/`](chrome://extensions/)
   3. Switch on the "Developer mode" on top right
   4. Click on "Load unpacked" button and point to the unzipped downloaded folder

### Development version

Steps to build the extension and view your changes in a browser:

1. Build via `yarn build` or `yarn watch`
2. Install the extension
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


Once added, you can create an account (via a generated seed) or import via an existing seed.


### Testing

* To run unit tests, first install dependencies using `yarn` then use: `yarn test:plus`

* Test on Westend blockchain:

   - It is possible via the provided [add-on](https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-plus-extension/). To receive some westies (Westend's native token) for a created account use [Westend Faucet](https://matrix.to/#/#westend_faucet:matrix.org)

   - Or build the extension on your own, but it needs to append the following Westend network info to './node_modules/@substrate/ss58-registry/esm/index.js') before build:

     `{
		"prefix": 42,
		"network": "westend",
		"displayName": "Westend",
		"symbols": [
			"WND"
		],
		"decimals": [
			12
		],
		"standardAccount": "*25519",
		"website": "https://polkadot.network"
	}`


## More information 

for more information about the extension and how it works, please go to the project [wiki](https://github.com/Nick-1979/polkadot-Js-Plus-extension/wiki) 

<!-- ## To support 


<img src="./packages/extension-polkagate/docs/logos/dot.svg" width="20" />  17VdcY2F3WvhSLFHBGZreubzQNQ3NZzLbQsugGzHmzzprSG

<img src="./packages/extension-polkagate/docs/logos/ksm.svg" width="20" />  Cgp9bcq1dGP1Z9B6F2ccTSTHNez9jq2iUX993ZbDVByPSU2 -->
