// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

//@ts-nocheck

import type { ItemInformation } from '@polkadot/extension-polkagate/fullscreen/nft/utils/types';

import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { text } from '../../assets/icons';
import { CopyAddressButton, Identity2 } from '../../components';
import { useTranslation } from '../../hooks';

function AccountRow({ address, genesisHash, label }: { label: string, address: string, genesisHash: string }): React.ReactElement {
  return (
    <Stack alignItems='center' direction='row' justifyContent='space-between' lineHeight='35px'>
      <Stack alignItems='baseline' columnGap='3px' direction='row'>
        <Typography color='#BEAAD8' textAlign='left' variant='B-1'>
          {label}
        </Typography>
        <CopyAddressButton address={address} padding={0} />
      </Stack>
      <Identity2
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

  return (
    <Grid container item sx={{ bgcolor: '#05091C', border: '4px solid #1B133C', borderRadius: '18px', m: '10px', p: '10px 15px' }}>
      {nft &&
        <Stack direction='column' width='100%'>
          <Stack alignItems='start' columnGap='15px' direction='row' sx={{ pt: '15px' }} width='100%'>
            <Box component='img' src={text as string} sx={{ mt: '10px' }} />
            <Typography color='#EAEBF1' sx={{ '> p': { m: 0 }, maxHeight: '258px', overflow: 'auto', width: '100%' }} textAlign='justify' variant='B-5'>
              <ReactMarkdown
                components={{
                  a: ({ _node, ...props }) => <a style={{ color: '#AA83DC' }} {...props} />
                }}
                linkTarget='_blank'
              >
                {String(nft.description)}
              </ReactMarkdown>
            </Typography>
          </Stack>
          <Divider
            orientation='horizontal' sx={{
              background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', my: '10px', width: '301px'
            }}
          />
          <Stack columnGap='10px' direction='column' width='100%'>
            {nft.creator && nft.genesisHash &&
              <>
                <AccountRow
                  address={nft.creator}
                  genesisHash={nft.genesisHash}
                  label={t('Creator')}
                />
                <Divider orientation='horizontal' sx={{ background: 'linear-gradient(90deg, rgba(210, 185, 241, 0.03) 0%, rgba(210, 185, 241, 0.15) 50.06%, rgba(210, 185, 241, 0.03) 100%)', height: '1px', width: '301px' }} />
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
