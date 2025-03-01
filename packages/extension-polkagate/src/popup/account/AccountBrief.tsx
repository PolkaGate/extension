// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */
/* eslint-disable react/jsx-max-props-per-line */

/**
 * @description
 * this component show a brief of an account on home pages like staking/crowdloans homepages
 * */

import type { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { QrCode2 } from '@mui/icons-material';
import { Box, Divider, Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import { subscan } from '../../assets/icons/';
import { Infotip, OptionalCopyButton, ShortAddress2 } from '../../components';
import { useInfo, useTranslation } from '../../hooks';

interface Props {
  address: string;
  identity: DeriveAccountRegistration | null | undefined
  showName?: boolean;
  showDivider?: boolean;
}

function AccountBrief({ address, identity, showDivider = true, showName = true }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { account, chainName, formatted } = useInfo(address);
  const history = useHistory();
  const { pathname } = useLocation();

  const goToReceive = useCallback(() => {
    history.push({
      pathname: `/receive/${address}/`,
      state: { pathname }
    });
  }, [history, address, pathname]);

  const subscanLink = useCallback((address?: string) => {
    if (chainName === 'WestendAssetHub') {
      return `https://westmint.statescan.io/#/accounts/${String(address)}`;
    }

    if (chainName?.includes('AssetHub')) {
      return `https://assethub-${chainName.replace(/AssetHub/, '')}.subscan.io/account/${String(address)}`;
    }

    return `https://${chainName}.subscan.io/account/${String(address)}`;
  }, [chainName]);

  return (
    < >
      {showName &&
        <Grid alignItems='center' container justifyContent='center' xs={12}>
          <Typography sx={{ fontSize: '24px', fontWeight: 400, lineHeight: '38px', maxWidth: '92%', mt: '5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {identity?.display || account?.name}
          </Typography>
        </Grid>
      }
      <Grid alignItems='center' container item justifyContent='space-between' pl='5px' pr='10px'>
        <Grid container item sx={{ width: '84%' }}>
          <Grid container item xs>
            <ShortAddress2 address={formatted} charsCount={19} style={{ fontSize: '10px', fontWeight: 300 }} />
          </Grid>
          <Grid container item width='fit-content'>
            <OptionalCopyButton address={address} />
          </Grid>
        </Grid>
        <Grid alignItems='center' container item justifyContent='space-around' width='16%'>
          <Infotip placement='top' text={t('Receive')}>
            <QrCode2 onClick={goToReceive} sx={{ color: 'secondary.light', cursor: 'pointer', mr: '4px', mt: '9px' }} />
          </Infotip>
          <Infotip placement='top' text={t('Subscan')}>
            <Link
              href={`${subscanLink(formatted)}`}
              rel='noreferrer'
              target='_blank'
              underline='none'
            >
              <Box alt={'subscan'} component='img' height='20px' mt='9px' src={subscan as string} sx={{ filter: theme.palette.mode === 'dark' ? 'grayscale(50)' : 'none' }} width='20px' />
            </Link>
          </Infotip>
        </Grid>
      </Grid>
      {showDivider &&
        <Divider sx={{ bgcolor: 'secondary.light', height: '2px', mt: '0px' }} />
      }
    </>
  );
}

export default React.memo(AccountBrief);
