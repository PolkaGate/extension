// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';
import type { Proxy } from '../util/types';

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import type { Chain } from '@polkadot/extension-chains/types';


import { useTranslation } from '../hooks';
import { windowOpen } from '../messaging';
import { PROXY_CHAINS } from '../util/constants';
import { getSubstrateAddress } from '../util/utils';
import { ActionContext } from './contexts';
import Identicon from './Identicon';
import { Infotip } from '.';

interface Props {
  chain: Chain | null | undefined;
  formatted: string | undefined;
  identiconTheme: IconTheme;
  isSubId: boolean;
  judgements?: RegExpMatchArray | null | undefined;
  prefix?: number;
  proxies: Proxy[] | undefined;
  recoverable?: boolean;
}

export default function AccountIcons({ chain, formatted, identiconTheme, isSubId, judgements, prefix, proxies, recoverable = false }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const address = getSubstrateAddress(formatted);

  const openManageProxy = useCallback(() => {
    address && chain && PROXY_CHAINS.includes(chain.genesisHash ?? '') && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const openSocialRecovery = useCallback(() => {
    address && windowOpen(`/socialRecovery/${address}/false`);
  }, [address]);

  return (
    <Grid container direction='column' sx={{ width: '17%', ml: '8px' }}>
      <Grid item m='auto' width='fit-content'>
        <Identicon
          iconTheme={identiconTheme}
          isSubId={isSubId}
          judgement={judgements}
          prefix={prefix}
          size={40}
          value={formatted}
        />
      </Grid>
      <Grid container direction='row' item justifyContent='center'>
        <Grid item>
          <Infotip placement='bottom-start' text={t('Is recoverable')}>
            <IconButton
              onClick={openSocialRecovery}
              sx={{ height: '15px', width: '15px' }}>
              <FontAwesomeIcon
                color={recoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faShieldHalved}
              />
            </IconButton>
          </Infotip>
        </Grid>
        <Grid item>
          <Infotip placement='bottom-end' text={t('Has proxy')}>
            <IconButton onClick={openManageProxy} sx={{ height: '15px', width: '15px' }}>
              <FontAwesomeIcon
                color={proxies?.length ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faSitemap}
              />
            </IconButton>
          </Infotip>
        </Grid>
      </Grid>
    </Grid>
  );
}
