// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo } from '@polkadot/extension-base/background/types';
import type { AuthorizeRequestHandlerProp } from '../popup/authorize';

import { Container, Grid, Typography } from '@mui/material';
import { ArrowSwapHorizontal, MonitorMobbile } from 'iconsax-react';
import React, { useCallback, useEffect, useState } from 'react';

import { ExtensionPopup } from '../components';
import { useFavIcon, useTranslation } from '../hooks';
import { getAuthList, ignoreAuthRequest } from '../messaging';
import TransactionIndex from '../popup/signing/TransactionIndex';
import { extractBaseUrl } from '../util/utils';
import ConnectedAccounts from './ConnectedAccounts';
import DappInfo from './DappInfo';

interface Tab {
  url?: string;
  favIconUrl?: string;
}

export default function ConnectedDapp ({ authorizeRequestHandler }: { authorizeRequestHandler?: AuthorizeRequestHandlerProp }): React.ReactElement {
  const { t } = useTranslation();

  const [checking, setChecking] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean | undefined>(undefined);
  const [dapp, setDapp] = useState<AuthUrlInfo | undefined>(undefined);
  const [openMenu, setOpenMenu] = useState<boolean>(!!authorizeRequestHandler);
  const [refresh, setRefresh] = useState<boolean>(false);

  const favIconUrl = useFavIcon(dapp?.url ?? authorizeRequestHandler?.request?.url);

  const checkTab = useCallback(async () => {
    setChecking(true);

    try {
      const { list: authList } = await getAuthList();

      let authDappUrl: string | undefined;

      if (authorizeRequestHandler?.request?.url) {
        authDappUrl = authorizeRequestHandler?.request?.url;
      } else {
        const [tab] = await new Promise<Tab[]>((resolve) =>
          chrome.tabs.query({ active: true, currentWindow: true }, resolve)
        );

        authDappUrl = tab.url;
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
          <ArrowSwapHorizontal color='#82FFA5' size='15' style={{ background: '#BFA1FF26' }} />
          <Grid alignItems='center' container item onClick={openPopup} sx={{ bgcolor: '#82FFA533', border: '2px solid', borderColor: '#BFA1FF26', borderRadius: '10px', cursor: 'pointer', p: '3px', width: 'fit-content' }}>
            <MonitorMobbile color='#82FFA5' size='22' variant='Bulk' />
            <Typography color='#82FFA5' fontFamily='Inter' fontSize='14px' fontWeight={700}>
              {dapp?.authorizedAccounts.length}
            </Typography>
          </Grid>
        </Container>
      }
      <ExtensionPopup
        TitleIcon={MonitorMobbile}
        handleClose={closePopup}
        openMenu={openMenu}
        title={t('Connected Accounts')}
        withoutTopBorder
      >
        <Grid container item justifyContent='center' sx={{ overflow: 'hidden', position: 'relative', pt: '5px', zIndex: 1 }}>
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
      </ExtensionPopup>
    </>
  );
}
