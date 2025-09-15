// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';

import { Stack, Typography } from '@mui/material';
import { ArrowCircleDown2, ArrowCircleRight2, BuyCrypto, Record, Triangle } from 'iconsax-react';
import React, { memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import VelvetBox from '@polkadot/extension-polkagate/src/style/VelvetBox';
import { ExtensionPopups, GOVERNANCE_CHAINS } from '@polkadot/extension-polkagate/src/util/constants';
import { useExtensionPopups } from '@polkadot/extension-polkagate/src/util/handleExtensionPopup';
import { isStakingChain } from '@polkadot/extension-polkagate/src/util/migrateHubUtils';

import { useChainInfo, useStakingPositions, useTranslation } from '../../../hooks';
import GovernanceModal from '../../components/GovernanceModal';
import Receive from './Receive';

interface ActionBoxProps {
  Icon: Icon;
  label: string;
  path?: string;
  onClick?: () => void;
}

function ActionBox ({ Icon, label, onClick, path }: ActionBoxProps): React.ReactElement {
  const navigate = useNavigate();

  const _onClick = useCallback(() => {
    onClick
      ? onClick()
      : path && navigate(path) as void;
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
  const { chainName } = useChainInfo(genesisHash);
  const { maxPosition, maxPositionType } = useStakingPositions(address, true);
  const { extensionPopup, extensionPopupCloser, extensionPopupOpener } = useExtensionPopups();

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
            onClick={extensionPopupOpener(ExtensionPopups.RECEIVE)}
          />
          {GOVERNANCE_CHAINS.includes(chainName?.toLocaleLowerCase() ?? '') &&
            <ActionBox
              Icon={Record}
              label={t('Governance')}
              onClick={extensionPopupOpener(ExtensionPopups.GOVERNANCE)}
            />}
          {isStakingChain(genesisHash) &&
            <ActionBox
              Icon={BuyCrypto}
              label={t('Staking')}
              path={`/fullscreen-stake/${maxPositionType ?? 'solo'}/${address}/${maxPosition?.genesisHash ?? genesisHash}`}
            />}
          <ActionBox
            Icon={Triangle}
            label={t('NFT Album')}
            path={`/nft/${address}`}
          />
        </Stack>
      </VelvetBox>
      {extensionPopup === ExtensionPopups.RECEIVE &&
        <Receive
          address={address}
          closePopup={extensionPopupCloser}
        />}
      {extensionPopup === ExtensionPopups.GOVERNANCE &&
        <GovernanceModal
          chainName={chainName}
          setOpen={extensionPopupCloser}
        />}
    </>
  );
}

export default memo(ActionButtons);
