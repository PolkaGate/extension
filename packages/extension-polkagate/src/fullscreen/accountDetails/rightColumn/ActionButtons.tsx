// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, MedalStar, Triangle } from 'iconsax-react';
import React, { memo, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import VelvetBox from '@polkadot/extension-polkagate/src/style/VelvetBox';
import { ExtensionPopups, GOVERNANCE_CHAINS, STAKING_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';

import { useTranslation } from '../../../hooks';
import Receive from './Receive';

interface ActionBoxProps {
  Icon: Icon;
  label: string;
  path?: string;
  onClick?: () => void;
}

function ActionBox ({ Icon, label, onClick, path }: ActionBoxProps): React.ReactElement {
  const navigate = useNavigate();

  const _onClick = useCallback(async () => {
    onClick
      ? onClick()
      : path && await navigate(path);
  }, [navigate, onClick, path]);

  return (
    <Stack direction='column' justifyContent='start' onClick={_onClick} rowGap='7px' sx={{ '&:hover': { bgcolor: '#2D1E4A', transform: 'translateY(-4px)' }, bgcolor: '#05091C', borderRadius: '14px', cursor: 'pointer', height: '100%', minWidth: '90px', px: '10px', transition: 'all 250ms ease-out', width: '100%' }}>
      <Icon color='#AA83DC' size='24' style={{ marginTop: '20px' }} variant='Bulk' />
      <Typography sx={{ display: 'flex', fontWeight: 700, width: '100%' }} variant='B-2'>
        {label}
      </Typography>
    </Stack>
  );
}

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  assetId: string | undefined;
}

function ActionButtons ({ address, assetId, genesisHash }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [open, setOpen] = useState(ExtensionPopups.NONE);

  const onClick = useCallback(() => setOpen(ExtensionPopups.RECEIVE), []);

  return (
    <>
      <VelvetBox style={{ margin: '10px 15px 0', width: 'auto' }}>
        <Stack columnGap='5px' direction='row' sx={{ height: '86px', width: '100%' }}>
          <ActionBox
            Icon={ArrowCircleRight2}
            label={t('Send')}
            path={`/send/${address}/${genesisHash}/${assetId}`}
          />
          <ActionBox
            Icon={ArrowCircleDown2}
            label={t('Receive')}
            onClick={onClick}
          />
          {GOVERNANCE_CHAINS.includes(genesisHash ?? '') &&
            <ActionBox
              Icon={MedalStar}
              label={t('Governance')}
              path={`/governance/${address}/referenda`}
            />}
          {STAKING_CHAINS.includes(genesisHash ?? '') &&
            <ActionBox
              Icon={BuyCrypto}
              label={t('Staking')}
              path={`/stake/${address}`}
            />}
          <ActionBox
            Icon={Triangle}
            label={t('NFT album')}
            path={`/nft/${address}`}
          />
        </Stack>
      </VelvetBox>
      {
        open === ExtensionPopups.RECEIVE &&
        <Receive
          address={address}
          open={open === ExtensionPopups.RECEIVE}
          setOpen={setOpen}
        />}
    </>
  );
}

export default memo(ActionButtons);
