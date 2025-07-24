// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { DropdownOption } from '@polkadot/extension-polkagate/src/util/types';

import { ExpandMore } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';

import { ChainLogo } from '../../../components';
import { useTranslation } from '../../../hooks';
import ChainListModal from '../../components/ChainListModal';

interface Props {
  destinationOptions?: DropdownOption[];
  chainName: string | undefined;
  withTitle?: boolean;
  setSelectedChain?: React.Dispatch<React.SetStateAction<DropdownOption>>;
  style?: React.CSSProperties;
}

export default function SelectYourChain ({ chainName, destinationOptions, setSelectedChain, style = {}, withTitle = true }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [openChainList, setOpenChainList] = useState<boolean>(false);

  const onChainSelection = useCallback(() => {
    setOpenChainList(true);
  }, [setOpenChainList]);

  const onClose = useCallback(() => {
    setOpenChainList(false);
  }, [setOpenChainList]);

  return (
    <>
      <Stack alignItems='center' direction='row' justifyContent='space-between' mt='15px' onClick={onChainSelection} sx={{ cursor: 'pointer', ...style }} width='230px'>
        <Stack alignItems='center' direction='row' justifyContent='start' width='80%'>
          <ChainLogo chainName={chainName} size={36} />
          <Stack alignItems='center' direction='column' justifyContent='start' ml='7px' width='100%'>
            {
              withTitle &&
              <Typography color='#AA83DC' sx={{ textAlign: 'left', width: '100%' }} variant='B-4'>
                {t('Network')}
              </Typography>
            }
            <Typography sx={{ textAlign: 'left', width: '100%' }} variant='B-2'>
              {toTitleCase(chainName) || t('Unknown network')}
            </Typography>
          </Stack>
        </Stack>
        <Box sx={{ '&:hover': { background: 'linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%)', cursor: 'pointer' }, alignItems: 'center', border: '2px solid #1B133C', borderRadius: '10px', transition: 'all 250ms ease-out', display: 'flex', height: '40px', justifyContent: 'center', width: '40px' }}>
          <ExpandMore sx={{ color: '#AA83DC', fontSize: '20px' }} />
        </Box>
      </Stack>
      {openChainList &&
        <ChainListModal
          externalOptions={destinationOptions}
          handleClose={onClose}
          open={openChainList}
          setSelectedChain={setSelectedChain}
        />
      }
    </>
  );
}
