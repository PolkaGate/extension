// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { IconTheme } from '@polkadot/react-identicon/types';

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext } from 'react';

import { useAnimateOnce, useHasProxyTooltipText, useInfo, useIsRecoverableTooltipText } from '../hooks';
import { windowOpen } from '../messaging';
import { PROXY_CHAINS } from '../util/constants';
import { ActionContext } from './contexts';
import Identicon from './Identicon';
import { Infotip } from '.';

interface Props {
  address: string | undefined;
  identiconTheme: IconTheme;
  isSubId: boolean;
  judgements?: RegExpMatchArray | null | undefined;
  prefix?: number;
}

function AccountIcons({ address, identiconTheme, isSubId, judgements, prefix }: Props): React.ReactElement<Props> {
  const theme = useTheme();
  const onAction = useContext(ActionContext);

  const { chain, formatted } = useInfo(address);

  const { hasProxy, proxyTooltipTxt } = useHasProxyTooltipText(address);
  const { isRecoverable, recoverableToolTipTxt } = useIsRecoverableTooltipText(address);

  const shakeProxy = useAnimateOnce(hasProxy);
  const shakeShield = useAnimateOnce(isRecoverable);

  const openManageProxy = useCallback(() => {
    address && chain && PROXY_CHAINS.includes(chain.genesisHash ?? '') && onAction(`/manageProxies/${address}`);
  }, [address, chain, onAction]);

  const openSocialRecovery = useCallback(() => {
    address && windowOpen(`/socialRecovery/${address}/false`).catch(console.error);
  }, [address]);

  return (
    <Grid container direction='column' sx={{ m: '7px 0px 0px 8px', width: '17%' }}>
      <Grid item m='auto' width='fit-content'>
        <Identicon
          iconTheme={identiconTheme}
          isSubId={isSubId}
          judgement={judgements}
          prefix={prefix}
          size={35}
          value={formatted || address}
        />
      </Grid>
      <Grid container direction='row' item justifyContent='center'>
        <Grid item>
          <Infotip placement='bottom-start' text={recoverableToolTipTxt}>
            <IconButton
              onClick={openSocialRecovery}
              sx={{ height: '15px', width: '15px' }}
            >
              <FontAwesomeIcon
                color={isRecoverable ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faShieldHalved}
                shake={shakeShield}
              />
            </IconButton>
          </Infotip>
        </Grid>
        <Grid item>
          <Infotip placement='bottom-end' text={proxyTooltipTxt}>
            <IconButton onClick={openManageProxy} sx={{ height: '15px', width: '15px' }}>
              <FontAwesomeIcon
                color={hasProxy ? theme.palette.success.main : theme.palette.action.disabledBackground}
                fontSize='13px'
                icon={faSitemap}
                shake={shakeProxy}
              />
            </IconButton>
          </Infotip>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountIcons);
