// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faHandshakeAngle } from '@fortawesome/free-solid-svg-icons';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext, TwoButtons } from '../../components';
import { getStorage, setStorage } from '../../components/Loading';
import { useTranslation } from '../../hooks';
import { tieAccount } from '../../messaging';
import { POLKADOT_GENESIS_HASH } from '../../util/constants';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import SimpleModalTitle from '../partials/SimpleModalTitle';
import { DraggableModal } from './components/DraggableModal';

const PROPOSAL_NO = 1264;
const SHOW_INTERVAL = 10 * 1000; // ms
const STORAGE_LABEL = `polkaGateVoteReminderLastShown_${PROPOSAL_NO}`;

export default function SupportUs (): React.ReactElement {
  const { t } = useTranslation();
  const { accountsAssets } = useContext(AccountsAssetsContext);

  const [open, setOpen] = useState<boolean>(true);
  const [maxPowerAddress, setAddress] = useState<string>();
  const [timeToShow, setTimeToShow] = useState<boolean>();

  useEffect(() => {
    getStorage(STORAGE_LABEL).then((maybeDate) => {
      (!maybeDate || Date.now() - (maybeDate as unknown as number) > SHOW_INTERVAL) && setTimeToShow(true);
    }).catch(console.error);
  }, [accountsAssets]);

  useEffect(() => {
    if (!accountsAssets) {
      return;
    }

    const balances = accountsAssets.balances;
    let addressWithMaxVotingPower: string | undefined;
    let max = BN_ZERO;

    Object.keys(balances).forEach((address) => {
      const maybeAsset = balances[address]?.[POLKADOT_GENESIS_HASH];

      if (!maybeAsset) {
        return;
      }

      const votingBalance = maybeAsset[0].votingBalance ? new BN(maybeAsset[0].votingBalance) : BN_ZERO;

      max = votingBalance.gt(max) ? votingBalance : max;
      addressWithMaxVotingPower = address;
    });

    addressWithMaxVotingPower && tieAccount(addressWithMaxVotingPower, POLKADOT_GENESIS_HASH).finally(() => {
      setAddress(addressWithMaxVotingPower);
    }).catch(console.error);
  }, [accountsAssets]);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOnVote = useCallback(() => {
    maxPowerAddress && openOrFocusTab(`/governance/${maxPowerAddress}/referenda/${PROPOSAL_NO}`);
  }, [maxPowerAddress]);

  const handleMaybeLater = useCallback(() => {
    setStorage(STORAGE_LABEL, Date.now()).catch(console.error);
    setOpen(false);
  }, []);

  return (
    <>
      {maxPowerAddress && timeToShow &&
        <DraggableModal onClose={handleClose} open={open}>
          <>
            <SimpleModalTitle
              icon={faHandshakeAngle}
              onClose={handleClose}
              title={t('Support PolkaGate!')}
            />
            <Grid item sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider', borderRadius: '5px', mt: 5, p: '10px' }}>
              <Typography fontSize='14px' lineHeight='25px' textAlign='left'>
                {t('We’re seeking retroactive funding to sustain and expand PolkaGate’s impact! Your vote can empower us to continue delivering valuable improvements and innovations. Voting won’t spend your tokens—they’ll just be temporarily locked based on your chosen conviction level.')}
              </Typography>
            </Grid>
            <Box
              alt='Description of the image'
              component='img'
              src='/images/supportUs.webp'
              sx={{
                width: '60%',
                height: 'auto',
                borderRadius: 1
              }}
            />
            <TwoButtons
              ml='0'
              onPrimaryClick={handleOnVote}
              onSecondaryClick={handleMaybeLater}
              primaryBtnStartIcon={<ThumbUpIcon />}
              primaryBtnText={t('Vote to Support Us')}
              secondaryBtnStartIcon={<WatchLaterIcon />}
              secondaryBtnText={t('Maybe Later')}
              width='88%'
            />
          </>
        </DraggableModal>
      }
    </>
  );
}
