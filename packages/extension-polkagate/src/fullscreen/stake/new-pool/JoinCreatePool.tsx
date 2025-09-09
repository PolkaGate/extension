// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Container, Stack, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { CreatePoolIcon, JoinPoolIcon } from '../../../assets/icons';
import { DecisionButtons } from '../../../components';
import { useChainInfo, usePoolConst, useTranslation } from '../../../hooks';
import { Option } from '../../../popup/staking/pool-new/stake';
import { DraggableModal } from '../../components/DraggableModal';
import { type PopupCloser, type PopupOpener, StakingPopUps } from '../util/utils';

interface Props {
  address: string | undefined;
  genesisHash: string | undefined;
  onClose: PopupCloser;
  popupOpener: PopupOpener;
}

enum stakingOptions {
  JOIN,
  CREATE
}

export default function JoinCreatePool ({ address, genesisHash, onClose, popupOpener }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { decimal, token } = useChainInfo(genesisHash, true);
  const poolStakingConsts = usePoolConst(genesisHash);

  const [selectedOption, setSelectedOption] = useState<stakingOptions | undefined>(undefined);

  const selectOption = useCallback((option: stakingOptions) => () => setSelectedOption(option), []);
  const isSelected = useCallback((option: stakingOptions) => selectedOption === option, [selectedOption]);

  const onStake = useCallback(() => {
    if (selectedOption === stakingOptions.JOIN) {
      navigate('/fullscreen-stake/pool/join-pool/' + address + '/' + genesisHash) as void;
      onClose();
    } else if (selectedOption === stakingOptions.CREATE) {
      popupOpener(StakingPopUps.CREATE_POOL)();
    }
  }, [address, genesisHash, navigate, onClose, popupOpener, selectedOption]);

  return (
    <DraggableModal
      maxHeight={555}
      minHeight={555}
      onClose={onClose}
      open
      title={t('Stake')}
    >
      <Stack direction='column' sx={{ gap: '32px', px: '18px' }}>
        <Typography color='text.secondary' px='4px' variant='B-4'>
          {t('Options are available to commence pool staking in Polkadot. Please select your preference, taking into consideration the minimum requirements for receiving rewards per era.')}
        </Typography>
        <Container disableGutters sx={{ display: 'flex', flexDirection: 'row', gap: '18px' }}>
          <Option
            decimal={decimal}
            icon={JoinPoolIcon as string}
            isSelected={isSelected(stakingOptions.JOIN)}
            minimumText={t('Minimum to join')}
            onClick={selectOption(stakingOptions.JOIN)}
            title={t('Join Pool')}
            token={token}
            value={poolStakingConsts?.minJoinBond}
          />
          <Option
            decimal={decimal}
            icon={CreatePoolIcon as string}
            isSelected={isSelected(stakingOptions.CREATE)}
            minimumText={t('Minimum to create')}
            onClick={selectOption(stakingOptions.CREATE)}
            title={t('Create Pool')}
            token={token}
            value={poolStakingConsts?.minCreationBond}
          />
        </Container>
        <DecisionButtons
          cancelButton
          direction='vertical'
          disabled={selectedOption === undefined}
          onPrimaryClick={onStake}
          onSecondaryClick={onClose}
          primaryBtnText={t('Next')}
          secondaryBtnText={t('Back')}
        />
      </Stack>
    </DraggableModal>
  );
}
