// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { DeriveAccountInfo } from '@polkadot/api-derive/types';
//@ts-ignore
import type { PalletProxyAnnouncement, PalletRecoveryActiveRecovery } from '@polkadot/types/lookup';

import { faChain, faCheckCircle, faCircleInfo, faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext, Infotip } from '../../../components';
import { useAnimateOnce, useHasIdentityTooltipText, useHasProxyTooltipText, useInfo, useIsRecoverableTooltipText } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { IDENTITY_CHAINS } from '../../../util/constants';

interface AddressDetailsProps {
  address: string | undefined;
  accountInfo: DeriveAccountInfo | undefined | null
}

function AccountIconsFs({ accountInfo, address }: AddressDetailsProps): React.ReactElement {
  const theme = useTheme();

  const onAction = useContext(ActionContext);
  const { account, api, chain, formatted } = useInfo(address);

  const [hasID, setHasID] = useState<boolean | undefined>();

  const { isRecoverable, recoverableToolTipTxt } = useIsRecoverableTooltipText(address);
  const { hasProxy, proxyTooltipTxt } = useHasProxyTooltipText(address);
  const identityToolTipTxt = useHasIdentityTooltipText(address, hasID);

  const shakeProxy = useAnimateOnce(hasProxy);
  const shakeShield = useAnimateOnce(isRecoverable);
  const shakeIdentity = useAnimateOnce(hasID);

  useEffect((): void => {
    if (!api || !formatted || !account?.genesisHash || api.genesisHash.toHex() !== account.genesisHash) {
      return;
    }

    if (IDENTITY_CHAINS.includes(account.genesisHash)) {
      setHasID(!!accountInfo);
    } else {
      setHasID(false);
    }
  }, [api, formatted, account?.genesisHash, accountInfo]);

  const openIdentity = useCallback(() => {
    address && chain && windowOpen(`/manageIdentity/${address}`).catch(console.error);
  }, [address, chain]);

  const openSocialRecovery = useCallback(() => {
    address && chain && windowOpen(`/socialRecovery/${address}/false`).catch(console.error);
  }, [address, chain]);

  const openManageProxy = useCallback(() => {
    address && chain && onAction(`/fullscreenProxyManagement/${address}`);
  }, [address, chain, onAction]);

  return (
    <Grid alignItems='center' container direction='column' display='grid' height='72px' item justifyContent='center' justifyItems='center' width='fit-content'>
      <Grid item onClick={openIdentity} sx={{ cursor: 'pointer', height: '24px', m: 'auto', p: '2px', width: 'fit-content' }}>
        <Infotip placement='right' text={identityToolTipTxt}>
          {hasID
            ? accountInfo?.identity?.displayParent
              ? <FontAwesomeIcon
                icon={faChain}
                shake={shakeIdentity}
                style={{ border: '1px solid', borderRadius: '5px', color: theme.palette.success.main, fontSize: '13px', padding: '2px' }}
              />
              : <FontAwesomeIcon
                icon={faCheckCircle}
                shake={shakeIdentity}
                style={{ border: '1px solid', borderRadius: '5px', color: theme.palette.success.main, fontSize: '16px', padding: '2px' }}
              />
            : <FontAwesomeIcon
              icon={faCircleInfo}
              style={{ border: '1px solid', borderRadius: '5px', color: theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
            />
          }
        </Infotip>
      </Grid>
      <Grid height='24px' item my='1px' width='24px'>
        <Infotip placement='right' text={recoverableToolTipTxt}>
          <IconButton
            onClick={openSocialRecovery}
            sx={{ height: '24px', width: '24px' }}
          >
            <FontAwesomeIcon
              icon={faShieldHalved}
              shake={shakeShield}
              style={{ border: '1px solid', borderRadius: '5px', color: isRecoverable ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
            />
          </IconButton>
        </Infotip>
      </Grid>
      <Grid height='24px' item width='fit-content'>
        <Infotip placement='right' text={proxyTooltipTxt}>
          <IconButton onClick={openManageProxy} sx={{ height: '16px', width: '16px' }}>
            <FontAwesomeIcon
              icon={faSitemap}
              shake={shakeProxy}
              style={{ border: '1px solid', borderRadius: '5px', color: hasProxy ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
            />
          </IconButton>
        </Infotip>
      </Grid>
    </Grid>
  );
}

export default React.memo(AccountIconsFs);
