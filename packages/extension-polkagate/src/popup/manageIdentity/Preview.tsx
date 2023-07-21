// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faEdit, faEraser, faHandshake, faNetworkWired } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { ArrowForwardIos as ArrowForwardIosIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';

import { DeriveAccountRegistration } from '@polkadot/api-derive/types';

import { useTranslation } from '../../components/translate';
import DisplayIdentityInformation from './partial/DisplayIdentityInformation';
import SubIdsAccordion from './partial/SubIdsAccordion';
import { Mode, STEPS } from '.';

interface Props {
  identity: DeriveAccountRegistration;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
  setIdentityToSet: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | null | undefined>>;
  subIdAccounts: { address: string; name: string; }[] | null | undefined;
}

// interface WideManageButtonProps {
//   icon: unknown;
//   title: string;
//   helperText: string;
//   onClick: () => void;
//   noBorder?: boolean;
// }

interface ManageButtonProps {
  icon: unknown;
  title: string;
  onClick: () => void;
}

export default function PreviewIdentity ({ identity, setIdentityToSet, setMode, setStep, subIdAccounts }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();

  // const WideManageButton = ({ helperText, icon, noBorder, onClick, title }: WideManageButtonProps) => (
  //   <Grid alignItems='center' container height='40px' item justifyContent='space-between' onClick={onClick} sx={noBorder ? { cursor: 'pointer' } : { borderBottom: '1px solid', borderBottomColor: '#D5CCD0', cursor: 'pointer' }}>
  //     <Grid container item xs={11}>
  //       <Grid container item justifyContent='center' xs={1}>
  //         {icon}
  //       </Grid>
  //       <Grid container item xs={4}>
  //         <Typography fontSize='18px' fontWeight={500}>
  //           {title}
  //         </Typography>
  //       </Grid>
  //       <Grid container item xs={7}>
  //         <Typography fontSize='14px' fontWeight={300}>
  //           {helperText}
  //         </Typography>
  //       </Grid>
  //     </Grid>
  //     <Grid container item xs={1}>
  //       <ArrowForwardIosIcon sx={{ color: 'secondary.light', fontSize: 22, m: 'auto', stroke: '#BA2882', strokeWidth: '2px' }} />
  //     </Grid>
  //   </Grid>
  // );

  const ManageButton = ({ icon, onClick, title }: ManageButtonProps) => (
    <Grid alignItems='center' container item onClick={onClick} sx={{ cursor: 'pointer', width: 'fit-content' }}>
      <Grid container item justifyContent='center'>
        {icon}
      </Grid>
      <Grid container item justifyContent='center' pt='8px'>
        <Typography fontSize='18px' fontWeight={500}>
          {title}
        </Typography>
      </Grid>
    </Grid>
  );

  const VDivider = () => (
    <Divider flexItem orientation='vertical' sx={{ bgcolor: '#D5CCD0', mx: '2%' }} />
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
    setStep(STEPS.MANAGESUBID);
  }, [setStep]);

  return (
    <Grid container item sx={{ display: 'block', maxWidth: '840px', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb='20px' pt='30px'>
        {t<string>('On-chain Identity')}
      </Typography>
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
      <Grid container item justifyContent='space-between' p='15px 35px'>
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='25px'
              icon={faEdit}
            />
          }
          onClick={goModify}
          title={t<string>('Modify')}
        />
        <VDivider />
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='25px'
              icon={faEraser}
            />
          }
          onClick={clearIdentity}
          title={t<string>('Clear')}
        />
        <VDivider />
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='25px'
              icon={faHandshake}
            />
          }
          onClick={requestJudgment}
          title={t<string>('Request Judgment')}
        />
        <VDivider />
        <ManageButton
          icon={
            <FontAwesomeIcon
              color={theme.palette.text.primary}
              fontSize='25px'
              icon={faNetworkWired}
            />
          }
          onClick={manageSubId}
          title={subIdAccounts && subIdAccounts.length > 0
            ? t<string>('Manage Sub-identity')
            : t<string>('Set Sub-identity')
          }
        />
      </Grid>
    </Grid>
  );
}
