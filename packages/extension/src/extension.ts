// Copyright 2019-2024 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-inject/crossenv';

import * as Sentry from '@sentry/react';

import { createView, Popup } from '@polkadot/extension-ui';

// Initialize Sentry
Sentry.init({
  dsn: 'https://e180ce4eb81555f550041641eff9c75a@o4508399609184256.ingest.us.sentry.io/4508399617114112',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration()
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
  tracePropagationTargets: [
    /^chrome-extension:\/\/mgojgfjhknpmlojihdpjikinpgcaadlj/, // Dev extension ID
    /^chrome-extension:\/\/ginchbkmljhldofnbjabmeophlhdldgp/ // Production extension ID
  ],
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0 // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});
// Start the extension UI
createView(Popup);
