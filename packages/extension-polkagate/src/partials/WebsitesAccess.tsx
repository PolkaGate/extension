// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrls } from '@polkadot/extension-base/background/types';

import { Box, Container, Stack, Typography } from '@mui/material';
import { Category, Key, Profile, Trash } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { emptyHistoryList } from '../assets/icons/index';
import { ActionButton, ExtensionPopup, MyTooltip, SearchField } from '../components';
import { useSelectedAccount, useTranslation } from '../hooks';
import { getAuthList, removeAuthorization } from '../messaging';
import MySnackbar from '../popup/settings/extensionSettings/components/MySnackbar';
import { ExtensionPopups } from '../util/constants';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
  open: boolean;
}

function EmptyHistoryBox() {
  const { t } = useTranslation();

  return (
    <Stack alignContent='center' direction='column'>
      <Box
        component='img'
        src={emptyHistoryList as string}
        sx={{ m: '70px auto -10px' }}
      />
      <Typography color='#BEAAD8' sx={{ px: '40px' }} variant='B-2'>
        {t('This is where the sites that have access to the accounts will appear.')}
      </Typography>
    </Stack>
  );
}

function WebsitesAccess({ open, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [authorizedDapps, setAuthorizedDapps] = useState<AuthUrls>();
  const [refreshList, setRefresh] = useState<boolean>();
  const [isBusy, setIsBusy] = useState<boolean>();
  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [urlToEditAccess, setUrlToEditDappAccess] = useState<string>();

  useEffect(() => {
    getAuthList().then((res) => {
      setAuthorizedDapps(res?.list);
    }).catch(console.error);
  }, [refreshList]);

  const filteredAuthorizedDapps = useMemo(() => {
    if (!searchKeyword || !authorizedDapps) {
      return authorizedDapps;
    }

    return Object.fromEntries(
      Object.entries(authorizedDapps).filter(([key]) =>
        key.includes(searchKeyword)
      )
    );
  }, [authorizedDapps, searchKeyword]);

  const handleClose = useCallback(() => {
    setShowSnackbar(false);
    setPopup(ExtensionPopups.NONE);
  }, [setPopup]);

  const onSearch = useCallback((text: string) => {
    setSearchKeyword(text);
  }, []);

  const onDeleteDapp = useCallback((url: string) => {
    setIsBusy(true);
    removeAuthorization(url)
      .catch(console.error)
      .finally(() => {
        setIsBusy(false);
        setRefresh((pre) => !pre);
      });
  }, []);

  const onEditList = useCallback((url: string) => {
    setUrlToEditDappAccess(url);
  }, []);

  const onDeleteAll = useCallback(() => {
    if (filteredAuthorizedDapps) {
      setIsBusy(true);
      Promise
        .all(Object.keys(filteredAuthorizedDapps)
          .map((url) => removeAuthorization(url).catch(console.error)))
        .catch(console.error)
        .finally(() => {
          setIsBusy(false);
          setRefresh((pre) => !pre);
        });
    }
  }, [filteredAuthorizedDapps]);

  return (
    <ExtensionPopup
      TitleIcon={Key}
      handleClose={handleClose}
      iconSize={18}
      openMenu={open}
      pt={20}
      title={t('Manage website access')}
      withoutTopBorder
    >
      {!Object.keys(filteredAuthorizedDapps ?? {}).length
        ? <EmptyHistoryBox />
        : <Stack alignItems='center' direction='column' sx={{ height: '440px', position: 'relative', p: '10px 5px 0' }}>
          <Typography color='#BEAAD8' variant='B-4'>
            {t('Control which visible accounts websites can access. Update or deny access by adjusting the access list or deleting the website entry. Only your visible accounts can be accessed')}
          </Typography>
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search'
            style={{ marginTop: '17px' }}
          />
          <Stack direction='row' justifyContent='space-between' sx={{ m: '20px 0 10px', width: '100%' }}>
            <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
              {t('origin')}
            </Typography>
            <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
              {t('action')}
            </Typography>
          </Stack>
          <Container disableGutters sx={{ height: ' 400px', overflow: 'scroll' }}>
            {filteredAuthorizedDapps && Object.entries(filteredAuthorizedDapps).map(([url, info], index) => {
              const isIncluded = info.authorizedAccounts.find((address) => address === selectedAccount?.address);

              return (
                <>
                  {
                    !!index &&
                    <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '345px' }} />
                  }
                  <Stack alignItems='center' direction='row' justifyContent='space-between' key={index} sx={{ my: '10px', width: '100%' }}>
                    <Stack alignItems='center' columnGap='5px' direction='row'>
                      <Category color='#FF4FB9' size='16' variant='Bulk' />
                      <Typography color='#EAEBF1' variant='B-4'>
                        {url}
                      </Typography>
                    </Stack>
                    <Stack alignItems='center' columnGap='5px' direction='row'>
                      <Box onClick={() => onEditList(url)} sx={{ alignItems: 'center', bgcolor: isIncluded ? '#82FFA533' : '#2D1E4A', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', minWidth: '34px' }}>
                        <Typography color='#AA83DC' sx={{ mr: '3px' }} variant='B-4'>
                          {info.authorizedAccounts.length}
                        </Typography>
                        <Profile color={isIncluded ? '#82FFA5' : '#AA83DC'} size='14' variant='Bulk' />
                      </Box>
                      <MyTooltip content={t('Remove access')}>
                        <Box onClick={() => onDeleteDapp(url)} sx={{ alignItems: 'center', bgcolor: '#FF165C26', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', width: '34px' }}>
                          <Trash color='#FF165C' size='16' variant='Bulk' />
                        </Box>
                      </MyTooltip>
                    </Stack>
                  </Stack>
                </>
              );
            })}
          </Container>
          <ActionButton
            StartIcon={Trash}
            contentPlacement='center'
            disabled={!Object.keys(filteredAuthorizedDapps ?? {})?.length}
            iconSize={16}
            iconVariant='Bulk'
            isBusy={isBusy}
            onClick={onDeleteAll}
            style={{
              '& .MuiButton-startIcon': {
                marginRight: '5px'
              },
              borderRadius: '10px',
              bottom: 0,
              height: '44px',
              padding: '0 20px',
              position: 'absolute',
              width: 'fit-content'
            }}
            text={t('Remove all')}
            variant='contained'
          />
        </Stack>
      }
      <MySnackbar
        onClose={handleClose}
        open={showSnackbar}
        text={t('Website successfully removed!')}
      />
    </ExtensionPopup>
  );
}

export default React.memo(WebsitesAccess);
