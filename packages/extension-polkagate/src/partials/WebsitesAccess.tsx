// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/types';
import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import { Box, Container, Stack, Typography } from '@mui/material';
import { Key, Link2, Profile, Trash } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { emptyList } from '../assets/icons/index';
import { ActionButton, FadeOnScroll, MySnackbar, MyTooltip, SearchField } from '../components';
import { useIsExtensionPopup, useSelectedAccount, useTranslation } from '../hooks';
import { getAuthList, removeAuthorization } from '../messaging';
import { EditDappAccess, NothingFound, SharePopup } from '.';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
}

function EmptyAccessList () {
  const { t } = useTranslation();

  return (
    <Stack alignContent='center' direction='column'>
      <Box
        component='img'
        src={emptyList as string}
        sx={{ m: '70px auto -10px' }}
      />
      <Typography color='#BEAAD8' sx={{ p: '10px 40px 30px' }} variant='B-2'>
        {t('This is where sites with access to your accounts will appear')}
      </Typography>
    </Stack>
  );
}

interface AccessListProps {
  filteredAuthorizedDapps: AuthUrls | undefined
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string | undefined>>;
  setAccessToEdit: React.Dispatch<React.SetStateAction<AuthUrlInfo | undefined>>
}

function AccessList ({ filteredAuthorizedDapps, setAccessToEdit, setRefresh, setSearchKeyword }: AccessListProps): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const refContainer = useRef(null);
  const isExtension = useIsExtensionPopup();

  const [isBusy, setIsBusy] = useState<boolean>();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const onSearch = useCallback((text: string) => {
    setSearchKeyword(text);
  }, [setSearchKeyword]);

  const onDeleteDapp = useCallback((url: string) => () => {
    setIsBusy(true);
    removeAuthorization(url)
      .catch(console.error)
      .finally(() => {
        setIsBusy(false);
        setShowSnackbar(true);
      });
  }, []);

  const onEditList = useCallback((info: AuthUrlInfo) => () => {
    setAccessToEdit(info);
  }, [setAccessToEdit]);

  const onSnackbarClose = useCallback(() => {
    setShowSnackbar(false);
    setRefresh(true);
  }, [setRefresh]);

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
  }, [filteredAuthorizedDapps, setRefresh]);

  const dAppsToShow = (filteredAuthorizedDapps && Object.entries(filteredAuthorizedDapps)) ?? [];

  return (
    <Stack alignItems='center' direction='column' sx={{ height: '460px', position: 'relative', pt: '10px' }}>
      <Typography color='#BEAAD8' sx={{ p: isExtension ? '0 10px' : '10px 25px' }} variant='B-4'>
        {t('Control website access to your visible accounts. Edit the access list or delete a site to remove permissions. Only visible accounts are accessible.')}
      </Typography>
      <SearchField
        onInputChange={onSearch}
        placeholder={t('🔍 Search')}
        placeholderStyle={{ textAlign: isExtension ? 'center' : 'left' }}
        style={{ margin: isExtension ? '17px 0 0' : '20px 25px 15px', padding: '0 10px' }}
      />
      <Stack direction='row' justifyContent='space-between' sx={{ m: '20px 0 10px', px: '15px', width: '100%' }}>
        <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
          {t('origin')}
        </Typography>
        <Typography color='#7956A5' sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
          {t('action')}
        </Typography>
      </Stack>
      <Container disableGutters ref={refContainer} sx={{ height: ' 400px', overflow: 'hidden', overflowY: 'auto', p: isExtension ? '0 15px 50px' : '0 5px 50px' }}>
        {dAppsToShow.map(([url, info], index) => {
          const isIncluded = info.authorizedAccounts.find((address) => address === selectedAccount?.address);

          return (
            <>
              {
                !!index && isExtension &&
                <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '345px' }} />
              }
              <Stack alignItems='center' direction='row' justifyContent='space-between' key={index} sx={{ bgcolor: isExtension ? 'transparent' : '#05091C', borderRadius: '14px', mb: '2px', p: isExtension ? '10px 0' : '12px 10px', width: '100%' }}>
                <Stack alignItems='center' columnGap='5px' direction='row'>
                  <Link2 color='#FF4FB9' size='16' variant='Bulk' />
                  <Typography color='#EAEBF1' variant='B-4'>
                    {url}
                  </Typography>
                </Stack>
                <Stack alignItems='center' columnGap='5px' direction='row'>
                  <MyTooltip content={t('Edit access')}>
                    <Box onClick={onEditList(info)} sx={{ alignItems: 'center', bgcolor: isIncluded ? '#82FFA533' : '#2D1E4A', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', minWidth: '34px' }}>
                      <Typography color='#AA83DC' sx={{ mr: '3px' }} variant='B-4'>
                        {info.authorizedAccounts.length}
                      </Typography>
                      <Profile color={isIncluded ? '#82FFA5' : '#AA83DC'} size='14' variant='Bulk' />
                    </Box>
                  </MyTooltip>
                  <MyTooltip content={t('Remove access')}>
                    <Box onClick={onDeleteDapp(url)} sx={{ alignItems: 'center', bgcolor: '#FF165C26', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', width: '34px' }}>
                      <Trash color='#FF165C' size='16' variant='Bulk' />
                    </Box>
                  </MyTooltip>
                </Stack>
              </Stack>
            </>
          );
        })}
        <NothingFound
          show={dAppsToShow.length === 0}
          style={{ p: 0 }}
          text={t('Website Not Found')}
        />
      </Container>
      <FadeOnScroll containerRef={refContainer} height='53px' ratio={0.4} />
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
          bottom: '15px',
          height: '44px',
          padding: '0 20px',
          position: 'absolute',
          width: 'fit-content',
          zIndex: 11
        }}
        text={t('Remove all')}
        variant='contained'
      />
      <MySnackbar
        onClose={onSnackbarClose}
        open={showSnackbar}
        text={t('Access successfully removed!')}
      />
    </Stack>
  );
}

/**
 * Component for managing and displaying the list of websites (dApps) that have access to the user's accounts.
 * Allows searching, editing, and removing website access permissions.
 *
 * Has been used in both full-screen & extension mode!
 */
function WebsitesAccess ({ onClose, open }: Props): React.ReactElement {
  const { t } = useTranslation();
  const isExtension = useIsExtensionPopup();

  const [authorizedDapps, setAuthorizedDapps] = useState<AuthUrls>();
  const [refreshList, setRefresh] = useState<boolean>(true);
  const [searchKeyword, setSearchKeyword] = useState<string>();
  const [accessToEdit, setAccessToEdit] = useState<AuthUrlInfo>();

  useEffect(() => {
    refreshList && getAuthList().then((res) => {
      setAuthorizedDapps(res?.list);
      setRefresh(false);
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
    setAccessToEdit(undefined);

    if (isExtension || !accessToEdit) {
      onClose();
    }
  }, [accessToEdit, isExtension, onClose]);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px', padding: '20px 0px' }}
      onClose={handleClose}
      open={open}
      popupProps={{ TitleIcon: accessToEdit ? undefined : Key, iconSize: 18, maxHeight: '460px', onBack: accessToEdit ? () => setAccessToEdit(undefined) : undefined, pt: 20, withoutTopBorder: true }}
      title={t('Website access')}
    >
      {!Object.keys(authorizedDapps ?? {}).length
        ? <EmptyAccessList />
        : accessToEdit
          ? <EditDappAccess
              access={accessToEdit}
              setAccessToEdit={setAccessToEdit}
              setRefresh={setRefresh}
            />
          : <AccessList
              filteredAuthorizedDapps={filteredAuthorizedDapps}
              setAccessToEdit={setAccessToEdit}
              setRefresh={setRefresh}
              setSearchKeyword={setSearchKeyword}
            />
      }
    </SharePopup>
  );
}

export default React.memo(WebsitesAccess);
