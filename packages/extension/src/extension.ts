// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-inject/crossenv';

import * as Sentry from '@sentry/react';

import { getStorage } from '@polkadot/extension-polkagate/src/util';
import { NAMES_IN_STORAGE } from '@polkadot/extension-polkagate/src/util/constants';
import { createView, Popup } from '@polkadot/extension-ui';

(async () => {
  try {
    const isDisabled = await getStorage(NAMES_IN_STORAGE.DISABLE_DIAGNOSTIC_REPORTS);

    if (!isDisabled) {
      const isProd = process.env['NODE_ENV'] === 'production';

      Sentry.init({
        dsn: process.env['SENTRY_DSN'],
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration()
        ],
        release: process.env['EXTENSION_VERSION'],
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: isProd ? 0.1 : 1,
        tracePropagationTargets: [
          /^chrome-extension:\/\/mgojgfjhknpmlojihdpjikinpgcaadlj/,
          /^chrome-extension:\/\/ginchbkmljhldofnbjabmeophlhdldgp/
        ],
        tracesSampleRate: isProd ? 0.2 : 1.0
      });
    } else {
      console.log('Sentry is disabled');
    }
  } catch (e) {
    console.error('Failed to initialize Sentry:', e);
  }

  // Start the extension UI
  createView(Popup);
})().catch(console.error);
