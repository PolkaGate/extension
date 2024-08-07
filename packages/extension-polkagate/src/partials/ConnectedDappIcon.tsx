// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Avatar } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { ActionContext } from '../components';
import { getAuthList } from '../messaging';

interface Tab {
  url?: string;
  favIconUrl?: string;
}

export default function ConnectedDappIcon (): React.ReactElement {
  const onAction = useContext(ActionContext);

  const [checking, setChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [favIconUrl, setFavIconUrl] = useState<string | undefined>(undefined);
  const [dappId, setDappId] = useState<string | undefined>(undefined);
  const [flip, setFlip] = useState(false);

  const isOnHomePage = window.location.hash === '#/';

  const checkTab = useCallback(async () => {
    setChecking(true);

    try {
      const { list: authList } = await getAuthList();

      const [tab] = await new Promise<Tab[]>((resolve) =>
        chrome.tabs.query({ active: true, currentWindow: true }, resolve)
      );

      if (!tab?.url) {
        setIsConnected(false);

        return;
      }

      const availableDapp = Object.values(authList).find(({ url }) => tab.url?.startsWith(url));

      setDappId(availableDapp?.id);
      setIsConnected(!!availableDapp);
      setFavIconUrl(tab.favIconUrl);
    } catch (error) {
      console.error('Error checking tab:', error);
      setIsConnected(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    if (!favIconUrl) {
      return;
    }

    setFlip(true);
    setTimeout(() => setFlip(false), 1000);
  }, [favIconUrl]);

  useEffect(() => {
    if (isOnHomePage && isConnected === undefined && !checking && favIconUrl === undefined) {
      checkTab().catch(console.error);
    }
  }, [checkTab, checking, favIconUrl, isConnected, isOnHomePage]);

  const openConnected = useCallback(() => {
    dappId && onAction(`/auth-list/${dappId}`);
  }, [dappId, onAction]);

  if (!isOnHomePage || isConnected === undefined || !dappId) {
    return <></>;
  }

  return (
    <Avatar
      onClick={openConnected}
      src={favIconUrl ?? undefined}
      sx={{
        borderRadius: '50%',
        bottom: 5,
        cursor: 'pointer',
        height: '15px',
        position: 'absolute',
        right: 10,
        transform: flip ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 1s',
        width: '15px'
      }}
      variant='circular'
    />
  );
}
