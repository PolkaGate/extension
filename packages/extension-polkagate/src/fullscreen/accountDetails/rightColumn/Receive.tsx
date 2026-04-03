// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';
import type { DropdownOption } from '@polkadot/extension-polkagate/util/types';

import { Grid, Grow, Stack, Typography } from '@mui/material';
import { DocumentCopy } from 'iconsax-react';
import React, { memo, useCallback, useMemo, useState } from 'react';
import { QRCode } from 'react-qrcode-logo';

import { Address2, DecisionButtons, Logo, MySnackbar } from '@polkadot/extension-polkagate/src/components/index';
import useIsHovered from '@polkadot/extension-polkagate/src/hooks/useIsHovered2';
import { sanitizeChainName, toShortAddress } from '@polkadot/extension-polkagate/src/util';
import resolveLogoInfo from '@polkadot/extension-polkagate/src/util/logo/resolveLogoInfo';
import { isEthereumAddress } from '@polkadot/util-crypto';

import { useFormatted, useGenesisHashOptions, useSelectedAccount, useTranslation } from '../../../hooks';
import ChainPickerList from '../../components/ChainPickerList';
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

function AddressComponent({ address, chainName, onCopy }: AddressComponentProp) {
  const { isHovered, ref } = useIsHovered();

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '12px', p: '3px' }}>
      <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
        <Logo chainName={chainName} size={18} />
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

function Receive({ address, closePopup, onClose, setAddress }: Props): React.ReactElement {
  const { t } = useTranslation();
  const account = useSelectedAccount();
  const allChains = useGenesisHashOptions({ isEthereum: isEthereumAddress(address || ''), withRelay: false });

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [selectedChain, setSelectedChain] = useState<DropdownOption | undefined>();

  const formattedAddress = useFormatted(address, selectedChain?.value as string | undefined);
  const chainName = useMemo(() => selectedChain ? sanitizeChainName(selectedChain?.text)?.toLowerCase() : '', [selectedChain]);
  const chainLogo = useMemo(() => resolveLogoInfo(chainName), [chainName]);

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
            ? (<ChainPickerList
              nothingFoundStyle={{ paddingBottom: '60px' }}
              onSelect={setSelectedChain}
              options={allChains}
              searchPlaceholder={t('🔍 Search networks')}
            />)
            : (<>
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
            </>)
          }
        </Grid>
      </Grow>
    </DraggableModal>
  );
}

export default memo(Receive);
