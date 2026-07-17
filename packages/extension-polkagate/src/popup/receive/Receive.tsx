// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';
import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Grid, styled, Typography, useTheme } from '@mui/material';
import { ArrowCircleLeft, DocumentCopy, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { NothingFound } from '@polkadot/extension-polkagate/src/partials';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { ExtensionPopup, FadeOnScroll, Logo, NeonButton, SearchField } from '../../components';
import MySnackbar from '../../components/MySnackbar';
import { useFormatted, useGenesisHashOptions, useIsDark, useIsSidePanel, useSelectedAccount, useTranslation } from '../../hooks';
import { GradientDivider } from '../../style';
import { sanitizeChainName, toShortAddress } from '../../util';
import BackButton from '../accountsLists/BackButton';

const ListItem = styled(Grid)<{ isdark: boolean }>(({ isdark }) => ({
  '&:hover': {
    backgroundColor: isdark ? '#6743944D' : '#EEF2FB'
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
  chain: DropdownOption;
}

function AddressComponent({ address, chain }: AddressComponentProp) {
  const { t } = useTranslation();
  const theme = useTheme();
  const isDark = useIsDark();
  const { isHovered, ref } = useIsHovered();
  const [showSnackbar, setShowSnackbar] = useState(false);

  const chainName = useMemo(() => chainNameSanitizer(chain.text), [chain.text]);

  const onCopy = useCallback(() => {
    navigator.clipboard.writeText(address).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [address]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);

  return (
    <>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: isDark ? '#1B133C' : '#FFFFFF', border: '1px solid', borderColor: isDark ? '#BEAAD833' : '#DDE3F4', borderRadius: '12px', p: '3px' }}>
        <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
          <Logo chainName={chainName} size={18} />
          <Typography color='text.secondary' variant='B-4'>
            {toShortAddress(address, 12)}
          </Typography>
        </Grid>
        <Grid container item onClick={onCopy} ref={ref} sx={{ background: theme.palette.gradient.brand, borderRadius: '8px', cursor: 'pointer', p: '9px', width: 'fit-content' }}>
          <DocumentCopy color='#fff' size='17' variant={isHovered ? 'Bulk' : 'Bold'} />
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
  setSelectedChain: React.Dispatch<React.SetStateAction<DropdownOption | undefined>>;
  isEthereum: boolean;
}

function SelectNetwork({ isEthereum, setSelectedChain }: SelectChainProp) {
  const { t } = useTranslation();
  const isDark = useIsDark();
  const isSidePanel = useIsSidePanel();
  const networks = useGenesisHashOptions({ isEthereum, withRelay: false });
  const refContainer = useRef<HTMLDivElement>(null);

  const [keyword, setKeyword] = useState<string>();

  const chainsToShow = useMemo(() => {
    if (!keyword) {
      return networks;
    }

    return networks.filter(({ text }) => text.toLowerCase().includes(keyword));
  }, [keyword, networks]);

  const onSearch = useCallback((keyword: string | undefined) => {
    setKeyword(keyword?.trim()?.toLowerCase());
  }, []);

  const handleChainSelect = useCallback((chain: DropdownOption) => () => {
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
      <Grid container item ref={refContainer} sx={{ display: 'block', maxHeight: isSidePanel ? 'calc(100vh - 211px)' : '395px', minHeight: isSidePanel ? 0 : '395px', my: '10px', overflowY: 'auto', pb: isSidePanel ? '70px' : undefined }}>
        {
          chainsToShow.map((chain, index) => {
            const chainName = chain.text;

            return (
              <React.Fragment key={index}>
                <ListItem container isdark={isDark} item onClick={handleChainSelect(chain)}>
                  <Grid alignItems='center' container item sx={{ columnGap: '10px', width: 'fit-content' }}>
                    <Logo chainName={chainName} size={24} />
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
          style={{ pb: '125px' }}
          text={t('Network Not Found')}
        />
      </Grid>
      <FadeOnScroll containerRef={refContainer} height='80px' ratio={0.55} />
    </Grid>
  );
}

interface QrCodeProps {
  address: string;
  selectedChain: DropdownOption;
  setSelectedChain: React.Dispatch<React.SetStateAction<DropdownOption | undefined>>;
  onBackToAccount: () => void;
}

function QrCode({ address, onBackToAccount, selectedChain, setSelectedChain }: QrCodeProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const formattedAddress = useFormatted(address, selectedChain?.value as string);

  const chainLogo = useMemo(() => {
    const chainName = sanitizeChainName(selectedChain?.text)?.toLowerCase();

    return resolveLogoInfo(chainName);
  }, [selectedChain?.text]);

  const onBack = useCallback(() => setSelectedChain(undefined), [setSelectedChain]);

  return (
    <Grid container item justifyContent='center'>
      <Grid alignItems='center' container item justifyContent='space-between' sx={{ p: '8px 6px' }}>
        <BackButton
          onClick={onBack}
        />
        <Grid alignItems='center' columnGap='8px' container item width='fit-content'>
          <Logo chainName={selectedChain.text} size={24} />
          <Typography color='text.primary' textTransform='uppercase' variant='H-3'>
            {t('Your Address')}
          </Typography>
        </Grid>
        <ArrowCircleLeft color='#FF4FB9' size='24' style={{ visibility: 'hidden' }} variant={'Bulk'} />
      </Grid>
      <Grid container item pt='6px' px='16px'>
        <AddressComponent address={formattedAddress ?? address} chain={selectedChain} />
      </Grid>
      <Grid container item sx={{ background: theme.palette.gradient.brand, borderRadius: '17px', mb: '29px', mt: '25px', p: '4px', width: 'fit-content' }}>
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
        text={t('Done')}
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
export default function Receive({ openPopup, setOpenPopup }: Props) {
  const selectedAddress = useSelectedAccount();

  const [selectedChain, setSelectedChain] = useState<DropdownOption | undefined>();

  const handleClose = useCallback(() => {
    setOpenPopup();
    setSelectedChain(undefined);
  }, [setOpenPopup]);

  return (
    <ExtensionPopup
      compactInSidePanel={!!selectedChain}
      handleClose={handleClose}
      maxHeight='100%'
      openMenu={openPopup}
      withoutTopBorder
    >
      {!selectedChain &&
        <SelectNetwork
          isEthereum={isEthereumAddress(selectedAddress?.address || '')}
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
    </ExtensionPopup>
  );
}
