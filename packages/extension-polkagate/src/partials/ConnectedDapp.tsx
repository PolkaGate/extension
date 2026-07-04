// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';
import type { AuthorizeRequestHandlerProp } from '../popup/authorize';

import { Container, Grid, Typography, useTheme } from '@mui/material';
import { ArrowSwapHorizontal, MonitorMobbile } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { useFavIcon, useIsSidePanel, useTranslation } from '../hooks';
import { getAuthList, ignoreAuthRequest } from '../messaging';
import TransactionIndex from '../popup/signing/TransactionIndex';
import { extractBaseUrl } from '../util';
import ConnectedAccounts from './ConnectedAccounts';
import DappInfo from './DappInfo';
import SharePopup from './SharePopup';

interface Tab {
  url?: string;
  favIconUrl?: string;
}

interface ChromeWithTabs {
  tabs?: {
    query: (queryInfo: { active: boolean, currentWindow: boolean }, callback: (tabs: Tab[]) => void) => void;
  };
}

const getChrome = () => (globalThis as typeof globalThis & { chrome?: ChromeWithTabs }).chrome;

function getActiveTabs(): Promise<Tab[]> {
  return new Promise((resolve) => {
    const chromeApi = getChrome();

    if (!chromeApi?.tabs?.query) {
      resolve([]);

      return;
    }

    chromeApi.tabs.query({ active: true, currentWindow: true }, resolve);
  });
}

interface ConnectedDappContentsProps {
  setOpenMenu?: React.Dispatch<React.SetStateAction<boolean>>;
  authorizeRequestHandler?: AuthorizeRequestHandlerProp;
}

function ConnectedDappContents({ authorizeRequestHandler, setOpenMenu }: ConnectedDappContentsProps): React.ReactElement {
  const { t } = useTranslation();
  const isSidePanel = useIsSidePanel();

  const [checking, setChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [dapp, setDapp] = useState<AuthUrlInfo | undefined>(undefined);
  const [refresh, setRefresh] = useState<boolean>(false);

  const favIconUrl = useFavIcon(dapp?.url ?? authorizeRequestHandler?.request?.url);

  const checkTab = useCallback(async() => {
    setChecking(true);

    try {
      const { list: authList } = await getAuthList();

      let authDappUrl: string | undefined;

      if (authorizeRequestHandler?.request?.url) {
        authDappUrl = authorizeRequestHandler?.request?.url;
      } else {
        const [tab] = await getActiveTabs();

        authDappUrl = tab?.url;
      }

      if (!authDappUrl) {
        setIsConnected(false);

        return;
      }

      const availableDapp = Object.values(authList).find(({ url }) => extractBaseUrl(authDappUrl) === extractBaseUrl(url));

      if (!availableDapp) {
        setOpenMenu?.(true);

        return;
      } else {
        setDapp(availableDapp);
      }

      setIsConnected(!!availableDapp);
    } catch (error) {
      console.error('Error checking tab:', error);
      setIsConnected(false);
    } finally {
      setChecking(false);
      setRefresh(false);
    }
  }, [authorizeRequestHandler?.request?.url, setOpenMenu]);

  useEffect(() => {
    if ((isConnected === undefined && !checking && favIconUrl === undefined) || refresh) {
      checkTab().catch(console.error);
    }
  }, [checkTab, checking, favIconUrl, isConnected, refresh]);

  const closePopup = useCallback(() => {
    authorizeRequestHandler?.request?.id && ignoreAuthRequest(authorizeRequestHandler?.request?.id)
      .catch((error: Error) => console.error(error));

    setOpenMenu?.(false);
  }, [authorizeRequestHandler?.request?.id, setOpenMenu]);

  if (!authorizeRequestHandler && !dapp) {
    return <></>;
  }

  return (
    <Grid container item justifyContent='center' sx={{ display: isSidePanel ? 'flex' : undefined, flexDirection: isSidePanel ? 'column' : undefined, flexWrap: isSidePanel ? 'nowrap' : undefined, height: isSidePanel ? 'calc(100vh - 255px)' : undefined, minHeight: isSidePanel ? 0 : undefined, overflow: 'hidden', position: 'relative', pt: '5px', zIndex: 1 }}>
      {authorizeRequestHandler?.hasBanner &&
        <TransactionIndex
          index={authorizeRequestHandler?.currentIndex}
          onNextClick={authorizeRequestHandler?.onNext}
          onPreviousClick={authorizeRequestHandler?.onPrevious}
          totalItems={authorizeRequestHandler.totalRequests}
        />
      }
      <Typography color='text.secondary' pt={authorizeRequestHandler?.hasBanner ? '8px' : 0} variant='B-4'>
        {t('Here you can manage the current connections to your accounts')}
      </Typography>
      <DappInfo
        dappName={dapp?.id ?? authorizeRequestHandler?.request?.request.origin}
        favicon={favIconUrl}
      />
      <ConnectedAccounts
        closePopup={closePopup}
        dappInfo={dapp}
        hasBanner={Boolean(authorizeRequestHandler?.hasBanner)}
        requestId={authorizeRequestHandler?.request?.id}
        setRefresh={setRefresh}
      />
    </Grid>
  );
}

export default function ConnectedDapp({ authorizeRequestHandler }: { authorizeRequestHandler?: AuthorizeRequestHandlerProp }): React.ReactElement {
  const theme = useTheme();
  const { t } = useTranslation();
  const isSidePanel = useIsSidePanel();
  const isLight = theme.palette.mode === 'light';
  const indicatorBgColor = isLight ? '#DDE3F4CC' : '#82FFA533';
  const indicatorBorderColor = isLight ? '#DDE3F4' : '#BFA1FF26';
  const indicatorColor = isLight ? '#008080' : '#82FFA5';
  const connectionArrowColor = isLight ? '#F8F8FF' : '#82FFA5';

  const [checking, setChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [dapp, setDapp] = useState<AuthUrlInfo | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<boolean>(!!authorizeRequestHandler);
  const [refresh, setRefresh] = useState<boolean>(false);

  const favIconUrl = useFavIcon(dapp?.url ?? authorizeRequestHandler?.request?.url);

  const checkTab = useCallback(async() => {
    setChecking(true);

    try {
      const { list: authList } = await getAuthList();

      let authDappUrl: string | undefined;

      if (authorizeRequestHandler?.request?.url) {
        authDappUrl = authorizeRequestHandler?.request?.url;
      } else {
        const [tab] = await getActiveTabs();

        authDappUrl = tab?.url;
      }

      if (!authDappUrl) {
        setIsConnected(false);

        return;
      }

      const availableDapp = Object.values(authList).find(({ url }) => extractBaseUrl(authDappUrl) === extractBaseUrl(url));

      if (!availableDapp) {
        setOpenMenu(true);

        return;
      } else {
        setDapp(availableDapp);
      }

      setIsConnected(!!availableDapp);
    } catch (error) {
      console.error('Error checking tab:', error);
      setIsConnected(false);
    } finally {
      setChecking(false);
      setRefresh(false);
    }
  }, [authorizeRequestHandler?.request?.url]);

  useEffect(() => {
    if ((isConnected === undefined && !checking && favIconUrl === undefined) || refresh) {
      checkTab().catch(console.error);
    }
  }, [checkTab, checking, favIconUrl, isConnected, refresh]);

  const openPopup = useCallback(() => {
    dapp && setOpenMenu(true);
  }, [dapp]);

  const closePopup = useCallback(() => {
    authorizeRequestHandler?.request?.id && ignoreAuthRequest(authorizeRequestHandler?.request?.id)
      .catch((error: Error) => console.error(error));

    setOpenMenu(false);
  }, [authorizeRequestHandler?.request?.id]);

  if (!authorizeRequestHandler && !dapp) {
    return <></>;
  }

  return (
    <>
      {!authorizeRequestHandler &&
        <Container className='ConnectedDapp' disableGutters sx={{ alignItems: 'center', display: 'flex', width: 'fit-content' }}>
          <ArrowSwapHorizontal color={connectionArrowColor} size='15' />
          <Grid alignItems='center' container item onClick={openPopup} sx={{ bgcolor: indicatorBgColor, border: '2px solid', borderColor: indicatorBorderColor, borderRadius: '10px', cursor: 'pointer', p: '3px', width: 'fit-content' }}>
            <MonitorMobbile color={indicatorColor} size='22' variant='Bulk' />
            <Typography color={indicatorColor} fontFamily='Inter' fontSize='14px' fontWeight={700}>
              {dapp?.authorizedAccounts.length}
            </Typography>
          </Grid>
        </Container>
      }
      <SharePopup
        modalProps={{
          dividerStyle: { margin: '5px 0 20px' },
          showBackIconAsClose: true,
          width: 385
        }}
        modalStyle={{ minHeight: '200px' }}
        onClose={closePopup}
        open={openMenu}
        popupProps={{
          TitleIcon: MonitorMobbile,
          compactInSidePanel: isSidePanel,
          maxHeight: isSidePanel ? 'calc(100vh - 170px)' : undefined,
          withoutTopBorder: true
        }}
        title={t('Connected Accounts')}
      >
        <ConnectedDappContents
          authorizeRequestHandler={authorizeRequestHandler}
          setOpenMenu={setOpenMenu}
        />
      </SharePopup>
    </>
  );
}
