// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { WithTranslation } from 'react-i18next';

import { Grid, Typography } from '@mui/material';
import React from 'react';

import { PButton } from '@polkadot/extension-polkagate/src/components';
import translate from '@polkadot/extension-polkagate/src/components/translate';
import AlertBox from '@polkadot/extension-polkagate/src/partials/AlertBox';
import HeaderBrand from '@polkadot/extension-polkagate/src/partials/HeaderBrand';
import { EXTENSION_NAME } from '@polkadot/extension-polkagate/src/util/constants';

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
        <>
          <HeaderBrand
            showBrand
            showMenu
            text={EXTENSION_NAME}
          />
          <Grid container justifyContent='center' px='15px'>
            <Typography fontSize='18px' mt='35px'>
              {t<string>('An error occurred')}
            </Typography>
            <Typography fontSize='16px' mt='35px'>
              {t<string>('Something went wrong with the query and rendering of this component')}:
            </Typography>
            <Typography color='error' fontSize='15px' mt='15px'>
              {error.message}
            </Typography>
          </Grid>
          <PButton
            _onClick={this.#goHome}
            text={t<string>('Back to home')}
          />
        </>
      )
      : <>
        {children}
        {!this.isExtensionPopup && <AlertBox />}
      </>;
  }
}

export default translate(ErrorBoundary);
