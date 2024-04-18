// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Close as CloseIcon, FiberManualRecord as FiberManualRecordIcon } from '@mui/icons-material';
import { Box, Divider, Grid, IconButton, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import React, { useCallback } from 'react';

import { SlidePopUp } from '../../components';
import { DraggableModal } from '../../fullscreen/governance/components/DraggableModal';
import { useTranslation } from '../../hooks';
import { SocialLinks } from '../../partials/VersionSocial';

interface Props {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  asModal?: boolean;
}

function Privacy({ asModal, setShow, show = false }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onClose = useCallback(() => {
    setShow(false);
  }, [setShow]);

  const welcome = (
    <Grid alignItems='flex-start' bgcolor='background.default' container display='block' item mt={asModal ? 0 : '46px'} sx={{ borderRadius: '10px 10px 0px 0px', height: 'parent.innerHeight' }} width='100%'>
      <Grid container justifyContent='center' my='20px'>
        <Typography fontSize='20px' fontWeight={400} lineHeight={1.4}>
          {t<string>('Privacy and Security')}
        </Typography>
      </Grid>
      <Divider sx={{ bgcolor: 'secondary.main', height: '1px', m: '35px auto 15px', width: '240px' }} />
      <Typography fontSize='14px' lineHeight={1.4} px='15px'>
        {t<string>('Polkagate is a browser extension that lets you use the Polkadot network and decentralized apps. We respect your privacy and do not collect or store any of your personal data. This is how we protect your privacy:')}
      </Typography>
      <Box sx={{ backgroundColor: 'background.paper', border: '0.5px solid', borderColor: 'secondary.light', borderRadius: '5px', fontSize: '14px', m: '20px 15px 17px', maxHeight: '300px', overflowY: 'scroll' }}>
        <List sx={{ color: 'text.primary' }}>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We do not collect your clicks, browsing history, keys, addresses, transactions, or any other data.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We use open-source code, end-to-end encryption, local storage, and secure communication protocols.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('We may update this privacy policy and notify you on our website and extension.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
          <ListItem sx={{ py: '2px' }}>
            <ListItemIcon sx={{ color: 'primary.main', minWidth: '26px', width: '26px' }}>
              <FiberManualRecordIcon sx={{ width: '9px' }} />
            </ListItemIcon>
            <ListItemText
              primary={t<string>('If you have any questions, please contact us at polkagate@outlook.com or follow us on our social media accounts.')}
              primaryTypographyProps={{ fontSize: '14px' }}
            />
          </ListItem>
        </List>
      </Box>
      <IconButton onClick={onClose} sx={{ left: '15px', p: 0, position: 'absolute', top: asModal ? '15px' : '65px' }}>
        <CloseIcon sx={{ color: 'text.primary', fontSize: 35 }} />
      </IconButton>
      <Grid container justifyContent='center' sx={{ bottom: asModal ? '-25px' : 0, position: 'absolute' }}>
        <SocialLinks />
      </Grid>
    </Grid>
  );

  return (
    <>
      {asModal
        ? <DraggableModal onClose={onClose} open>
          <Grid container position='relative'>
            {welcome}
          </Grid>
        </DraggableModal>
        : <SlidePopUp show={show}>
          {welcome}
        </SlidePopUp>
      }
    </>
  );
}

export default React.memo(Privacy);
