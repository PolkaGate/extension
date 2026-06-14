// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

export default function useIsSidePanel(): boolean {
  return window.location.pathname.endsWith('/sidepanel.html');
}
