// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { AccessTime as AccessTimeIcon, ArrowForward as ArrowForwardIcon, Handshake as HandshakeIcon } from '@mui/icons-material';
import { alpha, Box, Button, Dialog, DialogContent, Paper, Slide, type Theme, Typography, useTheme } from '@mui/material';
import { styled } from '@mui/system';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { BN, BN_ZERO } from '@polkadot/util';

import { AccountsAssetsContext } from '../../components';
import { getStorage, setStorage } from '../../components/Loading';
import { useReferendum, useTranslation } from '../../hooks';
import { tieAccount } from '../../messaging';
import { POLKADOT_GENESIS_HASH } from '../../util/constants';
import { openOrFocusTab } from '../accountDetails/components/CommonTasks';
import { ENDED_STATUSES } from './utils/consts';

const PROPOSAL_NO = 1264;
const STORAGE_LABEL = `supportUs_${PROPOSAL_NO}`;

const StyledPaper = styled(Paper)(({ theme }: { theme: Theme }) => ({
  background: theme.palette.background.default,
  borderRadius: 24,
  boxShadow: '0 12px 24px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
  padding: theme.spacing(4),
  position: 'relative'
}));

const BackgroundDecoration = styled(Box)(({ theme }: { theme: Theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
  clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 80%)',
  height: '40%',
  left: 0,
  position: 'absolute',
  right: 0,
  top: 0,
  zIndex: 0
}));

const ContentWrapper = styled(Box)(() => ({
  position: 'relative',
  zIndex: 1
}));

const StyledImage = styled('img')({
  borderRadius: 16,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
  height: 'auto',
  width: '425px'
});

const VoteButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
    transform: 'translateY(-2px)'
  },
  backgroundColor: theme.palette.secondary.main,
  borderRadius: 30,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 500,
  padding: '10px 40px',
  transition: 'all 0.3s ease-in-out'
}));

const MaybeLaterButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  '&:hover': {
    backgroundColor: alpha(theme.palette.text.primary, 0.1)
  },
  color: theme.palette.text.primary,
  padding: '10px',
  textTransform: 'none'
}));

export default function SupportUs() {
  const { t } = useTranslation();
  const theme = useTheme();

  const { accountsAssets } = useContext(AccountsAssetsContext);

  const [open, setOpen] = useState<boolean>(true);
  const [maxPowerAddress, setAddress] = useState<string>();
  const [show, setShow] = useState<boolean>();

  const referendum = useReferendum(maxPowerAddress, 'Referenda', PROPOSAL_NO);
  const isReferendumOngoing = referendum?.status && !ENDED_STATUSES.includes(referendum.status);
  const showModal = show && maxPowerAddress && isReferendumOngoing;

  useEffect(() => {
    getStorage(STORAGE_LABEL).then((hasAlreadyShown) => {
      setShow(!hasAlreadyShown);
    }).catch(console.error);
  }, []);

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

      if (votingBalance.gt(max)) {
        max = votingBalance;
        addressWithMaxVotingPower = address;
      }
    });

    addressWithMaxVotingPower && tieAccount(addressWithMaxVotingPower, POLKADOT_GENESIS_HASH).finally(() => {
      setAddress(addressWithMaxVotingPower);
    }).catch(console.error);
  }, [accountsAssets]);

  const handleHasShown = useCallback(() => {
    setStorage(STORAGE_LABEL, true).catch(console.error); // hope u come back again ;)
    setOpen(false);
  }, []);

  const handleOnVote = useCallback(() => {
    handleHasShown();

    maxPowerAddress && openOrFocusTab(`/governance/${maxPowerAddress}/referenda/${PROPOSAL_NO}`);
  }, [handleHasShown, maxPowerAddress]);

  return (
    <>
      {showModal &&
        <Dialog
          PaperProps={{
            style: {
              background: 'transparent',
              borderRadius: 24,
              overflow: 'hidden'
            }
          }}
          TransitionComponent={Slide}
          TransitionProps={{
            timeout: { enter: 500, exit: 300 }
          }}
          fullWidth
          maxWidth='sm'
          open={open}
          slotProps={{
            backdrop: {
              style: {
                backdropFilter: 'blur(5px)',
                backgroundColor: 'rgba(0, 0, 0, 0.4)'
              }
            }
          }}
        >
          <DialogContent style={{ padding: 0 }}>
            <StyledPaper theme={theme}>
              <BackgroundDecoration theme={theme} />
              <ContentWrapper>
                <Box alignItems='center' display='flex' mb={3}>
                  <HandshakeIcon sx={{ color: theme.palette.approval.contrastText, fontSize: 40, mr: 2 }} />
                  <Typography fontSize='35px' fontWeight={500} sx={{ color: theme.palette.approval.contrastText }}>
                    {t('Support PolkaGate')}
                  </Typography>
                </Box>
                <Typography fontSize='16px' fontWeight={400} sx={{ color: '#fff', pb: '20px' }}>
                  {t("We're seeking retroactive funding to sustain and expand PolkaGate's impact!")}
                </Typography>
                <StyledImage
                  alt='Support PolkaGate'
                  src='/images/supportUs.jpeg'
                />
                <Box mt={3}>
                  <Typography fontSize='30px' fontWeight={500} sx={{ color: theme.palette.text.primary, pb: '10px' }}>
                    {t('Your Vote Matters')}
                  </Typography>
                  <Typography fontSize='16px' fontWeight={400} sx={{ color: theme.palette.text.primary, pb: '10px' }}>
                    {t('Empower us to continue delivering valuable improvements and innovations.')}
                  </Typography>
                  <Typography fontSize='14px' fontWeight={400} sx={{ color: theme.palette.text.primary, fontStyle: 'italic' }}>
                    {t("Voting won't spend your tokens—they'll just be temporarily locked based on your chosen conviction level.")}
                  </Typography>
                </Box>
                <Box alignItems='center' display='flex' justifyContent='space-between' mt={4}>
                  <MaybeLaterButton
                    onClick={handleHasShown}
                    startIcon={<AccessTimeIcon />}
                    theme={theme}
                  >
                    {t("I'll think about it")}
                  </MaybeLaterButton>
                  <VoteButton
                    endIcon={<ArrowForwardIcon />}
                    onClick={handleOnVote}
                    theme={theme}
                  >
                    {t('Vote Now')}
                  </VoteButton>
                </Box>
              </ContentWrapper>
            </StyledPaper>
          </DialogContent>
        </Dialog>
      }
    </>
  );
}
