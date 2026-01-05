// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

// @ts-ignore
import type { SpStakingIndividualExposure } from '@polkadot/types/lookup';

import { Container, Stack, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useMemo, useRef } from 'react';

import { DisplayBalance, FadeOnScroll } from '../../../components';
import { useChainInfo, useTranslation } from '../../../hooks';
import { GradientDivider, PolkaGateIdenticon } from '../../../style';
import { isHexToBn, toShortAddress } from '../../../util';

interface AccountItemProps {
  account: SpStakingIndividualExposure;
  decimal: number | undefined;
  token: string | undefined;
  totalStaked: string;
  withDivider: boolean;
}

const TableItem = ({ account, decimal, token, totalStaked, withDivider }: AccountItemProps) => {
  const theme = useTheme();

  const percentage = useMemo(() => {
    const totalAsBN = isHexToBn(totalStaked);
    const myStakedAsBN = isHexToBn(account.value.toString());

    return Number(myStakedAsBN.muln(100).div(totalAsBN)).toFixed(2);
  }, [account.value, totalStaked]);

  return (
    <>
      <Container disableGutters sx={{ alignItems: 'center', columnGap: '4px', display: 'flex', flexDirection: 'row' }}>
        <Container disableGutters sx={{ alignItems: 'center', columnGap: '6px', display: 'flex', flexDirection: 'row', m: 0, maxWidth: '45%', width: '45%' }}>
          <PolkaGateIdenticon
            address={account.who.toString()}
            size={18}
          />
          <Typography color='text.primary' variant='B-4'>
            {toShortAddress(account.who.toString())}
          </Typography>
        </Container>
        <DisplayBalance
          balance={account.value}
          decimal={decimal}
          decimalPoint={2}
          style={{
            color: theme.palette.text.primary,
            fontFamily: 'Inter',
            fontSize: '12px',
            fontWeight: 500,
            maxWidth: '35%',
            textAlign: 'left',
            width: '35%'
          }}
          token={token}
        />
        <Typography color='text.primary' sx={{ textAlign: 'right', width: '15%' }} variant='B-4'>
          {percentage}%
        </Typography>
      </Container>
      {withDivider && <GradientDivider style={{ my: '8px' }} />}
    </>
  );
};

interface AccountsTableProps {
  accounts: SpStakingIndividualExposure[];
  genesisHash: string;
  totalStaked: string;
  style?: SxProps<Theme>;
  tableMaxHeight?: string;
}

export default function AccountsTable({ accounts, genesisHash, style, tableMaxHeight, totalStaked }: AccountsTableProps) {
  const { t } = useTranslation();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const refContainer = useRef(null);

  if (!accounts || accounts.length === 0) {
    return <></>;
  }

  return (
    <Stack direction='column' sx={{ maxHeight: '260px', pb: '20px', ...style }}>
      <Container disableGutters sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', mb: '12px', width: '100%' }}>
        <Typography color='text.highlight' sx={{ letterSpacing: '1px', maxWidth: '45%', textAlign: 'left', textTransform: 'uppercase', width: '45%' }} variant='S-1'>
          {t('Accounts')}
        </Typography>
        <Typography color='text.highlight' sx={{ letterSpacing: '1px', maxWidth: '35%', textAlign: 'left', textTransform: 'uppercase', width: '35%' }} variant='S-1'>
          {t('Staked')}
        </Typography>
        <Typography color='text.highlight' sx={{ letterSpacing: '1px', maxWidth: '20%', textAlign: 'left', textTransform: 'uppercase', width: '20%' }} variant='S-1'>
          {t('Percent')}
        </Typography>
      </Container>
      <Stack direction='column' ref={refContainer} sx={{ height: 'fit-content', maxHeight: tableMaxHeight ?? '300px', overflowY: 'auto', width: '100%' }}>
        {accounts.map((account, index) => (
          <TableItem
            account={account}
            decimal={decimal}
            key={index}
            token={token}
            totalStaked={totalStaked}
            withDivider={index + 1 < accounts.length}
          />
        ))}
      </Stack>
      <FadeOnScroll containerRef={refContainer} height='50px' ratio={0.3} />
    </Stack>
  );
}
