// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { ExpandMore } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { ChainLogo } from '../../../components';
import { useMetadata, useTranslation } from '../../../hooks';
import ChainListModal from '../../components/ChainListModal';

interface Props {
  destinationOptions?: DropdownOption[];
  genesisHash: string | undefined;
  setGenesisHash?: React.Dispatch<React.SetStateAction<string | undefined>>
  style?: React.CSSProperties;
}

export default function SelectYourChain ({ destinationOptions, genesisHash, setGenesisHash, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const metaDataChain = useMetadata(genesisHash, true);

  const [openChainList, setOpenChainList] = useState<boolean>(false);

  const onToggleChainSelection = useCallback(() => {
    setOpenChainList(!openChainList);
  }, [openChainList, setOpenChainList]);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between' mt='15px' sx={{ ...style }} width='230px'>
        <Stack alignItems='center' direction='row' justifyContent='start' width='80%'>
          <ChainLogo genesisHash={genesisHash} size={36} />
          <Stack alignItems='center' direction='column' justifyContent='start' ml='7px' width='100%'>
            <Typography color='#AA83DC' sx={{ textAlign: 'left', width: '100%' }} variant='B-4'>
              {t('Chain')}
            </Typography>
            <Typography sx={{ textAlign: 'left', width: '100%' }} variant='B-2'>
              {metaDataChain?.name || t('Unknown chain')}
            </Typography>
          </Stack>
        </Stack>
        <Box onClick={onToggleChainSelection} sx={{ '&:hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', cursor: 'pointer' }, alignItems: 'center', border: '2px solid #1B133C', borderRadius: '10px', transition: 'all 250ms ease-out', display: 'flex', height: '40px', justifyContent: 'center', width: '40px' }}>
          <ExpandMore sx={{ color: '#AA83DC', fontSize: '20px' }} />
        </Box>
      </Stack>
      {openChainList &&
        <ChainListModal
          externalOptions={destinationOptions}
          handleClose={onToggleChainSelection}
          open={openChainList}
          setGenesisHash={setGenesisHash}
        />
      }</>

  );
}
