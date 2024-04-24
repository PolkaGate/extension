// Copyright 2019-2024 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faCog, faHand } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback, useMemo, useState } from 'react';

import { openOrFocusTab, TaskButton } from '@polkadot/extension-polkagate/src/fullscreen/accountDetails/components/CommonTasks';
import { useInfo, useTranslation } from '@polkadot/extension-polkagate/src/hooks';

import ConfigurePayee from '../commonTasks/configurePayee';

interface Props {
  address: string | undefined;
  setRefresh: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function CommonTasks ({ address, setRefresh }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { genesisHash } = useInfo(address);

  const isDarkTheme = useMemo(() => theme.palette.mode === 'dark', [theme.palette.mode]);

  const [showRewardDestinationModal, setShowRewardDestinationModal] = useState<boolean>(false);

  const onRewardDestination = useCallback(() => {
    setShowRewardDestinationModal(true);
  }, []);

  const onManageValidators = useCallback(() => {
    address && openOrFocusTab(`/manageValidators/${address}/0`, true);
  }, [address]);

  return (
    <>
      <Grid container item justifyContent='center' sx={{ bgcolor: 'background.paper', border: isDarkTheme ? '1px solid' : 'none', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px rgba(0, 0, 0, 0.1)', p: '15px' }} width='inherit'>
        <Typography fontSize='22px' fontWeight={700}>
          {t('Most common tasks')}
        </Typography>
        <Divider sx={{ bgcolor: 'divider', height: '2px', m: '5px auto 15px', width: '90%' }} />
        <Grid alignItems='center' container direction='column' display='block' item justifyContent='center'>
          <TaskButton
            disabled={!genesisHash}
            icon={
              <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
                fontSize='22px'
                icon={faCog}
              />
            }
            mr='0px'
            onClick={onRewardDestination}
            secondaryIconType='popup'
            text={t('Configure Reward Destination')}
          />
          <TaskButton
            disabled={!genesisHash}
            icon={
              <FontAwesomeIcon
                color={`${theme.palette.text.primary}`}
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
