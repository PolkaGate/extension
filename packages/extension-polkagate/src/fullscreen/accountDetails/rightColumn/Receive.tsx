// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Network } from '@polkadot/networks/types';

import { Grid, Stack, styled, Typography } from '@mui/material';
import { DocumentCopy } from 'iconsax-react';
import { QRCodeCanvas } from 'qrcode.react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { Address2, ChainLogo, DecisionButtons, GradientDivider, SearchField } from '@polkadot/extension-polkagate/src/components/index';
import MySnackbar from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/components/MySnackbar';
import { ExtensionPopups } from '@polkadot/extension-polkagate/src/util/constants';
import { sanitizeChainName, toShortAddress } from '@polkadot/extension-polkagate/src/util/utils';
import { decodeAddress, encodeAddress, selectableNetworks } from '@polkadot/util-crypto';

import { useSelectedAccount, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  address: string | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<ExtensionPopups>>;
}

interface AddressComponentProp {
  address: string | undefined;
  chainDisplayName: string | undefined;
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

const chainNameSanitizer = (text: string) => sanitizeChainName(text)?.toLowerCase();

interface SelectChainProp {
  setSelectedChain: React.Dispatch<React.SetStateAction<Network | undefined>>;
}

function SelectChain ({ setSelectedChain }: SelectChainProp) {
  const customSort = useCallback((itemA: Network, itemB: Network) => {
    const hasRelay = (str: string) => str.toLowerCase().includes('relay');

    return (Number(hasRelay(itemB.displayName)) - Number(hasRelay(itemA.displayName))) || itemA.displayName.localeCompare(itemB.displayName);
  }, []);

  const networks = useMemo(() => selectableNetworks.sort(customSort), [customSort]);

  const [chainsToShow, setChainsToShow] = useState<Network[]>(networks);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setChainsToShow(networks);
    }

    keyword = keyword.trim().toLowerCase();
    const _filtered = networks.filter(({ displayName }) => displayName.toLowerCase().includes(keyword));

    setChainsToShow([..._filtered]);
  }, [networks]);

  const handleChainSelect = useCallback((chain: Network) => () => {
    setSelectedChain(chain);
  }, [setSelectedChain]);

  return (
    <Grid container item justifyContent='center'>
      <Grid container item>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder='🔍 Search networks'
        />
      </Grid>
      <Grid container item sx={{ maxHeight: '395px', my: '10px', overflowY: 'auto' }}>
        {chainsToShow.map((chain, index) => {
          const chainName = chain.displayName;

          return (
            <>
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
            </>
          )})}
      </Grid>
    </Grid>
  );
}

function AddressComponent ({ address, chainDisplayName, onCopy }: AddressComponentProp) {
  const chainName = useMemo(() => sanitizeChainName(chainDisplayName)?.toLowerCase(), [chainDisplayName]);

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

function Receive ({ address, open, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedChain, setSelectedChain] = useState<Network | undefined>();

  const formattedAddress = useMemo(() => {
    if (!selectedChain) {
      return address;
    }

    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, selectedChain.prefix);

    return formatted;
  }, [address, selectedChain]);

  const onCopy = useCallback(() => {
    address && navigator.clipboard.writeText(address).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [address]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);
  const onClose = useCallback(() => {
    if (selectedChain) {
      setSelectedChain(undefined);
    } else {
      setOpen(ExtensionPopups.NONE);
    }
  }, [selectedChain, setOpen]);

  const onDone = useCallback(() => {
    setSelectedChain(undefined);
    setOpen(ExtensionPopups.NONE);
  }, [setOpen]);

  return (
    <DraggableModal
      onClose={onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={selectedChain ? t('Receive funds') : t('Select network')}
    >
      {!selectedChain
        ? <SelectChain setSelectedChain={setSelectedChain} />
        : <>
          <Stack direction='column' justifyItems='center' sx={{ display: 'block' }}>
            <Address2
              address={address}
              name={account?.name}
              style={{ marginTop: '10px' }}
            />
            <Grid container item sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '17px', mb: '29px', mt: '25px', p: '4px', width: 'fit-content' }}>
              <QRCodeCanvas
                bgColor='#fff'
                fgColor='#000'
                includeMargin
                level='H'
                size={200}
                style={{
                  borderRadius: '13px'
                }}
                value={formattedAddress ?? address ?? ''}
              />
            </Grid>
            <Typography sx={{ display: 'flex', my: '10px', width: '100%' }} variant='B-1'>
              {t('Your {{chainName}} Address', { replace: { chainName: selectedChain?.displayName } })}
            </Typography>
            <AddressComponent
              address={formattedAddress ?? address}
              chainDisplayName={selectedChain?.displayName}
              onCopy={onCopy}
            />
            <DecisionButtons
              cancelButton
              direction='vertical'
              isBusy={showSnackbar}
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
            text={t('{{chainName}} address copied!', { replace: { chainName: selectedChain?.displayName } })}
          />
        </>}
    </DraggableModal>
  );
}

export default memo(Receive);
