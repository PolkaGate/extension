// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { WithTranslation } from 'react-i18next';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { GradientButton } from '@polkadot/extension-polkagate/src/components';
import translate from '@polkadot/extension-polkagate/src/components/translate';
import AlertBox from '@polkadot/extension-polkagate/src/partials/AlertBox';

interface Props extends WithTranslation {
  children: React.ReactNode;
  className?: string;
  error?: Error | null;
  trigger?: string;
}

interface State {
  error: Error | null;
}

// NOTE: This is the only way to do an error boundary, via extend
class ErrorBoundary extends React.Component<Props> {
  private isExtensionPopup: boolean;

  constructor(props: Props) {
    super(props);

    // Initialize extension detection in constructor
    this.isExtensionPopup = false;

    if (chrome?.extension?.getViews) {
      const extensionViews = chrome.extension.getViews({ type: 'popup' });
      const isPopupOpenedByExtension = extensionViews.includes(window);

      if (isPopupOpenedByExtension) {
        this.isExtensionPopup = true;
      }
    } else {
      this.isExtensionPopup = window.innerWidth <= 357 && window.innerHeight <= 621;
    }
  }

  public override state: State = { error: null };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  public override componentDidUpdate(prevProps: Props) {
    const { error } = this.state;
    const { trigger } = this.props;

    if (error !== null && (prevProps.trigger !== trigger)) {
      this.setState({ error: null });
    }
  }

  #goHome = () => {
    this.setState({ error: null });
    window.location.hash = '/';
  };

  public override render(): React.ReactNode {
    const { children, t } = this.props;
    const { error } = this.state;

    return error
      ? (
        <Grid alignItems='center' container flexDirection='column' item justifyContent='center' sx={{ height: '100vh', position: 'relative', px: '20px' }}>
          <Typography mt='35px' sx={{ fontFamily: 'OdibeeSans', fontSize: '40px', fontWeight: 400, textAlign: 'center' }}>
            {t('An error occurred')}
          </Typography>
          <Typography mt='35px' sx={{ fontFamily: 'Inter', fontSize: '14px', fontWeight: 600, textAlign: 'left' }}>
            {t('We couldn’t load this section due to an unexpected error.')}
          </Typography>
          <Typography color='error' mt='40px' sx={{ fontFamily: 'Inter', fontSize: '13px', fontWeight: 500 }}>
            {error.message}
          </Typography>
          <GradientButton
            contentPlacement='center'
            onClick={this.#goHome}
            style={{
              bottom: '20px',
              height: '44px',
              position: 'absolute',
              width: '92%'
            }}
            text={t('Back to home')}
          />
        </Grid>
      )
      : (
        <>
          {children}
          {
            !this.isExtensionPopup &&
            <AlertBox />
          }
        </>
      );
  }
}

export default translate(ErrorBoundary);
