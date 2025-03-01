// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-first-prop-new-line */
/* eslint-disable react/jsx-max-props-per-line */

import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { noop } from '@polkadot/util';

import { Identity, Infotip, OptionalCopyButton, ShortAddress2, VaadinIcon } from '../../../components';
import { useIdentity, useInfo, useTranslation } from '../../../hooks';
import { showAccount } from '../../../messaging';

export const EyeIconFullScreen = ({ isHidden, onClick }: { isHidden: boolean | undefined, onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Infotip text={isHidden ? t('This account is hidden from websites') : t('This account is visible to websites')}>
      <IconButton onClick={onClick} sx={{ height: '20px', ml: '7px', mt: '13px', p: 0, width: '28px' }}>
        <VaadinIcon icon={isHidden ? 'vaadin:eye-slash' : 'vaadin:eye'} style={{ color: `${theme.palette.secondary.light}`, height: '15px' }} />
      </IconButton>
    </Infotip>
  );
};

interface Props {
  address: string | undefined;
  goToDetails?: () => void;
  gridSize?: number;
}

function AccountBodyFs({ address, goToDetails = noop, gridSize }: Props): React.ReactElement {
  const { account, api, chain, formatted, genesisHash } = useInfo(address);

  const accountInfo = useIdentity(genesisHash, formatted);

  const toggleVisibility = useCallback((): void => {
    address && showAccount(address, account?.isHidden || false).catch(console.error);
  }, [account?.isHidden, address]);

  return (
    <Grid container direction='column' item sx={{ borderRight: '1px solid', borderRightColor: 'divider', px: '7px' }} xs={gridSize}>
      <Grid container item justifyContent='space-between'>
        <Identity
          accountInfo={accountInfo}
          address={address}
          api={api}
          chain={chain}
          noIdenticon
          onClick={goToDetails}
          style={{ fontSize: '22px', width: 'calc(100% - 40px)' }}
          subIdOnly
        />
        <Grid item width='40px'>
          <EyeIconFullScreen
            isHidden={account?.isHidden}
            onClick={toggleVisibility}
          />
        </Grid>
      </Grid>
      <Grid alignItems='center' container item>
        <Grid container item sx={{ '> div div:last-child': { width: 'auto' } }} xs>
          <ShortAddress2 address={formatted || address} charsCount={40} style={{ fontSize: '10px', fontWeight: 300 }} />
        </Grid>
        <Grid container item width='fit-content'>
          <OptionalCopyButton
            address={address}
            iconWidth={15}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountBodyFs);
