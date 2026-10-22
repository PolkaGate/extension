// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Avatar, Divider, Grid, Link, Stack, Typography } from '@mui/material';
import { Record } from 'iconsax-react';
import React, { memo, useCallback } from 'react';

import { GradientButton } from '@polkadot/extension-polkagate/src/components';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { useTranslation } from '../../hooks';

interface Props {
  chainName?: string;
  setOpen: ExtensionPopupCloser;
}

interface DappEntry {
  name: string;
  label: string;
  url: string;
  logo: string;
  poweredBy?: string;
}

interface Category {
  title: string;
  dapps: DappEntry[];
}

const CATEGORIES: Category[] = [
  {
    dapps: [
      {
        label: 'Subsquare',
        logo: 'https://raw.githubusercontent.com/OpenSquare-Network/subsquare/main/packages/next-common/public/imgs/icons/subsquare-rounded.svg',
        name: 'subsquare',
        poweredBy: 'OpenSquare',
        url: 'https://{chain}.subsquare.io/'
      }
    ],
    title: 'Governance'
  },
  {
    dapps: [
      {
        label: 'Hydration',
        logo: 'https://app.hydration.net/favicon.ico',
        name: 'hydration',
        poweredBy: 'Galactic Council',
        url: 'https://app.hydration.net/'
      },
      {
        label: 'Snowbridge',
        logo: 'https://app.snowbridge.network/favicon.ico',
        name: 'snowbridge',
        poweredBy: 'Snowfork',
        url: 'https://app.snowbridge.network/'
      },
      {
        label: 'Hyperbridge',
        logo: 'https://hyperbridge.network/favicon.ico',
        name: 'hyperbridge',
        poweredBy: 'Polytope Labs',
        url: 'https://hyperbridge.network/'
      }
    ],
    title: 'DeFi & Bridges'
  },
  {
    dapps: [
      {
        label: 'KodaDot',
        logo: 'https://kodadot.xyz/favicon.ico',
        name: 'kodadot',
        poweredBy: 'KodaDot',
        url: 'https://kodadot.xyz/'
      },
      {
        label: 'Unique Network',
        logo: 'https://unique.network/favicon.ico',
        name: 'unique',
        poweredBy: 'Unique Network',
        url: 'https://unique.network/'
      }
    ],
    title: 'NFTs & Marketplaces'
  },
  {
    dapps: [
      {
        label: 'Subscan',
        logo: 'https://polkadot.subscan.io/favicon.ico',
        name: 'subscan',
        poweredBy: 'Subscan',
        url: 'https://polkadot.subscan.io/'
      }
    ],
    title: 'Explorers'
  }
];

interface ItemProps {
  dapp: DappEntry;
  chainName?: string;
}

function DappItem({ chainName, dapp }: ItemProps): React.ReactElement {
  const resolvedUrl = dapp.url.replace('{chain}', chainName ?? 'polkadot');

  return (
    <Link href={resolvedUrl} rel='noreferrer' sx={{ bgcolor: 'background.default', borderRadius: '14px', mb: '6px', width: '100%' }} target='_blank' underline='none'>
      <Stack direction='column' sx={{ padding: '12px 16px', position: 'relative' }}>
        <Stack alignItems='center' columnGap='12px' direction='row'>
          <Avatar
            src={dapp.logo}
            sx={{ borderRadius: '8px', height: '36px', width: '36px' }}
            variant='square'
          />
          <Typography color='text.secondary' textTransform='capitalize' variant='H-3'>
            {dapp.label}
          </Typography>
        </Stack>
        {dapp.poweredBy &&
          <Typography color='primary.main' sx={{ bottom: '12px', position: 'absolute', right: '16px' }} textAlign='end' variant='S-2'>
            {`by ${dapp.poweredBy}`}
          </Typography>
        }
      </Stack>
    </Link>
  );
}

function ExplorerModal({ chainName, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onClose = useCallback(() => {
    setOpen();
  }, [setOpen]);

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 0' },
        showBackIconAsClose: true
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={onClose}
      open
      popupProps={{
        TitleIcon: Record,
        compactInSidePanel: true,
        iconSize: 24,
        iconVariant: 'Bulk',
        pt: 185
      }}
      title={t('Explore dApps')}
    >
      <Grid container sx={{ position: 'relative', zIndex: 1 }}>
        <Typography color='text.secondary' sx={{ m: '15px 0 20px', textAlign: 'center' }} variant='B-1'>
          {t('Select a dApp to continue')}
        </Typography>
        {CATEGORIES.map((category, idx) => (
          <Grid container item key={category.title} sx={{ mb: '4px', width: '100%' }}>
            <Typography color='text.primary' sx={{ mb: '6px', mt: idx === 0 ? 0 : '10px', opacity: 0.55, px: '2px' }} variant='S-2'>
              {t(category.title)}
            </Typography>
            {category.dapps.map((dapp) => (
              <DappItem chainName={chainName} dapp={dapp} key={dapp.name} />
            ))}
            {idx < CATEGORIES.length - 1 && <Divider sx={{ my: '4px', width: '100%' }} />}
          </Grid>
        ))}
        <GradientButton
          contentPlacement='center'
          onClick={onClose}
          style={{
            height: '44px',
            marginTop: '16px'
          }}
          text={t('Close')}
        />
      </Grid>
    </SharePopup>
  );
}

export default memo(ExplorerModal);
