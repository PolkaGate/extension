// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AuthUrlInfo, AuthUrls } from '@polkadot/extension-base/background/types';
import type { ExtensionPopupCloser } from '../util/handleExtensionPopup';

import { Box, Container, Stack, Typography, useTheme } from '@mui/material';
import { Key, Link2, Profile, Trash, Warning2 } from 'iconsax-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { emptyList } from '../assets/icons/index';
import { ActionButton, DecisionButtons, FadeOnScroll, MySnackbar, MyTooltip, SearchField } from '../components';
import { useIsExtensionPopup, useSelectedAccount, useTranslation } from '../hooks';
import { getAuthList, removeAuthorization } from '../messaging';
import { EditDappAccess, NothingFound, SharePopup } from '.';

interface Props {
  onClose: ExtensionPopupCloser;
  open: boolean;
}

function EmptyAccessList() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack alignContent='center' direction='column'>
      <Box
        component='img'
        src={emptyList as string}
        sx={{ m: '70px auto -10px' }}
      />
      <Typography color={theme.palette.text.secondary} sx={{ p: '10px 40px 30px' }} variant='B-2'>
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

function AccessList({ filteredAuthorizedDapps, setAccessToEdit, setRefresh, setSearchKeyword }: AccessListProps): React.ReactElement {
  const { t } = useTranslation();
  const selectedAccount = useSelectedAccount();
  const refContainer = useRef(null);
  const isExtension = useIsExtensionPopup();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [isBusy, setIsBusy] = useState<boolean>();
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] = useState(false);

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
          setShowDeleteAllConfirmation(false);
          setRefresh((pre) => !pre);
        });
    }
  }, [filteredAuthorizedDapps, setRefresh]);

  const openDeleteAllConfirmation = useCallback(() => {
    setShowDeleteAllConfirmation(true);
  }, []);

  const closeDeleteAllConfirmation = useCallback(() => {
    if (!isBusy) {
      setShowDeleteAllConfirmation(false);
    }
  }, [isBusy]);

  const dAppsToShow = (filteredAuthorizedDapps && Object.entries(filteredAuthorizedDapps)) ?? [];

  return (
    <Stack alignItems='center' direction='column' sx={{ height: '460px', position: 'relative', pt: '10px' }}>
      <Typography color='text.secondary' sx={{ p: isExtension ? '0 10px' : '10px 25px' }} variant='B-4'>
        {t('Control website access to your visible accounts. Edit the access list or delete a site to remove permissions. Only visible accounts are accessible.')}
      </Typography>
      <SearchField
        onInputChange={onSearch}
        placeholder={t('🔍 Search')}
        placeholderStyle={{ textAlign: isExtension ? 'center' : 'left' }}
        style={{ margin: isExtension ? '17px 0 0' : '20px 25px 15px', padding: '0 10px' }}
      />
      <Stack direction='row' justifyContent='space-between' sx={{ m: '20px 0 10px', px: '15px', width: '100%' }}>
        <Typography color={isDark ? '#7956A5' : '#8A79B3'} sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
          {t('origin')}
        </Typography>
        <Typography color={isDark ? '#7956A5' : '#8A79B3'} sx={{ fontWeight: 600, textTransform: 'uppercase' }} variant='B-5'>
          {t('action')}
        </Typography>
      </Stack>
      <Container disableGutters ref={refContainer} sx={{ height: ' 400px', overflow: 'hidden', overflowY: 'auto', p: isExtension ? '0 15px 50px' : '0 5px 50px' }}>
        {dAppsToShow.map(([url, info], index) => {
          const isIncluded = info.authorizedAccounts.find((address) => address === selectedAccount?.address);

          return (
            <React.Fragment key={index}>
              {
                !!index && isExtension &&
                <Box sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '345px' }} />
              }
              <Stack alignItems='center' direction='row' justifyContent='space-between' key={index} sx={{ bgcolor: isExtension ? 'transparent' : (isDark ? '#05091C' : '#FFFFFF'), border: isExtension || isDark ? 'none' : '1px solid #DDE3F4', borderRadius: '14px', mb: '2px', p: isExtension ? '10px 0' : '12px 10px', width: '100%' }}>
                <Stack alignItems='center' columnGap='5px' direction='row'>
                  <Link2 color='#FF4FB9' size='16' variant='Bulk' />
                  <Typography color='text.primary' variant='B-4'>
                    {url}
                  </Typography>
                </Stack>
                <Stack alignItems='center' columnGap='5px' direction='row'>
                  <MyTooltip content={t('Edit access')}>
                    <Box onClick={onEditList(info)} sx={{ alignItems: 'center', bgcolor: isIncluded ? (isDark ? '#82FFA533' : '#E8F9EE') : (isDark ? '#2D1E4A' : '#EEF2FB'), border: isDark ? 'none' : '1px solid #E0E6F7', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', minWidth: '34px' }}>
                      <Typography color={isDark ? '#AA83DC' : '#7A69A8'} sx={{ mr: '3px' }} variant='B-4'>
                        {info.authorizedAccounts.length}
                      </Typography>
                      <Profile color={isIncluded ? '#82FFA5' : (isDark ? '#AA83DC' : '#7A69A8')} size='14' variant='Bulk' />
                    </Box>
                  </MyTooltip>
                  <MyTooltip content={t('Remove access')}>
                    <Box onClick={onDeleteDapp(url)} sx={{ alignItems: 'center', bgcolor: '#FF165C26', borderRadius: '128px', cursor: 'pointer', display: 'flex', height: '24px', justifyContent: 'center', width: '34px' }}>
                      <Trash color='#FF165C' size='16' variant='Bulk' />
                    </Box>
                  </MyTooltip>
                </Stack>
              </Stack>
            </React.Fragment>
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
        onClick={openDeleteAllConfirmation}
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
      <SharePopup
        modalProps={{ showBackIconAsClose: true }}
        modalStyle={{ minHeight: isExtension ? '170px' : '200px', padding: isExtension ? '10px 0px' : '20px 0px' }}
        onClose={closeDeleteAllConfirmation}
        open={showDeleteAllConfirmation}
        popupProps={{
          TitleIcon: Warning2,
          contentContainerStyle: isExtension ? { height: 'fit-content', maxHeight: '260px' } : undefined,
          iconColor: '#FFCE4F',
          iconSize: isExtension ? 34 : 44,
          maxHeight: isExtension ? '210px' : '250px',
          pt: isExtension ? 12 : 20,
          style: isExtension ? { display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' } : undefined,
          titleDirection: 'column',
          titleVariant: 'H-3',
          withoutTopBorder: true
        }}
        title={t('Remove all access')}
      >
        <Stack direction='column' sx={{ alignItems: 'center', px: '20px', pb: isExtension ? '12px' : '20px' }}>
          <Typography color='text.secondary' sx={{ pb: isExtension ? '16px' : '25px', textAlign: 'center' }} variant='B-4'>
            {t('This will remove access for all authenticated websites. Are you sure you want to continue?')}
          </Typography>
          <DecisionButtons
            direction='vertical'
            isBusy={isBusy}
            onPrimaryClick={onDeleteAll}
            onSecondaryClick={closeDeleteAllConfirmation}
            primaryBtnText={t('Remove all')}
            secondaryBtnText={t('Cancel')}
            style={{ width: '100%' }}
          />
        </Stack>
      </SharePopup>
    </Stack>
  );
}

/**
 * Component for managing and displaying the list of websites (dApps) that have access to the user's accounts.
 * Allows searching, editing, and removing website access permissions.
 *
 * Has been used in both full-screen & extension mode!
 */
function WebsitesAccess({ onClose, open }: Props): React.ReactElement {
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
