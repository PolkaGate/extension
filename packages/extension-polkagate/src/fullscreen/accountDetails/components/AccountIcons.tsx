// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faShieldHalved, faSitemap } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CheckCircleOutline as CheckIcon, InsertLinkRounded as LinkIcon } from '@mui/icons-material';
import { Grid, IconButton, useTheme } from '@mui/material';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { ActionContext, Infotip } from '../../../components';
import { useAccountInfo3, useInfo, useTranslation } from '../../../hooks';
import { windowOpen } from '../../../messaging';
import { IDENTITY_CHAINS, PROXY_CHAINS, SOCIAL_RECOVERY_CHAINS } from '../../../util/constants';
import { Proxy } from '../../../util/types';

interface AddressDetailsProps {
  address: string | undefined;
}

export default function AccountIcons ({ address }: AddressDetailsProps): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const onAction = useContext(ActionContext);
  const { account, api, chain, formatted, genesisHash } = useInfo(address);

  const accountInfo = useAccountInfo3(genesisHash, formatted);

  const [hasID, setHasID] = useState<boolean | undefined>();
  const [isRecoverable, setIsRecoverable] = useState<boolean | undefined>();
  const [hasProxy, setHasProxy] = useState<boolean | undefined>();

  const recoverableToolTipTxt = useMemo(() => {
    if (!chain) {
      return 'Account is in Any Chain mode';
    }

    switch (isRecoverable) {
      case true:
        return 'Recoverable';
      case false:
        return 'Not Recoverable';
      default:
        return 'Checking';
    }
  }, [chain, isRecoverable]);

  const proxyTooltipTxt = useMemo(() => {
    if (!chain) {
      return 'Account is in Any Chain mode';
    }

    switch (hasProxy) {
      case true:
        return 'Has Proxy';
      case false:
        return 'No Proxy';
      default:
        return 'Checking';
    }
  }, [chain, hasProxy]);

  useEffect((): void => {
    setHasID(undefined);
    setIsRecoverable(undefined);
    setHasProxy(undefined);

    if (!api || !address || !account?.genesisHash || api.genesisHash.toHex() !== account.genesisHash) {
      return;
    }

    if (IDENTITY_CHAINS.includes(account.genesisHash)) {
      setHasID(!!accountInfo);
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
  }, [api, address, formatted, account?.genesisHash, accountInfo]);

  const openIdentity = useCallback(() => {
    address && chain && windowOpen(`/manageIdentity/${address}`);
  }, [address, chain]);

  const openSocialRecovery = useCallback(() => {
    address && chain && windowOpen(`/socialRecovery/${address}/false`);
  }, [address, chain]);

  const openManageProxy = useCallback(() => {
    address && chain && onAction(`/fullscreenProxyManagement/${address}`);
  }, [address, chain, onAction]);

  return (
    <Grid alignItems='center' container direction='column' display='grid' height='72px' item justifyContent='center' justifyItems='center' width='fit-content'>
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
  );
}
