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

      if (isProd) {
        const SAMPLING_RATE = 0.1;

        Sentry.init({
          dsn: process.env['SENTRY_DSN'],
          integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration()
          ],
          release: process.env['EXTENSION_VERSION'],
          replaysOnErrorSampleRate: SAMPLING_RATE,
          replaysSessionSampleRate: SAMPLING_RATE,
          tracePropagationTargets: [
            /^chrome-extension:\/\/mgojgfjhknpmlojihdpjikinpgcaadlj/,
            /^chrome-extension:\/\/ginchbkmljhldofnbjabmeophlhdldgp/
          ],
          tracesSampleRate: SAMPLING_RATE
        });
      } else {
        console.log('Sentry disabled in development.');
      }
    } else {
      console.log('Diagnostic reporting is disabled by user preference.');
    }
  } catch (e) {
    console.error('Failed to initialize Sentry:', e);
  }
})().catch(console.error);

// Start the extension UI
createView(Popup);
