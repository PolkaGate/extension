// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */
import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForward as ArrowForwardIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';

import { Identicon, ShortAddress } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useAccountName, useChain } from '../../../hooks';
import { getSubstrateAddress } from '../../../util/utils';

interface Props {
  subIdFormatted: string;
  subIdName: string;
  parentName: string;
  noButtons?: boolean;
}

interface ManageButtonProps {
  icon: unknown;
  text: string;
  onClick: () => void;
}

export default function DisplaySubId({ noButtons = false, parentName, subIdFormatted, subIdName }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useParams<{ address: string }>();
  const chain = useChain(params.address);
  const subIdAddress = getSubstrateAddress(subIdFormatted);
  const subIdExtentionName = useAccountName(subIdAddress);

  const ManageButton = ({ icon, onClick, text }: ManageButtonProps) => (
    <Grid alignItems='center' container item onClick={onClick} width='fit-content'>
      <Grid container item pr='5px' width='fit-content'>
        {icon}
      </Grid>
      <Typography fontSize='16px' fontWeight={400} sx={{ textDecoration: 'underline' }}>
        {text}
      </Typography>
    </Grid>
  );

  const onModify = useCallback(() => {
    console.log('modify');
  }, []);

  const onRemove = useCallback(() => {
    console.log('remove');
  }, []);

  return (
    <Grid container item sx={{ border: '1px solid', borderColor: 'secondary.light', borderRadius: '10px', boxShadow: '2px 3px 4px 0px #0000001A', p: '15px' }}>
      <Grid alignItems='center' container item>
        <Grid alignItems='center' container item width='40%'>
          <Grid alignItems='center' container item xs={10}>
            <Grid container item xs={2}>
              <Identicon
                iconTheme={chain?.icon ?? 'polkadot'}
                prefix={chain?.ss58Format ?? 42}
                size={31}
                value={subIdFormatted}
              />
            </Grid>
            <Grid container item pl='8px' sx={{ '> div': { justifyContent: 'flex-start' } }} xs={10}>
              {subIdExtentionName
                ? <Typography fontSize='20px' fontWeight={400} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='95%'>
                  {subIdExtentionName}
                </Typography>
                : <ShortAddress address={subIdFormatted} charsCount={6} />
              }
            </Grid>
          </Grid>
          <ArrowForwardIcon sx={{ fontSize: '25px', width: 'fit-content' }} />
        </Grid>
        <Grid alignItems='center' container item sx={{ width: '60%' }}>
          <Grid container item xs={1}>
            <Identicon
              iconTheme={chain?.icon ?? 'polkadot'}
              prefix={chain?.ss58Format ?? 42}
              size={31}
              value={subIdFormatted}
            />
          </Grid>
          <Grid container item pl='8px' xs={11}>
            <Typography fontSize='20px' fontWeight={400} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='95%'>
              {`${parentName} / ${subIdName}`}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      {!noButtons &&
        <Grid container item justifyContent='flex-end'>
          <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '12px', width: '95%' }} />
          <Grid columnSpacing='20px' container item justifyContent='flex-end'>
            <ManageButton
              icon={
                <FontAwesomeIcon
                  color={theme.palette.text.primary}
                  fontSize='25px'
                  icon={faEdit}
                />
              }
              onClick={onModify}
              text={t<string>('Modify')}
            />
            <ManageButton
              icon={
                <FontAwesomeIcon
                  color={theme.palette.text.primary}
                  fontSize='25px'
                  icon={faTrash}
                />
              }
              onClick={onRemove}
              text={t<string>('Delete')}
            />
          </Grid>
        </Grid>
      }
    </Grid>
  );
}
