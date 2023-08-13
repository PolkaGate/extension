// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faEdit, faEraser, faTasks, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN } from '@polkadot/util';

import { ShowBalance } from '../../components';
import { useTranslation } from '../../components/translate';
import DisplayIdentityInformation from './partial/DisplayIdentityInformation';
import SubIdsAccordion from './partial/SubIdsAccordion';
import { IdJudgement, Mode, STEPS } from '.';

interface Props {
  api: ApiPromise | undefined;
  identity: DeriveAccountRegistration;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setIdentityToSet: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | null | undefined>>;
  subIdAccounts: { address: string; name: string; }[] | null | undefined;
  judgement: IdJudgement;
  totalDeposit: BN;
}

interface ManageButtonProps {
  icon: unknown;
  title: string;
  onClick: () => void;
}

export default function PreviewIdentity({ api, identity, judgement, setIdentityToSet, setMode, setStep, subIdAccounts, totalDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const ManageButton = ({ icon, onClick, title }: ManageButtonProps) => (
    <Grid alignItems='center' container item onClick={onClick} sx={{ bgcolor: 'background.paper', border: '2px solid', borderColor: 'secondary.light', borderRadius: '5px', cursor: 'pointer', py: '17px', width: '24%' }}>
      <Grid container item justifyContent='center'>
        {icon}
      </Grid>
      <Grid container item justifyContent='center' pt='8px'>
        <Typography fontSize='18px' fontWeight={500} color={theme.palette.mode === 'dark' && 'secondary.main'}>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );

  const goModify = useCallback(() => {
    setMode('Modify');
    setStep(STEPS.MODIFY);
  }, [setMode, setStep]);

  const clearIdentity = useCallback(() => {
    setMode('Clear');
    setIdentityToSet(null);
    setStep(STEPS.REVIEW);
  }, [setIdentityToSet, setMode, setStep]);

  const requestJudgment = useCallback(() => {
    setStep(STEPS.JUDGEMENT);
  }, [setStep]);

  const manageSubId = useCallback(() => {
    setStep(STEPS.MANAGESUBID);
  }, [setStep]);

  return (
    <Grid container item sx={{ display: 'block', maxWidth: '840px', px: '10%' }}>
      <Grid container item justifyContent='space-between' pb='15px' pt='25px'>
        <Typography fontSize='30px' fontWeight={700}>
          {t<string>('On-chain Identity')}
        </Typography>
        <Grid alignItems='center' container item width='fit-content'>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Total deposit:')}
          </Typography>
          <Grid fontSize='18px' fontWeight={500} item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={totalDeposit}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
      </Grid>
      <DisplayIdentityInformation
        identity={identity}
      />
      {subIdAccounts && subIdAccounts.length > 0 && identity.display &&
        <SubIdsAccordion
          parentNameID={identity.display}
          subIdAccounts={subIdAccounts}
        />
      }
      <Typography fontSize='22px' fontWeight={700} sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', pb: '10px', pt: '20px' }}>
        {t<string>('Manage Identity')}
      </Typography>
      <Grid container item justifyContent='space-between' p='15px 0'>
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.text.primary}
              fontSize='44px'
              icon={faEdit}
            />
          }
          onClick={goModify}
          title={t<string>('Modify')}
        />
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.text.primary}
              fontSize='44px'
              icon={faEraser}
            />
          }
          onClick={clearIdentity}
          title={t<string>('Clear')}
        />
        <ManageButton
          icon={judgement && judgement !== 'FeePaid'
            ? <CheckCircleOutlineIcon
              sx={{
                bgcolor: 'success.main',
                borderRadius: '50%',
                color: 'white',
                fontSize: 44
              }}
            />
            : <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.text.primary}
              fontSize='44px'
              icon={faTasks}
            />
          }
          onClick={requestJudgment}
          title={judgement && judgement !== 'FeePaid'
            ? judgement
            : t<string>('Request Judgment')}
        />
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.mode === 'dark' ? theme.palette.secondary.main : theme.palette.text.primary}
              fontSize='44px'
              icon={faNetworkWired}
            />
          }
          onClick={manageSubId}
          title={subIdAccounts && subIdAccounts.length > 0
            ? t<string>('Manage Sub-ID')
            : t<string>('Set Sub-ID')
          }
        />
      </Grid>
    </Grid>
  );
}
