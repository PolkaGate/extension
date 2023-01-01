// Copyright 2019-2023 @polkadot/extension-ui authors & contributor
// SPDX-License-Identifier: Apache-2.0

import { Grid, Typography } from '@mui/material';
import React from 'react';
import { WithTranslation } from 'react-i18next';

import HeaderBrand from '../partials/HeaderBrand';
import translate from './translate';
import { PButton } from '.';

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
            text={t<string>('Polkagate')}
          />
          <Grid container justifyContent='center' px='15px'>
            <Typography fontSize='18px' mt='35px'>
              {t<string>('An error occurred')}
            </Typography>
            <Typography fontSize='16px' mt='35px'>
              {t<string>('Something went wrong with the query and rendering of this component')}:
            </Typography>
            <Typography fontSize='15px' mt='15px' color='error'>
              {error.message}
            </Typography>
          </Grid>
          <PButton
            _onClick={this.#goHome}
            text={t<string>('Back to home')}
          />
          {/* </ButtonArea> */}
        </>
      )
      : children;
  }
}

export default translate(ErrorBoundary);
