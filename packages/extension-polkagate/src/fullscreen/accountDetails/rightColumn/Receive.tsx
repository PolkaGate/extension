// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';

import { Grid, Grow, Stack, styled, Typography } from '@mui/material';
import { DocumentCopy } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import { Address2, ChainLogo, DecisionButtons, GradientDivider, MySnackbar, SearchField } from '@polkadot/extension-polkagate/src/components/index';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import { sanitizeChainName, toShortAddress } from '@polkadot/extension-polkagate/src/util';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { useFormatted, useGenesisHashOptions, useSelectedAccount, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  address: string | undefined;
  onClose?: () => void;
  closePopup: ExtensionPopupCloser;
  setAddress?: React.Dispatch<React.SetStateAction<string | null | undefined>>;
}

interface AddressComponentProp {
  address: string | undefined;
  chainName: string | undefined;
  onCopy: () => void;
}

const ListItem = styled(Grid)(() => ({
  '&:hover': {
    backgroundColor: '#6743944D'
  },
  alignItems: 'center',
  borderRadius: '12px',
  cursor: 'pointer',
  height: '40px',
  justifyContent: 'space-between',
  transition: 'all 250ms ease-out'
}));

interface SelectChainProp {
  setSelectedChain: React.Dispatch<React.SetStateAction<DropdownOption | undefined>>;
}

function SelectChain ({ setSelectedChain }: SelectChainProp) {
  const { t } = useTranslation();
  const allChains = useGenesisHashOptions(false);

  const [keyword, setSearchKeyword] = useState<string>();

  const onSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
  }, []);

  const chainsToShow = useMemo(() => {
    if (!keyword) {
      return allChains;
    }

    const _keyword = keyword.trim().toLowerCase();

    return allChains.filter(({ text }) => text.toLowerCase().includes(_keyword));
  }, [allChains, keyword]);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={t('🔍 Search networks')}
        />
      </Grid>
      <Grid container item sx={{ display: 'block', maxHeight: '395px', minHeight: '395px', my: '10px', overflowY: 'auto' }}>
        {chainsToShow.map((chain, index) => {
          const chainName = chain.text;

          return (
            <React.Fragment key={index}>
              <ListItem container item key={index} onClick={() => setSelectedChain(chain)}>
                <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
                  <ChainLogo chainName={chainName} size={18} />
                  <Typography color='text.primary' variant='B-2'>
                    {chainName}
                  </Typography>
                </Grid>
              </ListItem>
              {
                index !== chainsToShow.length - 1 &&
                <GradientDivider style={{ my: '3px' }} />
              }
            </React.Fragment>
          );
        })}
        <NothingFound
          show={chainsToShow.length === 0}
          style={{ pb: '60px' }}
          text={t('Network Not Found')}
        />
      </Grid>
    </Grid>
  );
}

function AddressComponent ({ address, chainName, onCopy }: AddressComponentProp) {
  const { isHovered, ref } = useIsHovered();

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '12px', p: '3px' }}>
      <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
        <ChainLogo chainName={chainName} size={18} />
        <Typography color='text.secondary' variant='B-4'>
          {toShortAddress(address, 12)}
        </Typography>
      </Grid>
      <Grid container item onClick={onCopy} ref={ref} sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '8px', cursor: 'pointer', p: '9px', width: 'fit-content' }}>
        <DocumentCopy color='#fff' size='17' variant={isHovered ? 'Bulk' : 'Bold'} />
      </Grid>
    </Grid>
  );
}

function Receive ({ address, closePopup, onClose, setAddress }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedChain, setSelectedChain] = useState<DropdownOption | undefined>();

  const formattedAddress = useFormatted(address, selectedChain?.value as string | undefined);
  const chainName = useMemo(() => selectedChain ? sanitizeChainName(selectedChain?.text)?.toLowerCase() : '', [selectedChain]);
  const chainLogo = useMemo(() => getLogo2(chainName), [chainName]);

  const onCopy = useCallback(() => {
    formattedAddress && navigator.clipboard.writeText(formattedAddress).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [formattedAddress]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);
  const _onClose = useCallback(() => {
    if (onClose) {
      return onClose();
    }

    if (selectedChain) {
      return setSelectedChain(undefined);
    }

    if (!selectedChain && setAddress) {
      return setAddress(undefined);
    }

    closePopup();
  }, [onClose, selectedChain, setAddress, closePopup]);

  const onDone = useCallback(() => {
    onClose && onClose();
    setSelectedChain(undefined);
    closePopup();
  }, [onClose, closePopup]);

  return (
    <DraggableModal
      closeOnAnyWhereClick
      onClose={_onClose}
      open
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={selectedChain ? t('Receive funds') : t('Select network')}
    >
      <Grow in>
        <Grid container>
          {!selectedChain
            ? <SelectChain setSelectedChain={setSelectedChain} />
            : <>
              <Stack direction='column' justifyItems='center' sx={{ display: 'block', width: '100%' }}>
                <Address2
                  address={address}
                  name={account?.name}
                  style={{ marginTop: '10px' }}
                />
                <Grid container item sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '17px', mb: '29px', mt: '25px', p: '4px', width: 'fit-content' }}>
                  <QRCode
                    bgColor='#fff'
                    ecLevel='H'
                    eyeColor={chainLogo?.color}
                    fgColor='#000'
                    logoImage={chainLogo?.logo}
                    logoPadding={5}
                    logoPaddingStyle='circle'
                    qrStyle='dots'
                    removeQrCodeBehindLogo={true}
                    size={200}
                    style={{
                      borderRadius: '13px'
                    }}
                    value={formattedAddress ?? address ?? ''}
                  />
                </Grid>
                <Typography sx={{ display: 'flex', my: '10px', width: '100%' }} variant='B-1'>
                  {t('Your {{chainName}} Address', { replace: { chainName } })}
                </Typography>
                <AddressComponent
                  address={formattedAddress ?? address}
                  chainName={chainName}
                  onCopy={onCopy}
                />
                <DecisionButtons
                  cancelButton
                  direction='vertical'
                  onPrimaryClick={onCopy}
                  onSecondaryClick={onDone}
                  primaryBtnText={t('Copy to clipboard')}
                  secondaryBtnText={t('Done')}
                  style={{ marginTop: '25px', width: '100%' }}
                />
              </Stack>
              <MySnackbar
                onClose={handleSnackbarClose}
                open={showSnackbar}
                text={t('{{chainName}} address copied!', { replace: { chainName } })}
              />
            </>
          }
        </Grid>
      </Grow>
    </DraggableModal>
  );
}

export default memo(Receive);
