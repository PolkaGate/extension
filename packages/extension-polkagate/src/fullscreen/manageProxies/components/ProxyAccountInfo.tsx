// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ProxyItem } from '../../../util/types';

import { Grid, Stack, type SxProps, type Theme, Typography } from '@mui/material';
import { POLKADOT_GENESIS } from '@polkagate/apps-config';
import React, { useCallback, useEffect, useState } from 'react';

import useAccountSelectedChain from '@polkadot/extension-polkagate/src/hooks/useAccountSelectedChain';
import PolkaGateIdenticon from '@polkadot/extension-polkagate/src/style/PolkaGateIdenticon';
import { toTitleCase } from '@polkadot/extension-polkagate/src/util/string';
import { toShortAddress } from '@polkadot/extension-polkagate/src/util/utils';

import { GlowCheckbox, Identity2 } from '../../../components';
import { useTranslation } from '../../../components/translate';

interface Props {
  handleDelete: (proxyItem: ProxyItem) => void;
  showCheck?: boolean;
  proxyItem: ProxyItem;
  style?: SxProps<Theme>;
}

function Info ({ label, value }: { label: string; value: string; }): React.ReactElement {
  return (
    <Stack columnGap='5px' direction='row' sx={{ bgcolor: '#C6AECC26', borderRadius: '9px', lineHeight: '24px', px: '5px' }}>
      <Typography color='#AA83DC' variant='B-1'>
        {label}:
      </Typography>
      <Typography color='#BEAAD8' variant='B-1'>
        {value}
      </Typography>
    </Stack>
  );
}

export default function ProxyAccountInfo ({ handleDelete, proxyItem, showCheck = true, style = {} }: Props): React.ReactElement {
  const { t } = useTranslation();
  const genesisHash = useAccountSelectedChain(proxyItem.proxy.delegate);

  const [selected, setSelected] = useState(proxyItem.status === 'remove');

  useEffect(() => {
      setSelected(proxyItem.status === 'remove');
  }, [proxyItem.status]);

  const handleCheck = useCallback((checked: boolean) => {
    handleDelete(proxyItem);
    setSelected(checked);
  }, [handleDelete, proxyItem]);

  return (
    <Grid
      alignItems='center' columnGap='15px' container item sx={{
        background: selected
          ? 'linear-gradient(#05091C, #05091C) padding-box, linear-gradient(262.56deg, #6E00B1 0%, #DC45A0 45%, #6E00B1 100%) border-box'
          : '#05091C',
        bgcolor: '#05091C',
        border: selected ? '2px solid transparent' : '1px solid #2D1E4A',
        borderRadius: '14px',
        flexWrap: 'nowrap',
        height: '90px',
        maxWidth: '423px',
        minWidth: '379px',
        p: '0 5px 0 20px',
        position: 'relative',
        width: 'fit-content',
        ...style
      }}
    >
      <PolkaGateIdenticon
        address={proxyItem.proxy.delegate}
        size={36}
      />
      <Stack direction='column' rowGap='4px'>
        <Stack alignItems='center' columnGap='8px' direction='row'>
          <Identity2
            address={proxyItem.proxy.delegate}
            genesisHash={genesisHash ?? POLKADOT_GENESIS}
            noIdenticon
            style={{ color: '#EAEBF1', maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', variant: 'B-1' }}
          />
          <Typography color='#82FFA5' sx={{ bgcolor: '#82FFA526', borderRadius: '7px', px: '4px' }} variant='B-5'>
            {proxyItem.proxy.delay * 6} sec
          </Typography>
        </Stack>
        <Stack columnGap='5px' direction='row'>
          <Info
            label={t('Type')}
            value={toTitleCase(proxyItem.proxy.proxyType) ?? ''}
          />
          <Info
            label={t('Address')}
            value={toShortAddress(proxyItem.proxy.delegate, 4)}
          />
        </Stack>
      </Stack>
      {
        showCheck &&
        <GlowCheckbox
          changeState={handleCheck}
          checked={selected}
          style={{ left: '350px', position: 'absolute', top: '8px' }}
        />
      }
    </Grid>
  );
}
