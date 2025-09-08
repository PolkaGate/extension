// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Grid, Grow, Stack, styled, Typography } from '@mui/material';
import { DocumentCopy } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import { Address2, ChainLogo, DecisionButtons, GradientDivider, MySnackbar, SearchField } from '@polkadot/extension-polkagate/src/components/index';
import chains, { type NetworkInfo } from '@polkadot/extension-polkagate/src/util/chains';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { sanitizeChainName, toShortAddress } from '@polkadot/extension-polkagate/src/util/utils';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useSelectedAccount, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  address: string | undefined;
  onClose?: () => void;
  closePopup: ExtensionPopupCloser;
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
  setSelectedChain: React.Dispatch<React.SetStateAction<NetworkInfo | undefined>>;
}

function SelectChain ({ setSelectedChain }: SelectChainProp) {
  const { t } = useTranslation();
  const customSort = useCallback((itemA: NetworkInfo, itemB: NetworkInfo) => {
    const hasRelay = (str: string) => str.toLowerCase().includes('relay');

    return (Number(hasRelay(itemB.name)) - Number(hasRelay(itemA.name))) || itemA.name.localeCompare(itemB.name);
  }, []);

  const networks = useMemo(() => chains.sort(customSort), [customSort]);

  const [chainsToShow, setChainsToShow] = useState(networks);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setChainsToShow(networks);
    }

    keyword = keyword.trim().toLowerCase();
    const _filtered = networks.filter(({ name }) => name.toLowerCase().includes(keyword));

    setChainsToShow([..._filtered]);
  }, [networks]);

  const handleChainSelect = useCallback((chain: NetworkInfo) => () => {
    setSelectedChain(chain);
  }, [setSelectedChain]);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={t('🔍 Search networks')}
        />
      </Grid>
      <Grid container item sx={{ maxHeight: '395px', my: '10px', overflowY: 'auto' }}>
        {chainsToShow.map((chain, index) => {
          const chainName = chain.name;

          return (
            <React.Fragment key={index}>
              <ListItem container item key={index} onClick={handleChainSelect(chain)}>
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
      </Grid>
    </Grid>
  );
}

function AddressComponent ({ address, chainName, onCopy }: AddressComponentProp) {
  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '12px', p: '3px' }}>
      <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
        <ChainLogo chainName={chainName} size={18} />
        <Typography color='text.secondary' variant='B-4'>
          {toShortAddress(address, 12)}
        </Typography>
      </Grid>
      <Grid container item onClick={onCopy} sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '8px', cursor: 'pointer', p: '9px', width: 'fit-content' }}>
        <DocumentCopy color='#fff' size='17' variant='Bold' />
      </Grid>
    </Grid>
  );
}

function Receive ({ address, closePopup, onClose }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedChain, setSelectedChain] = useState<NetworkInfo | undefined>();

  const chainName = useMemo(() => selectedChain ? sanitizeChainName(selectedChain?.name)?.toLowerCase() : '', [selectedChain]);
  const chainLogo = useMemo(() => getLogo2(chainName), [chainName]);

  const formattedAddress = useMemo(() => {
    if (!selectedChain) {
      return address;
    }

    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, selectedChain.ss58Format);

    return formatted;
  }, [address, selectedChain]);

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
      setSelectedChain(undefined);
    } else {
      closePopup();
    }
  }, [onClose, selectedChain, closePopup]);

  const onDone = useCallback(() => {
    onClose && onClose();
    setSelectedChain(undefined);
    closePopup();
  }, [onClose, closePopup]);

  return (
    <DraggableModal
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
