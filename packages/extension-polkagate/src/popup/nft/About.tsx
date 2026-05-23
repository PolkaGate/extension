// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { text } from '../../assets/icons';
import { CopyAddressButton, Identity } from '../../components';
import { useIsDark, useTranslation } from '../../hooks';

function Line({ my }: { my?: string }): React.ReactElement {
  const isDark = useIsDark();

  return (
    <Divider
      orientation='horizontal'
      sx={{
        background: isDark ? 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)' : 'linear-gradient(90deg, rgba(221, 227, 244, 0) 0%, #DDE3F4 50.06%, rgba(221, 227, 244, 0) 100%)',
        height: '1px',
        my,
        width: '301px'
      }}
    />
  );
}

function AccountRow({ address, genesisHash, label }: { label: string, address: string, genesisHash: string }): React.ReactElement {
  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' lineHeight='35px'>
      <Stack alignItems='baseline' columnGap='3px' direction='row'>
        <Typography color='accent.text' textAlign='left' variant='B-1'>
          {label}
        </Typography>
        <CopyAddressButton address={address} padding={0} />
      </Stack>
      <Identity
        address={address}
        genesisHash={genesisHash}
        identiconSize={14}
        showShortAddress
        style={{ lineHeight: '35px', variant: 'B-1' }}
      />
    </Stack>
  );
}

export default function About({ nft }: { nft: ItemInformation | undefined }): React.ReactElement {
  const { t } = useTranslation();
  const isDark = useIsDark();

  return (
    <Grid container item sx={{ bgcolor: isDark ? '#05091C' : '#FFFFFF', border: isDark ? '4px solid #1B133C' : '1px solid #DDE3F4', borderRadius: '18px', boxShadow: isDark ? 'none' : '0 10px 22px rgba(133, 140, 176, 0.14)', m: '10px', p: '10px 15px' }}>
      {nft &&
        <Stack direction='column' width='100%'>
          <Stack alignItems='start' columnGap='15px' direction='row' sx={{ pt: '15px' }} width='100%'>
            <Box component='img' src={text as string} sx={{ mt: '10px' }} />
            <Typography color={isDark ? '#EAEBF1' : '#745D8B'} sx={{ '> p': { m: 0 }, maxHeight: '258px', overflow: 'auto', width: '100%' }} textAlign='justify' variant='B-5'>
              <ReactMarkdown
                components={{
                  a: ({ node: _node, ...props }) => <a style={{ color: isDark ? '#AA83DC' : '#674394' }} {...props} />
                }}
                linkTarget='_blank'
              >
                {String(nft.description)}
              </ReactMarkdown>
            </Typography>
          </Stack>
          <Line my='10px' />
          <Stack columnGap='10px' direction='column' width='100%'>
            {nft.creator && nft.genesisHash &&
              <>
                <AccountRow
                  address={nft.creator}
                  genesisHash={nft.genesisHash}
                  label={t('Creator')}
                />
                <Line />
              </>
            }
            {nft.owner && nft.genesisHash &&
              <AccountRow
                address={nft.owner}
                genesisHash={nft.genesisHash}
                label={t('Owner')}
              />
            }
          </Stack>
        </Stack>
      }
    </Grid>
  );
}
