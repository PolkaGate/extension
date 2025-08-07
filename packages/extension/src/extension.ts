// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-inject/crossenv';

import * as Sentry from '@sentry/react';

import { getStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';
import { createView, Popup } from '@polkadot/extension-ui';

(async () => {
  try {
    const disableDiagnostics = await getStorage(STORAGE_KEY.DISABLE_DIAGNOSTIC_REPORTS);

    if (!disableDiagnostics) {
      const isProd = process.env['NODE_ENV'] === 'production';

      Sentry.init({
        dsn: process.env['SENTRY_DSN'],
        integrations: [
          Sentry.browserTracingIntegration(),
          Sentry.replayIntegration()
        ],
        release: process.env['EXTENSION_VERSION'],
        replaysOnErrorSampleRate: 1.0,
        replaysSessionSampleRate: isProd ? 0.1 : 0.2,
        tracePropagationTargets: [
          /^chrome-extension:\/\/mgojgfjhknpmlojihdpjikinpgcaadlj/,
          /^chrome-extension:\/\/ginchbkmljhldofnbjabmeophlhdldgp/
        ],
        tracesSampleRate: isProd ? 0.2 : 1.0
      });
    } else {
      console.log('Diagnostic reporting is disabled by user preference.');
    }
  } catch (e) {
    console.error('Failed to initialize Sentry:', e);
  }

  // Start the extension UI
  createView(Popup);
})().catch(console.error);
