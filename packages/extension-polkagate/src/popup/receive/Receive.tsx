// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0


import type { TransitionProps } from '@mui/material/transitions';
import type { Network } from '@polkadot/networks/types';

import { Avatar, Container, Dialog, Grid, Slide, styled, Typography } from '@mui/material';
import { ArrowCircleLeft, DocumentCopy, ScanBarcode } from 'iconsax-react';
import { QRCodeCanvas } from 'qrcode.react';
import React, { useCallback, useMemo, useState } from 'react';

import { selectableNetworks } from '@polkadot/networks';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { Motion, NeonButton, SearchField } from '../../components';
import CustomCloseSquare from '../../components/SVG/CustomCloseSquare';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { GradientDivider, RedGradient } from '../../style';
import getLogo from '../../util/getLogo';
import { sanitizeChainName } from '../../util/utils';
import MySnackbar from '../settings/extensionSettings/components/MySnackbar';

const Transition = React.forwardRef(function Transition(props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

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

const shortenAddress = (address: string, charactersCount = 4) => {
  if (!address) {
    return '';
  }

  if (address.length <= charactersCount * 2) {
    return address;
  }

  return `${address.slice(0, charactersCount)}...${address.slice(-charactersCount)}`;
};

interface AddressComponentProp {
  address: string;
  chain: Network;
}

function AddressComponent({ address, chain }: AddressComponentProp) {
  const { t } = useTranslation();

  const [showSnackbar, setShowSnackbar] = useState(false);

  const chainName = useMemo(() => chainNameSanitizer(chain.displayName), [chain.displayName]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(address).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [address]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);

  return (
    <Motion style={{ width: '100%' }}>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '12px', p: '3px' }}>
        <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
          <Avatar src={getLogo(chainName)} sx={{ borderRadius: '50%', height: 18, width: 18 }} variant='square' />
          <Typography color='text.secondary' variant='B-4'>
            {shortenAddress(address, 12)}
          </Typography>
        </Grid>
        <Grid container item onClick={onCopy} sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '8px', cursor: 'pointer', p: '9px', width: 'fit-content' }}>
          <DocumentCopy color='#fff' size='17' variant='Bold' />
        </Grid>
      </Grid>
      <MySnackbar
        onClose={handleSnackbarClose}
        open={showSnackbar}
        text={t("{{chainName}}'s address copied!", { replace: { chainName } })}
      />
    </Motion>
  );
}

interface SelectChainProp {
  setSelectedChain: React.Dispatch<React.SetStateAction<Network | undefined>>;
}

function SelectChain({ setSelectedChain }: SelectChainProp) {
  const { t } = useTranslation();

  const customSort = useCallback((itemA: Network, itemB: Network) => {
    const hasRelay = (str: string) => str.toLowerCase().includes('relay');

    return (Number(hasRelay(itemB.displayName)) - Number(hasRelay(itemA.displayName))) || itemA.displayName.localeCompare(itemB.displayName);
  }, []);

  const allNetworks = useMemo(() => selectableNetworks.sort(customSort), [customSort]);

  const [chainsToShow, setChainsToShow] = useState<Network[]>(allNetworks);

  const onSearch = useCallback((keyword: string) => {
    if (!keyword) {
      return setChainsToShow(allNetworks);
    }

    keyword = keyword.trim().toLowerCase();
    const _filtered = allNetworks.filter(({ displayName }) => displayName.toLowerCase().includes(keyword));

    setChainsToShow([..._filtered]);
  }, [allNetworks]);

  const handleChainSelect = useCallback((chain: Network) => () => {
    setSelectedChain(chain);
  }, [setSelectedChain]);

  return (
    <>
      <Grid container item justifyContent='center'>
        <Grid alignItems='center' columnGap='10px' container item justifyContent='center' p='10px'>
          <ScanBarcode color='#AA83DC' size='24' variant='Bold' />
          <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
            {t('Select chain')}
          </Typography>
        </Grid>
        <Grid container item>
          <SearchField
            onInputChange={onSearch}
            placeholder='🔍 Search Chain'
          />
        </Grid>
        <Grid container item sx={{ maxHeight: '395px', my: '10px', overflow: 'scroll' }}>
          {chainsToShow.map((chain, index) => (
            <>
              <ListItem container item key={index} onClick={handleChainSelect(chain)}>
                <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
                  <Grid alignItems='center' container item pl='10px' width='fit-content'>
                    <Avatar src={getLogo(chainNameSanitizer(chain.displayName))} sx={{ borderRadius: '50%', height: 18, width: 18 }} variant='square' />
                  </Grid>
                  <Typography color='text.primary' variant='B-2'>
                    {chain.displayName}
                  </Typography>
                </Grid>
              </ListItem>
              {index !== chainsToShow.length - 1 &&
                <GradientDivider style={{ my: '3px' }} />
              }
            </>
          ))}
        </Grid>
      </Grid>
    </>
  );
}

interface QrCodeProps {
  address: string;
  selectedChain: Network;
  setSelectedChain: React.Dispatch<React.SetStateAction<Network | undefined>>;
  onBackToAccount: () => void;
}

function QrCode({ address, onBackToAccount, selectedChain, setSelectedChain }: QrCodeProps) {
  const { t } = useTranslation();

  const formattedAddress = useMemo(() => {
    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, selectedChain.prefix);

    return formatted;
  }, [address, selectedChain.prefix]);

  const onBack = useCallback(() => setSelectedChain(undefined), [setSelectedChain]);

  return (
    <Grid container item justifyContent='center'>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '8px 6px' }}>
        <ArrowCircleLeft color='#FF4FB9' onClick={onBack} size='32' style={{ cursor: 'pointer' }} variant='Bulk' />
        <Grid alignItems='center' columnGap='10px' container item width='fit-content'>
          <Grid alignItems='center' container item pl='10px' width='fit-content'>
            <Avatar src={getLogo(chainNameSanitizer(selectedChain.displayName))} sx={{ borderRadius: '50%', height: 24, width: 24 }} variant='square' />
          </Grid>
          <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
            {chainNameSanitizer(selectedChain.displayName)}
          </Typography>
        </Grid>
        <ArrowCircleLeft color='#FF4FB9' size='24' style={{ visibility: 'hidden' }} variant={'Bulk'} />
      </Grid>
      <Grid container item pt='6px' px='16px'>
        <AddressComponent address={formattedAddress ?? address} chain={selectedChain} />
      </Grid>
      <Grid container item sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '17px', mb: '29px', mt: '25px', p: '4px', width: 'fit-content' }}>
        <QRCodeCanvas
          bgColor='#fff'
          fgColor='#000'
          includeMargin
          level='H'
          size={280}
          style={{
            borderRadius: '13px'
          }}
          value={formattedAddress ?? address}
        />
      </Grid>
      <NeonButton
        contentPlacement='center'
        onClick={onBackToAccount}
        style={{
          height: '44px',
          width: '320px'
        }}
        text={t('Back to Account')}
      />
    </Grid>
  );
}

interface Props {
  openPopup: boolean;
  setOpenPopup: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function Receive({ openPopup, setOpenPopup }: Props) {
  const selectedAddress = useSelectedAccount();

  const [selectedChain, setSelectedChain] = useState<Network | undefined>();

  const handleClose = useCallback(() => {
    setOpenPopup(false);
    setSelectedChain(undefined);
  }, [setOpenPopup]);

  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundImage: 'unset',
          bgcolor: 'transparent',
          boxShadow: 'unset'
        }
      }}
      TransitionComponent={Transition}
      componentsProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(10px)',
            background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
            bgcolor: 'transparent'
          }
        }
      }}
      fullScreen
      open={openPopup}
    >
      <Container disableGutters sx={{ height: '100%', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#1B133C', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'hidden', p: '10px', position: 'relative' }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            {!selectedChain &&
              <SelectChain
                setSelectedChain={setSelectedChain}
              />
            }
            {selectedChain && selectedAddress?.address &&
              <QrCode
                address={selectedAddress.address}
                onBackToAccount={handleClose}
                selectedChain={selectedChain}
                setSelectedChain={setSelectedChain}
              />
            }
          </div>
          <RedGradient style={{ top: '-140px' }} />
        </Grid>
      </Container>
    </Dialog>
  );
}
