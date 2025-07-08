// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Chain } from '@polkadot/extension-chains/types';

import { Avatar, Grid, Stack, Typography } from '@mui/material';
import { DocumentCopy } from 'iconsax-react';
import { QRCodeCanvas } from 'qrcode.react';
import React, { memo, useCallback, useMemo, useState } from 'react';

import { Address2, DecisionButtons } from '@polkadot/extension-polkagate/src/components/index';
import MySnackbar from '@polkadot/extension-polkagate/src/popup/settings/extensionSettings/components/MySnackbar';
import getLogo from '@polkadot/extension-polkagate/src/util/getLogo';
import { sanitizeChainName, toShortAddress } from '@polkadot/extension-polkagate/src/util/utils';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

import { useChainInfo, useSelectedAccount, useTranslation } from '../../../hooks';
import { DraggableModal } from '../../components/DraggableModal';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AddressComponentProp {
  address: string | undefined;
  chain: Chain | null | undefined;
  onCopy: () => void;
}

function AddressComponent({ address, chain, onCopy }: AddressComponentProp) {
  const chainName = useMemo(() => sanitizeChainName(chain?.name)?.toLowerCase(), [chain]);

  return (
    <Grid alignItems='center' container item justifyContent='space-between' sx={{ bgcolor: '#1B133C', border: '1px solid', borderColor: '#BEAAD833', borderRadius: '12px', p: '3px' }}>
      <Grid alignItems='center' columnGap='8px' container item pl='10px' width='fit-content'>
        <Avatar src={getLogo(chainName)} sx={{ borderRadius: '50%', height: 18, width: 18 }} variant='square' />
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

function Receive({ address, genesisHash, open, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { chain } = useChainInfo(genesisHash, true);
  const account = useSelectedAccount();

  const [showSnackbar, setShowSnackbar] = useState(false);

  const formattedAddress = useMemo(() => {
    if (!chain) {
      return address;
    }

    const publicKey = decodeAddress(address);
    const formatted = encodeAddress(publicKey, chain.ss58Format);

    return formatted;
  }, [address, chain]);

  const onCopy = useCallback(() => {
    address && navigator.clipboard.writeText(address).catch((err) => console.error('Error copying text: ', err));
    setShowSnackbar(true);
  }, [address]);

  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);
  const onClose = useCallback(() => setOpen(false), [setOpen]);

  return (
    <DraggableModal
      onClose={onClose}
      open={open}
      showBackIconAsClose
      style={{ minHeight: '400px', padding: '20px' }}
      title={t('Receive funds')}
    >
      <>
        <Stack direction='column' justifyItems='center' sx={{ display: 'block'}}>
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
            {t('Your {{chainName}} Address', { replace: { chainName: chain?.name } })}
          </Typography>
          <AddressComponent
            address={formattedAddress ?? address}
            chain={chain}
            onCopy={onCopy}
          />
          <DecisionButtons
            cancelButton
            direction='vertical'
            // isBusy={isBusy}
            onPrimaryClick={onCopy}
            onSecondaryClick={() => setOpen(false)}
            primaryBtnText={t('Copy to clipboard')}
            secondaryBtnText={t('Done')}
            style={{ marginTop: '25px', width: '100%' }}
          />
        </Stack>
        <MySnackbar
          onClose={handleSnackbarClose}
          open={showSnackbar}
          text={t('{{chainName}} address copied!', { replace: { chainName: chain?.name } })}
        />
      </>
    </DraggableModal>
  );
}

export default memo(Receive);
