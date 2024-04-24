// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutline as CheckIcon, InsertLinkRounded as LinkIcon } from '@mui/icons-material';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';

import { ActionContext, Infotip } from '../../../components';
import { useAccount, useAccountInfo2, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { Proxy } from '../../../util/types';

interface AddressDetailsProps {
  address: string | undefined;
  api: ApiPromise | undefined;
  formatted: string | undefined;
}

export default function AccountIcons ({ address, api, formatted }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const account = useAccount(address);
  const accountInfo = useAccountInfo2(api, formatted);

  const [hasID, setHasID] = useState<boolean | undefined>();
  const [isRecoverable, setIsRecoverable] = useState<boolean | undefined>();
  const [hasProxy, setHasProxy] = useState<boolean | undefined>();

  const recoverableToolTipTxt = useMemo(() => {
    switch (isRecoverable) {
      case true:
        return 'Recoverable';
      case false:
        return 'Not Recoverable';
      default:
        return 'Checking';
    }
  }, [isRecoverable]);

  const proxyTooltipTxt = useMemo(() => {
    if (hasProxy) {
      return 'Has Proxy';
    } else if (hasProxy === false) {
      return 'No Proxy';
    } else {
      return 'Checking';
    }
  }, [hasProxy]);

  useEffect((): void => {
    setHasID(undefined);
    setIsRecoverable(undefined);
    setHasProxy(undefined);

    if (!api || !address || !account?.genesisHash || api.genesisHash.toHex() !== account.genesisHash) {
      return;
    }

    if (api.query.identity && IDENTITY_CHAINS.includes(account.genesisHash)) {
      api.query.identity.identityOf(formatted).then((id) => setHasID(!id.isEmpty)).catch(console.error);
    } else {
      setHasID(false);
    }

    if (api.query?.recovery && SOCIAL_RECOVERY_CHAINS.includes(account.genesisHash)) {
      api.query.recovery.recoverable(formatted).then((r) => setIsRecoverable(r.isSome)).catch(console.error);
    } else {
      setIsRecoverable(false);
    }

    if (api.query?.proxy && PROXY_CHAINS.includes(account.genesisHash)) {
      api.query.proxy.proxies(formatted).then((p) => {
        const fetchedProxies = JSON.parse(JSON.stringify(p[0])) as unknown as Proxy[];

        setHasProxy(fetchedProxies.length > 0);
      }).catch(console.error);
    } else {
      setHasProxy(false);
    }
  }, [api, address, formatted, account?.genesisHash]);

  const openIdentity = useCallback(() => {
    address && windowOpen(`/manageIdentity/${address}`);
  }, [address]);

  const openSocialRecovery = useCallback(() => {
    address && windowOpen(`/socialRecovery/${address}/false`);
  }, [address]);

  const openManageProxy = useCallback(() => {
    address && onAction(`/fullscreenProxyManagement/${address}`);
  }, [address, onAction]);

  return (
    <Grid alignItems='center' container direction='column' display='grid' item justifyContent='center' justifyItems='center' width='fit-content' height='72px'>
      <Grid item onClick={openIdentity} sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: '5px', cursor: 'pointer', display: hasID ? 'inherit' : 'none', height: '24px', m: 'auto', p: '2px', width: 'fit-content' }}>
        {hasID
          ? accountInfo?.identity?.displayParent
            ? <LinkIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px', transform: 'rotate(-45deg)' }} />
            : <CheckIcon sx={{ bgcolor: 'success.main', border: '1px solid', borderRadius: '50%', color: 'white', fontSize: '18px' }} />
          : undefined
        }
      </Grid>
      <Grid height='24px' item width='24px'>
        <Infotip placement='right' text={t(recoverableToolTipTxt)}>
          <IconButton
            onClick={openSocialRecovery}
            sx={{ height: '24px', width: '24px' }}
          >
            <FontAwesomeIcon
              icon={faShieldHalved}
              style={{ border: '1px solid', borderRadius: '5px', color: isRecoverable ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '3px' }}
            />
          </IconButton>
        </Infotip>
      </Grid>
      <Grid height='24px' item width='fit-content'>
        <Infotip placement='right' text={t(proxyTooltipTxt)}>
          <IconButton onClick={openManageProxy} sx={{ height: '16px', width: '16px' }}>
            <FontAwesomeIcon
              icon={faSitemap}
              style={{ border: '1px solid', borderRadius: '5px', color: hasProxy ? theme.palette.success.main : theme.palette.action.disabledBackground, fontSize: '16px', padding: '2px' }}
            />
          </IconButton>
        </Infotip>
      </Grid>
    </Grid>
  )

}
