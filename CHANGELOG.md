# Change Log

## [1.23.1](https://github.com/polkagate/extension/compare/v1.23.0...v1.23.1) (2026-01-01)


### Bug Fixes

* clean up selected notification accounts after account removal ([#2076](https://github.com/polkagate/extension/issues/2076)) ([f0d8aaf](https://github.com/polkagate/extension/commit/f0d8aaf9789ec81537c737fc34d8bc0c38c646ae))

# [1.23.0](https://github.com/polkagate/extension/compare/v1.22.0...v1.23.0) (2026-01-01)


### Features

* link notification items to Subscan/Subsquare pages ([#2086](https://github.com/polkagate/extension/issues/2086)) ([308d4e7](https://github.com/polkagate/extension/commit/308d4e72ce743c86abfe6dbeff839601e5ef4b80))

# [1.22.0](https://github.com/polkagate/extension/compare/v1.21.5...v1.22.0) (2025-12-30)


### Features

* add Portuguese language support ([#2084](https://github.com/polkagate/extension/issues/2084)) ([d3d1997](https://github.com/polkagate/extension/commit/d3d1997a5d4392f46bd0a86ca4cf1f12d9fcc5d9))

## [1.21.5](https://github.com/polkagate/extension/compare/v1.21.4...v1.21.5) (2025-12-27)


### Bug Fixes

* handle staking page when account has no position on unsupported chain ([c2d7632](https://github.com/polkagate/extension/commit/c2d7632a9ace07bc95be3544fdb446ba969d3e8f))

## [1.21.4](https://github.com/polkagate/extension/compare/v1.21.3...v1.21.4) (2025-12-21)


### Bug Fixes

* resolve pending rewards expiration issue caused by API derive malfunction ([#2072](https://github.com/polkagate/extension/issues/2072)) ([fe49a73](https://github.com/polkagate/extension/commit/fe49a735a9e8731458751c23f850b23cfead1629)), closes [#2068](https://github.com/polkagate/extension/issues/2068)

## [1.21.3](https://github.com/polkagate/extension/compare/v1.21.2...v1.21.3) (2025-12-21)


### Bug Fixes

* resolve incorrect validator APY after migration due to hub era length ([#2071](https://github.com/polkagate/extension/issues/2071)) ([195efa5](https://github.com/polkagate/extension/commit/195efa52739324b8558752102f69623734d56b29)), closes [#2070](https://github.com/polkagate/extension/issues/2070)

## [1.21.2](https://github.com/polkagate/extension/compare/v1.21.1...v1.21.2) (2025-12-20)


### Bug Fixes

* resolve a minor issue when enabling notifications  ([53edc26](https://github.com/polkagate/extension/commit/53edc26849b13a16d8a66eec29489144522a74af))

## [1.21.1](https://github.com/polkagate/extension/compare/v1.21.0...v1.21.1) (2025-12-20)


### Bug Fixes

* resolve notification enable/disable issue ([#2067](https://github.com/polkagate/extension/issues/2067)) ([707f060](https://github.com/polkagate/extension/commit/707f060f07e9365e6031b6719ac24ea20919e072))

# [1.21.0](https://github.com/polkagate/extension/compare/v1.20.0...v1.21.0) (2025-12-10)


### Features

* implement notifications feature ([0336c6c](https://github.com/polkagate/extension/commit/0336c6c30684b5814e1c5610dfa9e4e903a7b0e5))

# [1.20.0](https://github.com/polkagate/extension/compare/v1.19.8...v1.20.0) (2025-12-10)


### Features

* show validator details in staking tabs for validator accounts ([#2063](https://github.com/polkagate/extension/issues/2063)) ([ae877e8](https://github.com/polkagate/extension/commit/ae877e8ec66fe79a4355926212186b5669065d6e))

## [1.19.8](https://github.com/polkagate/extension/compare/v1.19.7...v1.19.8) (2025-11-26)


### Bug Fixes

* resolve solo staking settings issue where selecting “Others” disables the next step ([#2060](https://github.com/polkagate/extension/issues/2060)) ([625fdfe](https://github.com/polkagate/extension/commit/625fdfea07e399c1d961d010dbe77b783053b86e))

## [1.19.7](https://github.com/polkagate/extension/compare/v1.19.6...v1.19.7) (2025-11-25)


### Bug Fixes

* correct reward destination display when set to STAKED ([3413d84](https://github.com/polkagate/extension/commit/3413d84b9e6bd393192813bfefccd034c72aea7c))

## [1.19.6](https://github.com/polkagate/extension/compare/v1.19.5...v1.19.6) (2025-11-22)


### Bug Fixes

* show user-added networks in the network selection list in modals ([#2058](https://github.com/polkagate/extension/issues/2058)) ([314eb5e](https://github.com/polkagate/extension/commit/314eb5ed287bd76eff31fd7c2c32b264c2d32f7a))

## [1.19.5](https://github.com/polkagate/extension/compare/v1.19.4...v1.19.5) (2025-11-21)


### Bug Fixes

* filter out possible undefined price IDs ([7040650](https://github.com/polkagate/extension/commit/7040650f4bdbb29741c633fc8f6f05489a51618f))

## [1.19.4](https://github.com/polkagate/extension/compare/v1.19.3...v1.19.4) (2025-11-20)


### Bug Fixes

* dynamically select payment signed extension based on chain support ([ed678b0](https://github.com/polkagate/extension/commit/ed678b0aa14c56e26e622eeaac59959b9201939d))
* update approach to find supported chains for cross-chain token transfers ([4853cf8](https://github.com/polkagate/extension/commit/4853cf892e4f327416a0f68078515821a2b086f1))

## [1.19.3](https://github.com/polkagate/extension/compare/v1.19.2...v1.19.3) (2025-11-19)


### Bug Fixes

* handle signing with metadata only when the chain is not already supported ([#2049](https://github.com/polkagate/extension/issues/2049)) ([677ca13](https://github.com/polkagate/extension/commit/677ca139073118813b2395b180fc0746932f78fd))

## [1.19.2](https://github.com/polkagate/extension/compare/v1.19.1...v1.19.2) (2025-11-19)


### Bug Fixes

* prevent home layout from appearing during accounts import ([#2046](https://github.com/polkagate/extension/issues/2046)) ([28e80cc](https://github.com/polkagate/extension/commit/28e80cc81d739955522f2a67dad52c4543589e0d))

## [1.19.1](https://github.com/polkagate/extension/compare/v1.19.0...v1.19.1) (2025-11-19)


### Bug Fixes

* enable pending rewards button in full screen regardless of earned amount ([#2052](https://github.com/polkagate/extension/issues/2052)) ([696119c](https://github.com/polkagate/extension/commit/696119c857055998ff1c43e3ae3783276c2d579d))

# [1.19.0](https://github.com/polkagate/extension/compare/v1.18.0...v1.19.0) (2025-11-18)


### Features

* add support for the NeuroWeb parachain ([#2038](https://github.com/polkagate/extension/issues/2038)) ([a0e9106](https://github.com/polkagate/extension/commit/a0e9106c56d656146ae1b9b71096c73a9d796f4e))

# [1.18.0](https://github.com/polkagate/extension/compare/v1.17.0...v1.18.0) (2025-11-17)


### Features

* The extension now supports German! ([912619f](https://github.com/polkagate/extension/commit/912619fead62029e5d9ca73fc42b3e67d0a8f4a4))

# [1.17.0](https://github.com/polkagate/extension/compare/v1.16.3...v1.17.0) (2025-11-17)


### Features

* add lazy unlocking to speed up login for users with many accounts ([#2039](https://github.com/polkagate/extension/issues/2039)) ([9864097](https://github.com/polkagate/extension/commit/986409751ecef11e1130fe286eafc5d726fc1cfa))

## [1.16.3](https://github.com/polkagate/extension/compare/v1.16.2...v1.16.3) (2025-11-11)


### Bug Fixes

* resolve misdisplayed unlock date in reserved reasons section ([#2023](https://github.com/polkagate/extension/issues/2023)) ([88b9007](https://github.com/polkagate/extension/commit/88b90079587a9d4784822fc8c9d03928678fb412))

## [1.16.2](https://github.com/polkagate/extension/compare/v1.16.1...v1.16.2) (2025-11-10)


### Bug Fixes

* force password migration when no legacy password is present ([#2019](https://github.com/polkagate/extension/issues/2019)) ([01b7d45](https://github.com/polkagate/extension/commit/01b7d459c63869904b9ae74e7aa4b19e8ed84fe4))

## [1.16.1](https://github.com/polkagate/extension/compare/v1.16.0...v1.16.1) (2025-11-04)


### Bug Fixes

* correct Hindi and Russian translation entries ([1766fa6](https://github.com/polkagate/extension/commit/1766fa6ff2b8ce49b890f640ed3f85129e5fcca6))

# [1.16.0](https://github.com/polkagate/extension/compare/v1.15.5...v1.16.0) (2025-11-01)


### Features

* add support for migrating polkadot hub ([#1995](https://github.com/polkagate/extension/issues/1995)) ([4dfc70b](https://github.com/polkagate/extension/commit/4dfc70b04af6d59a610ce62b1f2e377aa119a862))

## [1.15.5](https://github.com/polkagate/extension/compare/v1.15.4...v1.15.5) (2025-11-01)


### Bug Fixes

* avoid onboarding redirect when extension is locked and accounts are not yet loaded ([#2003](https://github.com/polkagate/extension/issues/2003)) ([3285aa7](https://github.com/polkagate/extension/commit/3285aa752b8cb0df43ef30fc6437595aa04ecf83))

## [1.15.4](https://github.com/polkagate/extension/compare/v1.15.3...v1.15.4) (2025-10-30)


### Bug Fixes

* adjust unlocking token release display timing ([35d405b](https://github.com/polkagate/extension/commit/35d405bb3cdcb0c15215a9323716211c12082eea))

## [1.15.3](https://github.com/polkagate/extension/compare/v1.15.2...v1.15.3) (2025-10-30)


### Bug Fixes

* correct release dates for unstaking amounts after Hub migration ([#1999](https://github.com/polkagate/extension/issues/1999)) ([7c4094d](https://github.com/polkagate/extension/commit/7c4094d2d54cab8e753a78c280dd6dc0c3cec658)), closes [#2000](https://github.com/polkagate/extension/issues/2000)

## [1.15.2](https://github.com/polkagate/extension/compare/v1.15.1...v1.15.2) (2025-10-28)


### Bug Fixes

* update balances correctly when only watch-only accounts are in the extension ([#1991](https://github.com/polkagate/extension/issues/1991)) ([d5c26fa](https://github.com/polkagate/extension/commit/d5c26fae6327d02ae14bd32ba79c06e5b5f879ac))

## [1.15.1](https://github.com/polkagate/extension/compare/v1.15.0...v1.15.1) (2025-10-27)


### Bug Fixes

* resolve width issue in extension mode for NoPrivateKeySigningButton ([#1993](https://github.com/polkagate/extension/issues/1993)) ([0210c7c](https://github.com/polkagate/extension/commit/0210c7cc1af462b0f6ee3e55120521e17e006fab))

# [1.15.0](https://github.com/polkagate/extension/compare/v1.14.0...v1.15.0) (2025-10-27)


### Features

* add token chart to trending assets section ([#1987](https://github.com/polkagate/extension/issues/1987)) ([2feee91](https://github.com/polkagate/extension/commit/2feee91215d7bc97eee64f4221afc8431c60a73a)), closes [#1989](https://github.com/polkagate/extension/issues/1989)

# [1.14.0](https://github.com/polkagate/extension/compare/v1.13.3...v1.14.0) (2025-10-26)


### Features

* add master password ([#1963](https://github.com/polkagate/extension/issues/1963)) ([d15ccfa](https://github.com/polkagate/extension/commit/d15ccfa489ea2152beb7c622ffc5653e31c4c314)), closes [#1969](https://github.com/polkagate/extension/issues/1969) [#1970](https://github.com/polkagate/extension/issues/1970) [#1973](https://github.com/polkagate/extension/issues/1973) [#1977](https://github.com/polkagate/extension/issues/1977) [#1978](https://github.com/polkagate/extension/issues/1978) [#1980](https://github.com/polkagate/extension/issues/1980) [#1982](https://github.com/polkagate/extension/issues/1982) [#1979](https://github.com/polkagate/extension/issues/1979) [#1986](https://github.com/polkagate/extension/issues/1986)

## [1.13.3](https://github.com/polkagate/extension/compare/v1.13.2...v1.13.3) (2025-10-20)


### Bug Fixes

* allow hardware accounts to appear on all chains by removing genesisHash binding during creation ([ffa3324](https://github.com/polkagate/extension/commit/ffa3324ee61df3a60328637332b15066406d758d))

## [1.13.2](https://github.com/polkagate/extension/compare/v1.13.1...v1.13.2) (2025-10-19)


### Bug Fixes

* add fallback to redirect unmatched routes to home ([#1967](https://github.com/polkagate/extension/issues/1967)) ([e2062a8](https://github.com/polkagate/extension/commit/e2062a8f19d4dd3629d522138917995f180a41e2))

# [1.13.0](https://github.com/polkagate/extension/compare/v1.12.2...v1.13.0) (2025-10-08)


### Features

* add Telegram support channel to social links ([4753d85](https://github.com/polkagate/extension/commit/4753d85a484f644e11623cfff1267e16cb6c06d0))

## [1.12.2](https://github.com/polkagate/extension/compare/v1.12.1...v1.12.2) (2025-10-07)


### Bug Fixes

* display Fast Unstake button only on chains that support it ([6985706](https://github.com/polkagate/extension/commit/6985706be55f965e5ad8df6d03147f54062bd451))

## [1.12.1](https://github.com/polkagate/extension/compare/v1.12.0...v1.12.1) (2025-10-07)


### Bug Fixes

* add workaround to handle missing API endpoints during Kusama partial migration ([#1953](https://github.com/polkagate/extension/issues/1953)) ([8d0d73e](https://github.com/polkagate/extension/commit/8d0d73e61cba989184e0a377731f0ec702a902a0))

# [1.12.0](https://github.com/polkagate/extension/compare/v1.11.3...v1.12.0) (2025-10-07)


### Features

* add “Manage Networks” button to account home screen ([a8dce25](https://github.com/polkagate/extension/commit/a8dce25aae624e29a07126b11bc5428cf4ff8fd8))

## [1.11.3](https://github.com/polkagate/extension/compare/v1.11.2...v1.11.3) (2025-10-06)


### Bug Fixes

* showing user added endpoints ([#1949](https://github.com/polkagate/extension/issues/1949)) ([752ff4d](https://github.com/polkagate/extension/commit/752ff4dab5cc3eca78b42f97175af90af135ff0b))

## [1.11.2](https://github.com/polkagate/extension/compare/v1.11.1...v1.11.2) (2025-10-06)


### Bug Fixes

* handle non-numeric asset IDs in transfer fund flow ([#1944](https://github.com/polkagate/extension/issues/1944)) ([acd9266](https://github.com/polkagate/extension/commit/acd9266abd987a71c39bb0d6dd5e7835e55bf695)), closes [#1943](https://github.com/polkagate/extension/issues/1943)

## [1.11.1](https://github.com/polkagate/extension/compare/v1.11.0...v1.11.1) (2025-10-04)


### Bug Fixes

* remove duplicate proxy address when account not found in extension ([61b34a6](https://github.com/polkagate/extension/commit/61b34a668d57ef956edca8f8d497ca9f2ec100a0)), closes [#1926](https://github.com/polkagate/extension/issues/1926)

# [1.11.0](https://github.com/polkagate/extension/compare/v1.10.1...v1.11.0) (2025-10-04)


### Features

* add support for migrating Kusama hub ([#1932](https://github.com/polkagate/extension/issues/1932)) ([edb2e3a](https://github.com/polkagate/extension/commit/edb2e3ac5aff4f8d4945287c0aa359845acdb5b3))

## [1.10.1](https://github.com/polkagate/extension/compare/v1.10.0...v1.10.1) (2025-10-04)


### Bug Fixes

* handle cross-chain fee calculation issue ([#1928](https://github.com/polkagate/extension/issues/1928)) ([8b06a92](https://github.com/polkagate/extension/commit/8b06a92e8e47f31b1ab0c779b59077e107e0e779))

# [1.10.0](https://github.com/polkagate/extension/compare/v1.9.7...v1.10.0) (2025-09-30)


### Features

* add governance unlock feature showing remaining time if not yet unlockable ([13bc064](https://github.com/polkagate/extension/commit/13bc064ba6fb6fd9cd65f2c02c232e2c6448e42a))

## [1.9.7](https://github.com/polkagate/extension/compare/v1.9.6...v1.9.7) (2025-09-23)


### Bug Fixes

* show password input for consecutive signing requests ([#1909](https://github.com/polkagate/extension/issues/1909)) ([e1a2314](https://github.com/polkagate/extension/commit/e1a23148825f56830f4c738e1e3f6e470f4f0dab))

## [1.9.6](https://github.com/polkagate/extension/compare/v1.9.5...v1.9.6) (2025-09-23)


### Bug Fixes

* resolve recipient address does not appear in the history ([#1913](https://github.com/polkagate/extension/issues/1913)) ([62d8553](https://github.com/polkagate/extension/commit/62d85532bf884ffc836ea38a4c2ece4b7a59a7c0))

## [1.9.5](https://github.com/polkagate/extension/compare/v1.9.4...v1.9.5) (2025-09-23)


### Bug Fixes

* resolve transfer-all missing amount and long account name display issues on signing page ([#1918](https://github.com/polkagate/extension/issues/1918)) ([36ce74e](https://github.com/polkagate/extension/commit/36ce74ea4a3813fe331f5bc29733b554c23b952e)), closes [#1915](https://github.com/polkagate/extension/issues/1915) [#1917](https://github.com/polkagate/extension/issues/1917)

## [1.9.4](https://github.com/polkagate/extension/compare/v1.9.3...v1.9.4) (2025-09-22)


### Bug Fixes

* resolve selected validators sort problems ([#1912](https://github.com/polkagate/extension/issues/1912)) ([d30e495](https://github.com/polkagate/extension/commit/d30e49562e1a79b576e3ac773294e6ecf8c90b27))

## [1.9.3](https://github.com/polkagate/extension/compare/v1.9.2...v1.9.3) (2025-09-21)


### Bug Fixes

* prevent auto renewal of the no password session ([#1905](https://github.com/polkagate/extension/issues/1905)) ([8467879](https://github.com/polkagate/extension/commit/8467879b17811c4fcbf67bd8c60fe483690fb6de))

## [1.9.2](https://github.com/polkagate/extension/compare/v1.9.1...v1.9.2) (2025-09-20)


### Bug Fixes

* migrate accounts for compatibility with strict apps (e.g., Polkadot.js) ([#1895](https://github.com/polkagate/extension/issues/1895)) ([1b9c38c](https://github.com/polkagate/extension/commit/1b9c38c7e673e9a467ba70650f35c141754e0a0e)), closes [#1893](https://github.com/polkagate/extension/issues/1893)

## [1.9.1](https://github.com/polkagate/extension/compare/v1.9.0...v1.9.1) (2025-09-20)


### Bug Fixes

* fullscreen 'Derive New Account' menu opens correct modal ([#1894](https://github.com/polkagate/extension/issues/1894)) ([a2d99db](https://github.com/polkagate/extension/commit/a2d99db674cd57a7598337ae54656beccfdd127c))

# [1.9.0](https://github.com/polkagate/extension/compare/v1.8.8...v1.9.0) (2025-09-19)


### Features

* include migrated relay chain proxies for Asset Hubs [#1887](https://github.com/polkagate/extension/issues/1887) ([#1888](https://github.com/polkagate/extension/issues/1888)) ([ef9ec96](https://github.com/polkagate/extension/commit/ef9ec965a1ce6ca0cdbc758a78d4adcc5c66727a))

## [1.8.8](https://github.com/polkagate/extension/compare/v1.8.7...v1.8.8) (2025-09-18)


### Bug Fixes

* correct migration check for People chain when comparing by chain name ([#1883](https://github.com/polkagate/extension/issues/1883)) ([d8a7901](https://github.com/polkagate/extension/commit/d8a7901be3e11b02221c3af18d184bf207f11cc5))

## [1.8.7](https://github.com/polkagate/extension/compare/v1.8.6...v1.8.7) (2025-09-17)


### Bug Fixes

* enforce fullscreen lock when reset wallet is dismissed ([#1881](https://github.com/polkagate/extension/issues/1881)) ([3ce8b52](https://github.com/polkagate/extension/commit/3ce8b5208fe9c6d90a5fb637ad1b8c02828230a3))

## [1.8.6](https://github.com/polkagate/extension/compare/v1.8.5...v1.8.6) (2025-09-16)


### Bug Fixes

* resolve staking chain selection ([#1859](https://github.com/polkagate/extension/issues/1859)) ([f346c56](https://github.com/polkagate/extension/commit/f346c569bc42a21d92e4f2a8500d304ad0115479))

## [1.8.5](https://github.com/polkagate/extension/compare/v1.8.4...v1.8.5) (2025-09-16)


### Bug Fixes

* replace back button with 'Done' in extension mode on receive page ([#1861](https://github.com/polkagate/extension/issues/1861)) ([dd694e1](https://github.com/polkagate/extension/commit/dd694e16403d49e6527b0abea3cd8e964a19ff47))

## [1.8.4](https://github.com/polkagate/extension/compare/v1.8.3...v1.8.4) (2025-09-16)


### Bug Fixes

* resolve back button issue in full-screen mode on Receive page ([#1863](https://github.com/polkagate/extension/issues/1863)) ([f05af41](https://github.com/polkagate/extension/commit/f05af415276870cf3201b072bcf677c2b7caaee4))

## [1.8.3](https://github.com/polkagate/extension/compare/v1.8.2...v1.8.3) (2025-09-16)


### Bug Fixes

* resolve back button unresponsiveness caused by snackbar overlay ([5500ff4](https://github.com/polkagate/extension/commit/5500ff488167c63037e101181508f2eed0d877ca))

## [1.8.2](https://github.com/polkagate/extension/compare/v1.8.1...v1.8.2) (2025-09-16)


### Bug Fixes

* update staking chain options in select chain modal ([#1857](https://github.com/polkagate/extension/issues/1857)) ([84adf78](https://github.com/polkagate/extension/commit/84adf78009d348678b9cab7b4cce1b8b7ac98aa7))

## [1.8.1](https://github.com/polkagate/extension/compare/v1.8.0...v1.8.1) (2025-09-15)


### Bug Fixes

* prevent rare repeated reset on token change in staking page ([#1855](https://github.com/polkagate/extension/issues/1855)) ([689ad19](https://github.com/polkagate/extension/commit/689ad19f6c76c464e3d25a16168db15a5edc951c))

# [1.8.0](https://github.com/polkagate/extension/compare/v1.7.2...v1.8.0) (2025-09-15)


### Features

* implement hubs staking and balance migration ([#1807](https://github.com/polkagate/extension/issues/1807)) ([413bc5e](https://github.com/polkagate/extension/commit/413bc5eca77e84a28492ac191b226ffed6a6e818)), closes [#1844](https://github.com/polkagate/extension/issues/1844)

## [1.7.2](https://github.com/polkagate/extension/compare/v1.7.1...v1.7.2) (2025-09-15)


### Performance Improvements

* optimize hooks ([45e47fb](https://github.com/polkagate/extension/commit/45e47fb0c1f5b4d73f3b08f29ecf8b51493dcd87))

## [1.7.1](https://github.com/polkagate/extension/compare/v1.7.0...v1.7.1) (2025-09-15)


### Bug Fixes

* resolve URL flicker in Manage Proxy when navigated from Home menu ([#1853](https://github.com/polkagate/extension/issues/1853)) ([90ca5c5](https://github.com/polkagate/extension/commit/90ca5c5748d1858a91bc59471f7e7a4d98413fd8))

# [1.7.0](https://github.com/polkagate/extension/compare/v1.6.2...v1.7.0) (2025-09-14)


### Features

* support paying fees with non-native assets ([#1848](https://github.com/polkagate/extension/issues/1848)) ([564617f](https://github.com/polkagate/extension/commit/564617fb48b62668d63389a22cd59b4822a18157))

## [1.6.2](https://github.com/polkagate/extension/compare/v1.6.1...v1.6.2) (2025-09-14)


### Bug Fixes

* resolve duplicate token name issue in Polkadot Asset Hub ([#1851](https://github.com/polkagate/extension/issues/1851)) ([4b33407](https://github.com/polkagate/extension/commit/4b3340718f6debe805237c9d417bae846fac1648))

## [1.6.1](https://github.com/polkagate/extension/compare/v1.6.0...v1.6.1) (2025-09-11)


### Bug Fixes

* correct non-native balance decimals and token display in fullscreen token page ([b2e1a56](https://github.com/polkagate/extension/commit/b2e1a563c804fdb43f968fd818ec9fc6f236c1d8))

# [1.6.0](https://github.com/polkagate/extension/compare/v1.5.8...v1.6.0) (2025-09-09)


### Features

* introduce 15-minute no-password session ([#1846](https://github.com/polkagate/extension/issues/1846)) ([d3c5392](https://github.com/polkagate/extension/commit/d3c53925b71f9f5134a32d3aadcc93f64ea770ec))

## [1.5.8](https://github.com/polkagate/extension/compare/v1.5.7...v1.5.8) (2025-09-07)


### Bug Fixes

* exclude unreleased changes from changelog ([#1841](https://github.com/polkagate/extension/issues/1841)) ([816a75b](https://github.com/polkagate/extension/commit/816a75b2794e2d89373f2b6d27627736033bc71f))

## [1.5.7](https://github.com/polkagate/extension/compare/v1.5.6...v1.5.7) (2025-09-07)


### Bug Fixes

* resolve full-screen URL path in nomination settings ([f87b1c8](https://github.com/polkagate/extension/commit/f87b1c8c403634b402738082dec665fe4537b442))
* resolve issue with opening all NFTs in extension mode ([#1839](https://github.com/polkagate/extension/issues/1839)) ([a86aade](https://github.com/polkagate/extension/commit/a86aade7e89b86838ac89258813509807d8d9e02)), closes [#1838](https://github.com/polkagate/extension/issues/1838)

## [1.5.6](https://github.com/polkagate/extension/compare/v1.5.5...v1.5.6) (2025-09-07)


### Bug Fixes

* handle long pool names in easy staking page ([#1834](https://github.com/polkagate/extension/issues/1834)) ([ddf448e](https://github.com/polkagate/extension/commit/ddf448e9153248605023c54b8ffb980176ec3a66))

## [1.5.5](https://github.com/polkagate/extension/compare/v1.5.4...v1.5.5) (2025-09-06)


### Bug Fixes

* incorrect large amount display in staking tiles ([#1831](https://github.com/polkagate/extension/issues/1831)) ([d4ef542](https://github.com/polkagate/extension/commit/d4ef542e56436dfc1ba5f41ba574a32ba379e7f8))

## [1.5.4](https://github.com/polkagate/extension/compare/v1.5.3...v1.5.4) (2025-09-06)


### Bug Fixes

* display issue with pool details on staking pages in extension mode ([#1833](https://github.com/polkagate/extension/issues/1833)) ([0861613](https://github.com/polkagate/extension/commit/08616131bcb55c5a452dfedc89a8b52a10bb1732))
* resolve pool name width issue in easy staking ([#1832](https://github.com/polkagate/extension/issues/1832)) ([7d1f46e](https://github.com/polkagate/extension/commit/7d1f46ebc2369cff1aa585b97bdb0ca9b6a93b93))

## [1.5.3](https://github.com/polkagate/extension/compare/v1.5.2...v1.5.3) (2025-09-04)


### Bug Fixes

* resolve multipart button text in various languages ([#1827](https://github.com/polkagate/extension/issues/1827)) ([f152f61](https://github.com/polkagate/extension/commit/f152f61ad57ffed91307297ded9f7774fb447765)), closes [#1829](https://github.com/polkagate/extension/issues/1829)

## [1.5.2](https://github.com/polkagate/extension/compare/v1.5.1...v1.5.2) (2025-09-03)


### Bug Fixes

* add estimated fee prop ([#1823](https://github.com/polkagate/extension/issues/1823)) ([9052e83](https://github.com/polkagate/extension/commit/9052e834c7511ddb8ca5283ff8f8aa1c1c716246))

## [1.5.1](https://github.com/polkagate/extension/compare/v1.5.0...v1.5.1) (2025-09-02)


### Bug Fixes

* resolve sign area with issue when using ledger ([f014596](https://github.com/polkagate/extension/commit/f0145969aa522152451abe3dea4d6999996cf00e))

# [1.5.0](https://github.com/polkagate/extension/compare/v1.4.0...v1.5.0) (2025-09-02)


### Features

* display can not pay fee warning ([#1819](https://github.com/polkagate/extension/issues/1819)) ([639d48b](https://github.com/polkagate/extension/commit/639d48b1b276e7b65598c8c81778aca55db7e1c6))

# [1.4.0](https://github.com/polkagate/extension/compare/v1.3.6...v1.4.0) (2025-08-31)


### Features

* add update metadata design ([1df7895](https://github.com/polkagate/extension/commit/1df78958829c5814858700bcf01005a65f133b02))
* update phishing alert design ([5e19aaa](https://github.com/polkagate/extension/commit/5e19aaa53d072eb267a5d7b94291f553cf85df26))

## [1.3.6](https://github.com/polkagate/extension/compare/v1.3.5...v1.3.6) (2025-08-31)


### Bug Fixes

* resolve warning issue in extension mode ([2c863d0](https://github.com/polkagate/extension/commit/2c863d04f918471085ebb214f137efa870a6342f))

## [1.3.5](https://github.com/polkagate/extension/compare/v1.3.4...v1.3.5) (2025-08-31)


### Bug Fixes

* resolve stuck at loading asset in account page fullscreen ([#1813](https://github.com/polkagate/extension/issues/1813)) ([1b80b53](https://github.com/polkagate/extension/commit/1b80b536554606039070438b5223e1423f494ec1)), closes [#1814](https://github.com/polkagate/extension/issues/1814)

## [1.3.4](https://github.com/polkagate/extension/compare/v1.3.3...v1.3.4) (2025-08-31)


### Bug Fixes

* select defaultGenesisAndAssetId issue ([#1815](https://github.com/polkagate/extension/issues/1815)) ([f815c25](https://github.com/polkagate/extension/commit/f815c252563c6a69a065419204794a5fac0a79ce))

## [1.3.3](https://github.com/polkagate/extension/compare/v1.3.2...v1.3.3) (2025-08-30)


### Bug Fixes

* resolve my share issue when it is 0 ([a388cd1](https://github.com/polkagate/extension/commit/a388cd182340eb2556d190d8a1226efd5b752b0d))

## [1.3.2](https://github.com/polkagate/extension/compare/v1.3.1...v1.3.2) (2025-08-30)


### Bug Fixes

* resolve people issue in subscan urls ([39902e1](https://github.com/polkagate/extension/commit/39902e1f69fc39cfb600a1b0210da72bcdaab7d5))

## [1.3.1](https://github.com/polkagate/extension/compare/v1.3.0...v1.3.1) (2025-08-30)


### Bug Fixes

* resolve available balance ([#1809](https://github.com/polkagate/extension/issues/1809)) ([019e347](https://github.com/polkagate/extension/commit/019e34747ac6f4a7ee5617ab6912cc0b9c8c04c7)), closes [#1811](https://github.com/polkagate/extension/issues/1811)
* return staking home from nomination fs ([#1812](https://github.com/polkagate/extension/issues/1812)) ([ae28099](https://github.com/polkagate/extension/commit/ae28099d167ad15e46fe4ef0aa97f9e32572f198))

# [1.3.0](https://github.com/polkagate/extension/compare/v1.2.8...v1.3.0) (2025-08-30)


### Features

* add exponential backoff while fetching fails ([#1810](https://github.com/polkagate/extension/issues/1810)) ([651cb14](https://github.com/polkagate/extension/commit/651cb1440bac43435c13900f47fee279a3fe6df8))

## [1.2.8](https://github.com/polkagate/extension/compare/v1.2.7...v1.2.8) (2025-08-29)


### Bug Fixes

* resolve incorrect comparison of genesis with chain name ([d3c1c38](https://github.com/polkagate/extension/commit/d3c1c38389cdbf4e7b82284a2d27d65cf0bb6754))

## [1.2.7](https://github.com/polkagate/extension/compare/v1.2.6...v1.2.7) (2025-08-29)


### Bug Fixes

* compare token symbols in the same case ([52e43dd](https://github.com/polkagate/extension/commit/52e43dd36d751b18fe29671e93e177c1698b53c9))

## [1.2.6](https://github.com/polkagate/extension/compare/v1.2.5...v1.2.6) (2025-08-28)


### Bug Fixes

* resolve hub names cahnge in subscan urls ([bb7c9ff](https://github.com/polkagate/extension/commit/bb7c9ffdbd5fe710c4436bab1a94acdaee95e817))

## [1.2.5](https://github.com/polkagate/extension/compare/v1.2.4...v1.2.5) (2025-08-27)


### Bug Fixes

* show highest value token logo ([2253cc8](https://github.com/polkagate/extension/commit/2253cc81e2970559e62f2da6939a43c97936125b))

## [1.2.4](https://github.com/polkagate/extension/compare/v1.2.3...v1.2.4) (2025-08-27)


### Bug Fixes

* display formatted address instead of substrate base on Send Fund page ([#1803](https://github.com/polkagate/extension/issues/1803)) ([870aec6](https://github.com/polkagate/extension/commit/870aec66726e71dc9f832df9f6439258d0d2d20d))

## [1.2.3](https://github.com/polkagate/extension/compare/v1.2.2...v1.2.3) (2025-08-26)


### Bug Fixes

* differ between fee and transferred asset ([fdf9f74](https://github.com/polkagate/extension/commit/fdf9f7480aaf9932a6552870dbd1c77d64aaf54c))

## [1.2.2](https://github.com/polkagate/extension/compare/v1.2.1...v1.2.2) (2025-08-26)


### Bug Fixes

* wrong available balance to stake issue ([#1800](https://github.com/polkagate/extension/issues/1800)) ([d0a5f66](https://github.com/polkagate/extension/commit/d0a5f66ec65cabeea7a4d6c2eabe98311688202c))

## [1.2.1](https://github.com/polkagate/extension/compare/v1.2.0...v1.2.1) (2025-08-26)


### Bug Fixes

* use the same foreign asset id if not multi location ([708db98](https://github.com/polkagate/extension/commit/708db98d724ec52bd85e461cec83b0f35ca8c695))

# [1.2.0](https://github.com/polkagate/extension/compare/v1.1.11...v1.2.0) (2025-08-26)


### Features

* add blueish color to welcome ([#1799](https://github.com/polkagate/extension/issues/1799)) ([8bae3b1](https://github.com/polkagate/extension/commit/8bae3b1118782263bb3c5906f4bb0c1d8c5ea8ce))

## [1.1.11](https://github.com/polkagate/extension/compare/v1.1.10...v1.1.11) (2025-08-25)


### Bug Fixes

* resolve auto endpoint issue in full-screen ([#1796](https://github.com/polkagate/extension/issues/1796)) ([9dd9cc6](https://github.com/polkagate/extension/commit/9dd9cc645c6d01fd78abc2226cf0a5135ac604ae))

## [1.1.10](https://github.com/polkagate/extension/compare/v1.1.9...v1.1.10) (2025-08-25)


### Bug Fixes

* hide export for external account ([518febd](https://github.com/polkagate/extension/commit/518febde3da8e88ae89813ab1eb8ae6b4e70d582))
* identicon size issue ([#1798](https://github.com/polkagate/extension/issues/1798)) ([7f3a494](https://github.com/polkagate/extension/commit/7f3a4942efbddb64a77bdfb56624babbda2db9bf))

## [1.1.9](https://github.com/polkagate/extension/compare/v1.1.8...v1.1.9) (2025-08-25)


### Bug Fixes

* resolve wrong token show up in asset bars ([559353a](https://github.com/polkagate/extension/commit/559353a4853a8b7f7fae8140648a2b1d1336756a))

## [1.1.8](https://github.com/polkagate/extension/compare/v1.1.7...v1.1.8) (2025-08-23)


### Bug Fixes

* correct translation related issues ([a9d9693](https://github.com/polkagate/extension/commit/a9d96939209d811a3c6a6fee8e68f866271a75b9))

## [1.1.7](https://github.com/polkagate/extension/compare/v1.1.6...v1.1.7) (2025-08-22)


### Bug Fixes

* show explore when account has no assets ([#1793](https://github.com/polkagate/extension/issues/1793)) ([f6dd9ee](https://github.com/polkagate/extension/commit/f6dd9ee2587922534709e867c25f43d051702f91))

## [1.1.6](https://github.com/polkagate/extension/compare/v1.1.5...v1.1.6) (2025-08-21)


### Bug Fixes

* update account page in full screen when switching selected account in extension ([48dabd3](https://github.com/polkagate/extension/commit/48dabd3783c20ad1083a8d6d7774c04330f4c125))

## [1.1.5](https://github.com/polkagate/extension/compare/v1.1.4...v1.1.5) (2025-08-21)


### Bug Fixes

* scrollbar only appears when scrolling ([#1795](https://github.com/polkagate/extension/issues/1795)) ([04520a7](https://github.com/polkagate/extension/commit/04520a7432e463a91779b48448fdd45c4a17ee55))

## [1.1.4](https://github.com/polkagate/extension/compare/v1.1.3...v1.1.4) (2025-08-21)


### Bug Fixes

* show fee logo as native token logo ([3a25a2b](https://github.com/polkagate/extension/commit/3a25a2b800c30eb381e7dc9199be48696b72c7da))

## [1.1.3](https://github.com/polkagate/extension/compare/v1.1.2...v1.1.3) (2025-08-21)


### Bug Fixes

* correct asset hub links in subscan urls ([f817bc9](https://github.com/polkagate/extension/commit/f817bc946102552bcd3261cbff461f6e03c07234))

## [1.1.2](https://github.com/polkagate/extension/compare/v1.1.1...v1.1.2) (2025-08-21)


### Bug Fixes

* re-add staking reward route ([37709bd](https://github.com/polkagate/extension/commit/37709bde8cdad2ad3d1fdab0d745e60db5a68dba))

## [1.1.1](https://github.com/polkagate/extension/compare/v1.1.0...v1.1.1) (2025-08-19)


### Bug Fixes

* correct account remove notify ([0253b8a](https://github.com/polkagate/extension/commit/0253b8a3f794e94b164b36ed80cda519ba2134b5))

# [1.1.0](https://github.com/polkagate/extension/compare/v1.0.3...v1.1.0) (2025-08-19)


### Features

* add fullscreen URL in staking popup pages ([#1785](https://github.com/polkagate/extension/issues/1785)) ([c68f4da](https://github.com/polkagate/extension/commit/c68f4da1ae82d99a9508fc990be98c11722f020d))

## [1.0.3](https://github.com/polkagate/extension/compare/v1.0.2...v1.0.3) (2025-08-18)


### Bug Fixes

* correct old style selected account setting ([bb0566d](https://github.com/polkagate/extension/commit/bb0566def9923b775042ecc713849864358e762d))

## [1.0.2](https://github.com/polkagate/extension/compare/v1.0.1...v1.0.2) (2025-08-18)


### Bug Fixes

* fix rewards inconsistency in solo ([#1784](https://github.com/polkagate/extension/issues/1784)) ([b4eacc2](https://github.com/polkagate/extension/commit/b4eacc21d8e7d98e653d19fd12f7fad079ccadcc))

## [1.0.1](https://github.com/polkagate/extension/compare/v1.0.0...v1.0.1) (2025-08-18)


### Bug Fixes

* set missing prop ([149092a](https://github.com/polkagate/extension/commit/149092ad4b21bfd6cd39b55f965571b29f4f516e))

# [1.0.0](https://github.com/polkagate/extension/compare/v0.36.4...v1.0.0) (2025-08-17)


* feat!: apply new design with huge performance improvements ([b2e775e](https://github.com/polkagate/extension/commit/b2e775eb5945afdf5b5499fce8d6ea12a474316c))


### Features

* apply new design  ([#1783](https://github.com/polkagate/extension/issues/1783)) ([e6304c3](https://github.com/polkagate/extension/commit/e6304c3e28ae38db1f544e643b4a9920b92677b0)), closes [#1690](https://github.com/polkagate/extension/issues/1690) [#1691](https://github.com/polkagate/extension/issues/1691)


### BREAKING CHANGES

* the old design is no longer supported, users need to migrate to the new one

## [0.36.4](https://github.com/polkagate/extension/compare/v0.36.3...v0.36.4) (2025-06-04)


### Bug Fixes

* fix ledger signing issue due to new weird on-chain metadata version ([#1754](https://github.com/polkagate/extension/issues/1754)) ([86abbc2](https://github.com/polkagate/extension/commit/86abbc26618fa50732aa51b5f3e83918671267f5)), closes [#1753](https://github.com/polkagate/extension/issues/1753)

## [0.36.3](https://github.com/polkagate/extension/compare/v0.36.2...v0.36.3) (2025-04-08)


### Bug Fixes

* update ledger dependencies ([#1732](https://github.com/polkagate/extension/issues/1732)) ([4a011fb](https://github.com/polkagate/extension/commit/4a011fb9bc65e01cb438f923b482acbaac62c60a))

## [0.36.2](https://github.com/polkagate/extension/compare/v0.36.1...v0.36.2) (2025-04-01)


### Bug Fixes

* available balance issue raised by api derive ([#1725](https://github.com/polkagate/extension/issues/1725)) ([9269b05](https://github.com/polkagate/extension/commit/9269b05f064b455467e3731cbc9b74a5024ffa98)), closes [#1723](https://github.com/polkagate/extension/issues/1723) [#1724](https://github.com/polkagate/extension/issues/1724)

## [0.36.1](https://github.com/polkagate/extension/compare/v0.36.0...v0.36.1) (2025-03-26)


### Bug Fixes

* handle 0 available balance returned by polkadot js api derive ([c851afd](https://github.com/polkagate/extension/commit/c851afdf52d3b1e6b2cae24546729e7220fddd60))
* use multiple endpoints in useApiWithChain to get fastest connection ([87df027](https://github.com/polkagate/extension/commit/87df02774a84a0361100854e5d7927ff17a716af)), closes [#1718](https://github.com/polkagate/extension/issues/1718)

# [0.36.0](https://github.com/polkagate/extension/compare/v0.35.2...v0.36.0) (2025-02-28)


### Features

* polkadot pool migration ([#1710](https://github.com/polkagate/extension/issues/1710)) ([1cbeb7f](https://github.com/polkagate/extension/commit/1cbeb7f034c4345a4ff2858e29da6918067dda4f))

## [0.35.2](https://github.com/polkagate/extension/compare/v0.35.1...v0.35.2) (2025-02-23)


### Bug Fixes

* balance name issues ([#1705](https://github.com/polkagate/extension/issues/1705)) ([b6a5a71](https://github.com/polkagate/extension/commit/b6a5a71a83ca0f2f3e4dfafc2a6e0118413deb02))

## [0.35.1](https://github.com/polkagate/extension/compare/v0.35.0...v0.35.1) (2025-02-22)


### Bug Fixes

* undefined asset id in send page ([#1704](https://github.com/polkagate/extension/issues/1704)) ([dca28a0](https://github.com/polkagate/extension/commit/dca28a046309a5cde5bf14c823208dc8d057d378)), closes [#1703](https://github.com/polkagate/extension/issues/1703)

# [0.35.0](https://github.com/polkagate/extension/compare/v0.34.0...v0.35.0) (2025-02-22)


### Features

* add support for pool migration ([#1702](https://github.com/polkagate/extension/issues/1702)) ([55c57b8](https://github.com/polkagate/extension/commit/55c57b81e8d97e9df3ff533d0479938c8542cff4))

# [0.34.0](https://github.com/polkagate/extension/compare/v0.33.3...v0.34.0) (2024-12-06)


### Features

* add real shared worker ([#1684](https://github.com/polkagate/extension/issues/1684)) ([b190fc1](https://github.com/polkagate/extension/commit/b190fc1780a92e517b1848d890aa0a7be8e26fc6))

## [0.33.3](https://github.com/polkagate/extension/compare/v0.33.2...v0.33.3) (2024-12-04)


### Bug Fixes

* back to onboarding page ([#1687](https://github.com/polkagate/extension/issues/1687)) ([b13be69](https://github.com/polkagate/extension/commit/b13be6932577ab904fe10a60c30a6a362727c7b5))

## [0.33.2](https://github.com/polkagate/extension/compare/v0.33.1...v0.33.2) (2024-12-02)


### Bug Fixes

* fee issue utilizing fee hook ([#1679](https://github.com/polkagate/extension/issues/1679)) ([b52a392](https://github.com/polkagate/extension/commit/b52a39206f07c753964777f144ba18b7fd09f780))

## [0.33.1](https://github.com/polkagate/extension/compare/v0.33.0...v0.33.1) (2024-11-30)


### Bug Fixes

* filter unaccessible endpoints ([#1678](https://github.com/polkagate/extension/issues/1678)) ([910108c](https://github.com/polkagate/extension/commit/910108c9523e527932a47de57b257cc3b54cd6f0))
* scroll issue ([75d3ead](https://github.com/polkagate/extension/commit/75d3eaddc49d411585cc8cf066694e9d0bab9357))

# [0.33.0](https://github.com/polkagate/extension/compare/v0.32.1...v0.33.0) (2024-11-25)


### Features

* get chain using the address ([#1671](https://github.com/polkagate/extension/issues/1671)) ([1fa7798](https://github.com/polkagate/extension/commit/1fa77981877308b758cb15a72b8a3524ce050f09))

## [0.32.1](https://github.com/polkagate/extension/compare/v0.32.0...v0.32.1) (2024-11-20)


### Bug Fixes

* dialog positioning issue ([5954fda](https://github.com/polkagate/extension/commit/5954fda8c216f2660b5fde02210ff7a10182601d))

# [0.32.0](https://github.com/polkagate/extension/compare/v0.31.2...v0.32.0) (2024-11-18)


### Features

* add spanish language ([b837bad](https://github.com/polkagate/extension/commit/b837badf9730791e2996b22782d092ec64512e97))

## [0.31.2](https://github.com/polkagate/extension/compare/v0.31.1...v0.31.2) (2024-11-18)


### Bug Fixes

* wrong currency code, style: fix transparency issue ([#1665](https://github.com/polkagate/extension/issues/1665)) ([4edaec6](https://github.com/polkagate/extension/commit/4edaec63560273dbc9724ead60d57ca5ce8522af))

## [0.31.1](https://github.com/polkagate/extension/compare/v0.31.0...v0.31.1) (2024-11-17)


### Bug Fixes

* checkmark position issue ([90f912e](https://github.com/polkagate/extension/commit/90f912e9564302425e7bb950ca18cec23c53c1e7))

# [0.31.0](https://github.com/polkagate/extension/compare/v0.30.2...v0.31.0) (2024-11-17)


### Features

* sort the already authorized accounts to the bottom of the list to easier auth the unauthorized accounts ([#1662](https://github.com/polkagate/extension/issues/1662)) ([8f0fc1d](https://github.com/polkagate/extension/commit/8f0fc1d809589b61f691ccc385ed7a436bf1538f))

## [0.30.2](https://github.com/polkagate/extension/compare/v0.30.1...v0.30.2) (2024-11-17)


### Bug Fixes

* scroll profiles issue and right arrow displaying ([#1661](https://github.com/polkagate/extension/issues/1661)) ([bcf06ab](https://github.com/polkagate/extension/commit/bcf06ab3344605a463e296ddd6d004447d466bbe))

## [0.30.1](https://github.com/polkagate/extension/compare/v0.30.0...v0.30.1) (2024-11-17)


### Bug Fixes

* incorporate era length which may be less than a day for some chains while calc a validators APY ([#1659](https://github.com/polkagate/extension/issues/1659)) ([b700e65](https://github.com/polkagate/extension/commit/b700e6531bf458681cf101db15a3e3bfd8d4a35d))

# [0.30.0](https://github.com/polkagate/extension/compare/v0.29.1...v0.30.0) (2024-11-16)


### Features

* new you have (Portfolio) for Extension mode ([#1655](https://github.com/polkagate/extension/issues/1655)) ([013f454](https://github.com/polkagate/extension/commit/013f4548db9a2f5181a5f5aa1cb07fe77034f5c8))

## [0.29.1](https://github.com/polkagate/extension/compare/v0.29.0...v0.29.1) (2024-11-14)


### Bug Fixes

* adjust width in HEADER_COMPONENT_STYLE ([07d2d09](https://github.com/polkagate/extension/commit/07d2d0945159a617ddfd9d2252669f91fd01ec42))

# [0.29.0](https://github.com/polkagate/extension/compare/v0.28.0...v0.29.0) (2024-11-12)


### Features

* support governance tx history ([#1630](https://github.com/polkagate/extension/issues/1630)) ([4044d3b](https://github.com/polkagate/extension/commit/4044d3b83a268ce2af7da4f42323cc866d477e19))

# [0.28.0](https://github.com/polkagate/extension/compare/v0.27.0...v0.28.0) (2024-11-11)


### Features

* display portfolio change in account detail ([#1644](https://github.com/polkagate/extension/issues/1644)) ([e30ef9c](https://github.com/polkagate/extension/commit/e30ef9c7fadaec43e7e6087ac0c58be8b23a5cdb))

# [0.27.0](https://github.com/polkagate/extension/compare/v0.26.1...v0.27.0) (2024-11-11)


### Features

* add count up ([#1642](https://github.com/polkagate/extension/issues/1642)) ([b155aaf](https://github.com/polkagate/extension/commit/b155aaf303fdd2416c9030215bcb9b9a8a3437a7))

## [0.26.1](https://github.com/polkagate/extension/compare/v0.26.0...v0.26.1) (2024-11-11)


### Bug Fixes

* transient label of selected profile name ([#1640](https://github.com/polkagate/extension/issues/1640)) ([75386b9](https://github.com/polkagate/extension/commit/75386b9e6cd2e2d9f2309928a391bd80f0a40bfd))

# [0.26.0](https://github.com/polkagate/extension/compare/v0.25.0...v0.26.0) (2024-11-11)


### Features

* add portfolio price change ([#1641](https://github.com/polkagate/extension/issues/1641)) ([8e4eacb](https://github.com/polkagate/extension/commit/8e4eacb1bedd7eeb580bd2424471cdadf4662801))

# [0.25.0](https://github.com/polkagate/extension/compare/v0.24.0...v0.25.0) (2024-11-10)


### Features

* add filter to NFT page ([#1639](https://github.com/polkagate/extension/issues/1639)) ([c8c835e](https://github.com/polkagate/extension/commit/c8c835e9f64c18bb722deaf6daaaddeecb22e6c6))

# [0.24.0](https://github.com/polkagate/extension/compare/v0.23.1...v0.24.0) (2024-11-10)


### Features

* show validators APY ([#1633](https://github.com/polkagate/extension/issues/1633)) ([cdc4b37](https://github.com/polkagate/extension/commit/cdc4b37569ba0a55927158b4e445cae7a5b58fb7))

## [0.23.1](https://github.com/polkagate/extension/compare/v0.23.0...v0.23.1) (2024-11-09)


### Bug Fixes

* disable manage validators if the account is already a validator ([#1634](https://github.com/polkagate/extension/issues/1634)) ([89d56c4](https://github.com/polkagate/extension/commit/89d56c48eedc8fe3fdff98ca8ff7e69edf88a65d))

# [0.23.0](https://github.com/polkagate/extension/compare/v0.22.0...v0.23.0) (2024-11-09)


### Features

* support NFTs and Uniques ([#1564](https://github.com/polkagate/extension/issues/1564)) ([7c38aac](https://github.com/polkagate/extension/commit/7c38aacad0b8b5f800287d28f49b67974009d746))

# [0.22.0](https://github.com/polkagate/extension/compare/v0.21.6...v0.22.0) (2024-11-06)


### Features

* use Slider for Conviction settings ([#1629](https://github.com/polkagate/extension/issues/1629)) ([790d7a1](https://github.com/polkagate/extension/commit/790d7a1f739774778c6c1a6755f0db65c990723c))

## [0.21.6](https://github.com/polkagate/extension/compare/v0.21.5...v0.21.6) (2024-11-03)


### Bug Fixes

* displaying locked amount button ([#1626](https://github.com/polkagate/extension/issues/1626)) ([dbc15f0](https://github.com/polkagate/extension/commit/dbc15f042d45b8a2da8d243b7940d613bfc17eea))

## [0.21.5](https://github.com/polkagate/extension/compare/v0.21.4...v0.21.5) (2024-11-03)


### Bug Fixes

* underway votes type ([#1625](https://github.com/polkagate/extension/issues/1625)) ([42be4e2](https://github.com/polkagate/extension/commit/42be4e2f0396e92623ce8d3b8927c066f9d1172e))

## [0.21.4](https://github.com/polkagate/extension/compare/v0.21.3...v0.21.4) (2024-11-03)


### Bug Fixes

* resolve issue with closing button on the Referanda unlock modal ([#1547](https://github.com/polkagate/extension/issues/1547)) ([ac1a4df](https://github.com/polkagate/extension/commit/ac1a4df5349ad775bca53405ca12d2b474d8dd16))

## [0.21.3](https://github.com/polkagate/extension/compare/v0.21.2...v0.21.3) (2024-11-02)


### Bug Fixes

* wrong vote type issue in comments ([#1624](https://github.com/polkagate/extension/issues/1624)) ([f398d16](https://github.com/polkagate/extension/commit/f398d16227205ffda4b3281f57fd065815fd3f90))

## [0.21.2](https://github.com/polkagate/extension/compare/v0.21.1...v0.21.2) (2024-10-31)


### Bug Fixes

* wrong timeline stage in Governance ([#1619](https://github.com/polkagate/extension/issues/1619)) ([73fcabf](https://github.com/polkagate/extension/commit/73fcabf87ade60a8acb0f7e6ba365b54aab3f859))

## [0.21.1](https://github.com/polkagate/extension/compare/v0.21.0...v0.21.1) (2024-10-29)


### Bug Fixes

* theme change sync issue ([#1616](https://github.com/polkagate/extension/issues/1616)) ([69bccb0](https://github.com/polkagate/extension/commit/69bccb0445ce3c73cc6e39a21921eca06285c05f))

# [0.21.0](https://github.com/polkagate/extension/compare/v0.20.1...v0.21.0) (2024-10-29)


### Features

* add account icon theme options ([#1612](https://github.com/polkagate/extension/issues/1612)) ([e1b3570](https://github.com/polkagate/extension/commit/e1b3570104f11e45eb24cfdadefb1df6f3cb0436))

## [0.20.1](https://github.com/polkagate/extension/compare/v0.20.0...v0.20.1) (2024-10-27)


### Bug Fixes

* staking balances get undefined in useBalances ([#1609](https://github.com/polkagate/extension/issues/1609)) ([2d97e9a](https://github.com/polkagate/extension/commit/2d97e9a755c262a366dddf685d0fd19d2478b7e6))

# [0.20.0](https://github.com/polkagate/extension/compare/v0.19.6...v0.20.0) (2024-10-24)


### Features

* auto loading referenda list ([#1599](https://github.com/polkagate/extension/issues/1599)) ([c987138](https://github.com/polkagate/extension/commit/c987138d3b2fe4f9d7525b8a821b24a1dc51388e))

## [0.19.6](https://github.com/polkagate/extension/compare/v0.19.5...v0.19.6) (2024-10-23)


### Bug Fixes

* history intersection loader issue ([#1598](https://github.com/polkagate/extension/issues/1598)) ([8744720](https://github.com/polkagate/extension/commit/87447206493735381da5a6152373eafbfe3c1797))

## [0.19.5](https://github.com/polkagate/extension/compare/v0.19.4...v0.19.5) (2024-10-23)


### Bug Fixes

* search ref problem ([#1602](https://github.com/polkagate/extension/issues/1602)) ([a43adba](https://github.com/polkagate/extension/commit/a43adba1df696a6aefccca11ae960c18b794d456))

## [0.19.4](https://github.com/polkagate/extension/compare/v0.19.3...v0.19.4) (2024-10-23)


### Bug Fixes

* asset requested issue while currency is something other than USD ([#1594](https://github.com/polkagate/extension/issues/1594)) ([9083e0b](https://github.com/polkagate/extension/commit/9083e0bb3e6376ea85004bf8b78b18a88329fffd))

## [0.19.3](https://github.com/polkagate/extension/compare/v0.19.2...v0.19.3) (2024-10-23)


### Bug Fixes

* apply search after loading referenda [#1220](https://github.com/polkagate/extension/issues/1220) ([#1597](https://github.com/polkagate/extension/issues/1597)) ([ab372b9](https://github.com/polkagate/extension/commit/ab372b9f785a7316a2a30164b23573bcf4e7fc92))

## [0.19.2](https://github.com/polkagate/extension/compare/v0.19.1...v0.19.2) (2024-10-22)


### Bug Fixes

* fix displaying reaction issue ([#1596](https://github.com/polkagate/extension/issues/1596)) ([1a0e8a9](https://github.com/polkagate/extension/commit/1a0e8a9e50999972426b3b9dcf3fef293234f1d9))

## [0.19.1](https://github.com/polkagate/extension/compare/v0.19.0...v0.19.1) (2024-10-21)


### Bug Fixes

* referenda tracks Max ([#1591](https://github.com/polkagate/extension/issues/1591)) ([268a5eb](https://github.com/polkagate/extension/commit/268a5eb2578f677f2ce3233fc3cdd66defd76691))

# [0.19.0](https://github.com/polkagate/extension/compare/v0.18.4...v0.19.0) (2024-10-16)


### Features

* add no internet alert ([#1589](https://github.com/polkagate/extension/issues/1589)) ([6b02c7e](https://github.com/polkagate/extension/commit/6b02c7e025f85c7f7d0e1a399d1d2dcf990363f0))

## [0.18.4](https://github.com/polkagate/extension/compare/v0.18.3...v0.18.4) (2024-10-15)


### Bug Fixes

* adjust button position in vote confirmation ([7d35cc2](https://github.com/polkagate/extension/commit/7d35cc222692327557c90ed00ad6bc23af57eb28))

## [0.18.3](https://github.com/polkagate/extension/compare/v0.18.2...v0.18.3) (2024-10-13)


### Bug Fixes

* add label to cast vote checking progress ([#1587](https://github.com/polkagate/extension/issues/1587)) ([c746ea6](https://github.com/polkagate/extension/commit/c746ea61d46aa44ee5b9e7a647ac3b30ac76a557))

## [0.18.2](https://github.com/polkagate/extension/compare/v0.18.1...v0.18.2) (2024-10-08)


### Bug Fixes

* tab switch issue while language is other than EN ([facec10](https://github.com/polkagate/extension/commit/facec1023d987d10e9e0ff49a303d975a4dace60))

## [0.18.1](https://github.com/polkagate/extension/compare/v0.18.0...v0.18.1) (2024-10-07)


### Bug Fixes

* save update balances ([#1583](https://github.com/polkagate/extension/issues/1583)) ([eccc18e](https://github.com/polkagate/extension/commit/eccc18e1aa0121f5d04e17051dbdc7be3099ade9))

# [0.18.0](https://github.com/polkagate/extension/compare/v0.17.0...v0.18.0) (2024-10-06)


### Features

* add foreign assets support on asset hubs, such as MYTH on PAH ([#1577](https://github.com/polkagate/extension/issues/1577)) ([a77459a](https://github.com/polkagate/extension/commit/a77459acd5f70c093fc8e994bae3851d82fc6905))

# [0.17.0](https://github.com/polkagate/extension/compare/v0.16.0...v0.17.0) (2024-10-06)


### Features

* add Polkadot as currency ([#1581](https://github.com/polkagate/extension/issues/1581)) ([6435c62](https://github.com/polkagate/extension/commit/6435c62dba89f840df3c68faa139aa384b5d1689)), closes [#1578](https://github.com/polkagate/extension/issues/1578)

# [0.16.0](https://github.com/polkagate/extension/compare/v0.15.0...v0.16.0) (2024-10-01)


### Features

* add selected chains badge ([#1574](https://github.com/polkagate/extension/issues/1574)) ([db189c6](https://github.com/polkagate/extension/commit/db189c6227e239ec7671aeb605cdf2608304aca5))

# [0.15.0](https://github.com/polkagate/extension/compare/v0.14.1...v0.15.0) (2024-10-01)


### Bug Fixes

* user added chains price id ([#1571](https://github.com/polkagate/extension/issues/1571)) ([0db1976](https://github.com/polkagate/extension/commit/0db1976a5e17da8498219e77eccdcfdbf6d97a39))


### Features

* add profile tab tooltip in FS ([#1567](https://github.com/polkagate/extension/issues/1567)) ([929b519](https://github.com/polkagate/extension/commit/929b519fe469f1b843b1b2b132a0a4e79d4f6316)), closes [#1572](https://github.com/polkagate/extension/issues/1572)

## [0.14.1](https://github.com/polkagate/extension/compare/v0.14.0...v0.14.1) (2024-10-01)


### Bug Fixes

* missing stashId in review page ([#1568](https://github.com/polkagate/extension/issues/1568)) ([8a18c8b](https://github.com/polkagate/extension/commit/8a18c8b8bf492ee603441f63a23ea134b754335d)), closes [#1570](https://github.com/polkagate/extension/issues/1570)

# [0.14.0](https://github.com/polkagate/extension/compare/v0.13.1...v0.14.0) (2024-09-29)


### Features

* add BTC and ETH as currency ([#1563](https://github.com/polkagate/extension/issues/1563)) ([8b57127](https://github.com/polkagate/extension/commit/8b5712749f39ca3c1bee426bcc23b3e6ffbd368e)), closes [#1552](https://github.com/polkagate/extension/issues/1552)

## [0.13.1](https://github.com/polkagate/extension/compare/v0.13.0...v0.13.1) (2024-09-28)


### Bug Fixes

* update referendum comments ([#1548](https://github.com/polkagate/extension/issues/1548)) ([da77ba5](https://github.com/polkagate/extension/commit/da77ba5a8c43abd282acfda344e6e497e93602d9))

# [0.13.0](https://github.com/polkagate/extension/compare/v0.12.3...v0.13.0) (2024-09-28)


### Features

* add a new chain ([#1553](https://github.com/polkagate/extension/issues/1553)) ([4613722](https://github.com/polkagate/extension/commit/4613722222efe3fa7870313fbaa49a9f4d64192a))

## [0.12.3](https://github.com/polkagate/extension/compare/v0.12.2...v0.12.3) (2024-09-23)


### Bug Fixes

* fix useApi interaction with useApiWithChain2 ([#1556](https://github.com/polkagate/extension/issues/1556)) ([23f4b36](https://github.com/polkagate/extension/commit/23f4b36a51442082bb353005688c7c2c148dac72))

## [0.12.2](https://github.com/polkagate/extension/compare/v0.12.1...v0.12.2) (2024-09-22)


### Bug Fixes

* identicon type issue after auto metadsata update ([54889d9](https://github.com/polkagate/extension/commit/54889d928650b6ea67349d60f554309d512e3f59))

## [0.12.1](https://github.com/polkagate/extension/compare/v0.12.0...v0.12.1) (2024-09-21)


### Bug Fixes

* reset remote node indicator signal bars on chain switch ([35e7899](https://github.com/polkagate/extension/commit/35e78999896c2b3c4ed93299577b177f2d8513e3))

# [0.12.0](https://github.com/polkagate/extension/compare/v0.11.0...v0.12.0) (2024-09-21)


### Features

* auto mode endpoint selection mode ([#1467](https://github.com/polkagate/extension/issues/1467)) ([bf248db](https://github.com/polkagate/extension/commit/bf248db364ca402b81681b0610a72877e3ebb198))

# [0.11.0](https://github.com/polkagate/extension/compare/v0.10.2...v0.11.0) (2024-09-21)


### Features

* Auto update metadata while fetching accounts balances ([#1517](https://github.com/polkagate/extension/issues/1517)) ([17367eb](https://github.com/polkagate/extension/commit/17367eb1ad01198d7d02a994bce1d5d7e3f48a9c))

## [0.10.2](https://github.com/polkagate/extension/compare/v0.10.1...v0.10.2) (2024-09-15)


### Bug Fixes

* show skeleton instead of any chain alert before fetching the chain ([fed12cc](https://github.com/polkagate/extension/commit/fed12cce6aefb0d259c8766d95a7cee4984aacee))

## [0.10.1](https://github.com/polkagate/extension/compare/v0.10.0...v0.10.1) (2024-09-15)


### Bug Fixes

* changelog issue ([1baff81](https://github.com/polkagate/extension/commit/1baff8173d5ba9cb8faa7fb3d4fa72fd7af0407c))
