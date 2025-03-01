// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { BN } from '@polkadot/util';

import { faHand, faHandHoldingDollar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { openOrFocusTab, TaskButton } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { useInfo, useStakingAccount, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import ConfigurePayee from '../commonTasks/configurePayee';

interface Props {
  address: string | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
  staked: BN | undefined;
  isValidator: boolean | null | undefined
}

export default function CommonTasks({ address, isValidator, setRefresh, staked }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { genesisHash } = useInfo(address);

  const stakingAccount = useStakingAccount(address);

  const stakedButNoValidators = useMemo(() => {
    if (stakingAccount?.stakingLedger?.active) {
      const hasStaked = !(stakingAccount.stakingLedger.active as unknown as BN).isZero();
      const hasNotSelectedValidators = stakingAccount.nominators?.length === 0;

      return hasStaked && hasNotSelectedValidators;
    }

    return undefined;
  }, [stakingAccount]);

  const [showRewardDestinationModal, setShowRewardDestinationModal] = useState<boolean>(false);

  const isDisabled = useMemo((): boolean => !genesisHash || !staked || staked?.isZero(), [genesisHash, staked]);
  const iconColor = isDisabled ? theme.palette.action.disabledBackground : theme.palette.text.primary

  const onRewardDestination = useCallback(() => {
    setShowRewardDestinationModal(true);
  }, []);

  const onManageValidators = useCallback(() => {
    address && openOrFocusTab(`/manageValidators/${address}/0`, true);
  }, [address]);

  return (
    <>
      <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
        <Typography fontSize='20px' fontWeight={700}>
          {t('Most common tasks')}
        </Typography>
        <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
        <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
          <TaskButton
            disabled={isDisabled}
            dividerWidth='75%'
            icon={
              <FontAwesomeIcon
                color={`${iconColor}`}
                fontSize='22px'
                icon={faHandHoldingDollar}
              />
            }
            mr='0px'
            onClick={onRewardDestination}
            secondaryIconType='popup'
            text={t('Configure Reward Destination')}
          />
          <TaskButton
            disabled={isDisabled || isValidator === true}
            icon={
              <FontAwesomeIcon
                bounce={!!stakedButNoValidators && !isValidator}
                color={stakedButNoValidators && !isValidator ? `${theme.palette.warning.main}` : `${iconColor}`}
                fontSize='22px'
                icon={faHand}
              />
            }
            mr='0px'
            noBorderButton
            onClick={onManageValidators}
            secondaryIconType='page'
            text={t('Manage Validators')}
          />
        </Grid>
      </Grid>
      <ConfigurePayee
        address={address}
        setRefresh={setRefresh}
        setShow={setShowRewardDestinationModal}
        show={showRewardDestinationModal}
      />
    </>
  );
}
