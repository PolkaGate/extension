// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faEdit, faEraser, faHandshake, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useTranslation } from '../../components/translate';
import DisplayIdentityInformation from './partial/DisplayIdentityInformation';
import { Mode, STEPS } from '.';

interface Props {
  identity: DeriveAccountRegistration;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  mode: Mode;
  setIdentityToSet: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | null | undefined>>;
}

interface ManageButtonProps {
  icon: unknown;
  title: string;
  helperText: string;
  onClick: () => void;
  noBorder?: boolean;
}

export default function PreviewIdentity({ identity, mode, setMode, setStep, step, setIdentityToSet }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  const ManageButton = ({ helperText, icon, noBorder, onClick, title }: ManageButtonProps) => (
    <Grid alignItems='center' container height='40px' item justifyContent='space-between' onClick={onClick} sx={noBorder ? { cursor: 'pointer' } : { borderBottom: '1px solid', borderBottomColor: '#D5CCD0', cursor: 'pointer' }}>
      <Grid container item xs={11}>
        <Grid container item justifyContent='center' xs={1}>
          {icon}
        </Grid>
        <Grid container item xs={4}>
          <Typography fontSize='18px' fontWeight={500}>
            {title}
          </Typography>
        </Grid>
        <Grid container item xs={7}>
          <Typography fontSize='14px' fontWeight={300}>
            {helperText}
          </Typography>
        </Grid>
      </Grid>
      <Grid container item xs={1}>
        <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 22, m: 'auto', stroke: '#BA2882', strokeWidth: '2px' }} />
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
    setStep(STEPS.MODIFY);
  }, [setStep]);

  const manageSubId = useCallback(() => {
    setStep(STEPS.MODIFY);
  }, [setStep]);

  return (
    <Grid container item sx={{ display: 'block', maxWidth: '840px', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb='20px' pt='30px'>
        {t<string>('On-chain Identity')}
      </Typography>
      <DisplayIdentityInformation
        identity={identity}
      />
      <Typography fontSize='22px' fontWeight={700} sx={{ borderBottom: '2px solid', borderBottomColor: '#D5CCD0', pb: '10px', pt: '20px' }}>
        {t<string>('Manage Identity')}
      </Typography>
      <ManageButton
        helperText={t<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
        icon={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            fontSize='22px'
            icon={faEdit}
          />
        }
        onClick={goModify}
        title={t<string>('Modify')}
      />
      <ManageButton
        helperText={t<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
        icon={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            fontSize='22px'
            icon={faEraser}
          />
        }
        onClick={clearIdentity}
        title={t<string>('Clear')}
      />
      <ManageButton
        helperText={t<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
        icon={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            fontSize='22px'
            icon={faHandshake}
          />
        }
        onClick={requestJudgment}
        title={t<string>('Request Judgment')}
      />
      <ManageButton
        helperText={t<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit.')}
        icon={
          <FontAwesomeIcon
            color={theme.palette.text.primary}
            fontSize='22px'
            icon={faNetworkWired}
          />
        }
        noBorder
        onClick={manageSubId}
        title={t<string>('Set Sub-identity')}
      />
    </Grid>
  );
}
