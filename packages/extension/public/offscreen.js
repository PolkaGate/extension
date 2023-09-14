// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-misused-promises
setInterval(async () => {
  (await navigator.serviceWorker.ready).active.postMessage('keepAlive');
}, 20e3);
