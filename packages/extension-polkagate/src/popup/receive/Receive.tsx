// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { TransitionProps } from '@mui/material/transitions';
import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Container, Dialog, Grid, Slide, styled, Typography } from '@mui/material';
import { ArrowCircleLeft, DocumentCopy, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import chains, { type NetworkInfo } from '@polkadot/extension-polkagate/src/util/chains';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { ChainLogo, NeonButton, SearchField } from '../../components';
import MySnackbar from '../../components/MySnackbar';
import CustomCloseSquare from '../../components/SVG/CustomCloseSquare';
import { useSelectedAccount, useTranslation } from '../../hooks';
import { GradientDivider, RedGradient } from '../../style';
import { sanitizeChainName, toShortAddress } from '../../util/utils';

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
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

interface AddressComponentProp {
  address: string;
  chain: NetworkInfo;
}

function AddressComponent ({ address, chain }: AddressComponentProp) {
  const { t } = useTranslation();

  const [showSnackbar, setShowSnackbar] = useState(false);

  const chainName = useMemo(() => chainNameSanitizer(chain.name), [chain.name]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(address).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [address]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);

  return (
    <>
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
      <MySnackbar
        onClose={handleSnackbarClose}
        open={showSnackbar}
        text={t("{{chainName}}'s address copied!", { replace: { chainName } })}
      />
    </>
  );
}

interface SelectChainProp {
  setSelectedChain: React.Dispatch<React.SetStateAction<NetworkInfo | undefined>>;
}

function SelectNetwork ({ setSelectedChain }: SelectChainProp) {
  const { t } = useTranslation();

  const customSort = useCallback((itemA: NetworkInfo, itemB: NetworkInfo) => {
    const hasRelay = (str: string) => str.toLowerCase().includes('relay');

    return (Number(hasRelay(itemB.name)) - Number(hasRelay(itemA.name))) || itemA.name.localeCompare(itemB.name);
  }, []);

  const networks = useMemo(() => chains.sort(customSort), [customSort]);

  const [chainsToShow, setChainsToShow] = useState<NetworkInfo[]>(networks);

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
      <Grid alignItems='center' columnGap='10px' container item justifyContent='center' p='10px'>
        <ScanBarcode color='#AA83DC' size='24' variant='Bold' />
        <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
          {t('Select network')}
        </Typography>
      </Grid>
      <Grid container item>
        <SearchField
          focused
          onInputChange={onSearch}
          placeholder={t('🔍 Search networks')}
        />
      </Grid>
      <Grid container item sx={{ maxHeight: '395px', my: '10px', overflowY: 'auto' }}>
        {
          chainsToShow.map((chain, index) => {
            const chainName = chain.name;

            return (
              <React.Fragment key={index}>
                <ListItem container item onClick={handleChainSelect(chain)}>
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

interface QrCodeProps {
  address: string;
  selectedChain: NetworkInfo;
  setSelectedChain: React.Dispatch<React.SetStateAction<NetworkInfo | undefined>>;
  onBackToAccount: () => void;
}

function QrCode ({ address, onBackToAccount, selectedChain, setSelectedChain }: QrCodeProps) {
  const { t } = useTranslation();

  const formattedAddress = useMemo(() => {
    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, selectedChain.ss58Format);

    return formatted;
  }, [address, selectedChain.ss58Format]);

  const chainLogo = useMemo(() => {
    const chainName = sanitizeChainName(selectedChain?.name)?.toLowerCase();

    return getLogo2(chainName);
  }, [selectedChain?.name]);

  const onBack = useCallback(() => setSelectedChain(undefined), [setSelectedChain]);

  return (
    <Grid container item justifyContent='center'>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '8px 6px' }}>
        <ArrowCircleLeft color='#FF4FB9' onClick={onBack} size='32' style={{ cursor: 'pointer' }} variant='Bulk' />
        <Grid alignItems='center' columnGap='8px' container item width='fit-content'>
          <ChainLogo chainName={selectedChain.name} size={24} />
          <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
            {t('Your Address')}
          </Typography>
        </Grid>
        <ArrowCircleLeft color='#FF4FB9' size='24' style={{ visibility: 'hidden' }} variant={'Bulk'} />
      </Grid>
      <Grid container item pt='6px' px='16px'>
        <AddressComponent address={formattedAddress ?? address} chain={selectedChain} />
      </Grid>
      <Grid container item sx={{ background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', borderRadius: '17px', mb: '29px', mt: '25px', p: '4px', width: 'fit-content' }}>
        <QRCode
          bgColor='#fff'
          ecLevel='H'
          eyeColor={chainLogo?.color}
          fgColor='#000'
          logoImage={chainLogo?.logo}
          logoPadding={1}
          logoPaddingStyle='circle'
          qrStyle='dots'
          removeQrCodeBehindLogo={true}
          size={270}
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
        text={t('Back')}
      />
    </Grid>
  );
}

interface Props {
  openPopup: boolean;
  setOpenPopup: ExtensionPopupCloser;
}

/**
 * Popup component for receiving assets. Allows users to select a network and displays a QR code for the selected account address.
 *
 * Only has been used in extension mode!
 */
export default function Receive ({ openPopup, setOpenPopup }: Props) {
  const selectedAddress = useSelectedAccount();

  const [selectedChain, setSelectedChain] = useState<NetworkInfo | undefined>();

  const handleClose = useCallback(() => {
    setOpenPopup();
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
              <SelectNetwork
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
