// Copyright 2019-2024 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { TransitionProps } from '@mui/material/transitions';

import { Box, Container, Dialog, Grid, Slide, Typography } from '@mui/material';
import { Check, Convertshape2, Eye, FolderOpen, Key, ScanBarcode } from 'iconsax-react';
import React, { useCallback, useContext } from 'react';

import { ActionButton, ActionContext } from '../../components';
import { useTranslation } from '../../hooks';
import { createAccountExternal, windowOpen } from '../../messaging';
import { GradientBorder, GradientDivider, RedGradient } from '../../style';
import { DEMO_ACCOUNT, POLKADOT_GENESIS_HASH } from '../../util/constants';
import { CustomCloseSquare } from './CustomCloseSquare';
import { Popups } from '.';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<Popups>>;
  openMenu: boolean;
}

const Transition = React.forwardRef(function Transition (props: TransitionProps & { children: React.ReactElement<unknown>; }, ref: React.Ref<unknown>) {
  return <Slide direction='up' easing='ease-in-out' ref={ref} timeout={250} {...props} />;
});

function AddAccount ({ openMenu, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const onAction = useContext(ActionContext);

  const handleClose = useCallback(() => setPopup(Popups.NONE), [setPopup]);

  const onRestoreFromJson = useCallback((): void => {
    windowOpen('/account/restore-json').catch(console.error);
  }, []);

  const onImportSeed = useCallback((): void => {
    windowOpen('/account/import-seed').catch(console.error);
  }, []);

  const onImportRawSeed = useCallback((): void => {
    windowOpen('/account/import-raw-seed').catch(console.error);
  }, []);

  const onAttachQR = useCallback((): void => {
    windowOpen('/import/attach-qr-full-screen').catch(console.error);
  }, []);

  const onImportLedger = useCallback((): void => {
    windowOpen('/account/import-ledger').catch(console.error);
  }, []);

  const onAddWatchOnly = useCallback((): void => {
    windowOpen('/import/add-watch-only-full-screen').catch(console.error);
  }, []);

  const onExploreDemo = useCallback((): void => {
    createAccountExternal('Demo Account ☔️', DEMO_ACCOUNT, POLKADOT_GENESIS_HASH)
      .then(() => onAction('/'))
      .catch((error: Error) => {
        console.error(error);
      });
  }, [onAction]);

  return (
    <Dialog
      PaperProps={{
        sx: {
          backgroundImage: 'unset',
          bgcolor: 'transparent',
          boxShadow: 'unset'
        }
      }}
      TransitionComponent={Transition}
      componentsProps={{
        backdrop: {
          sx: {
            backdropFilter: 'blur(10px)',
            background: 'radial-gradient(50% 44.61% at 50% 50%, rgba(12, 3, 28, 0) 0%, rgba(12, 3, 28, 0.7) 100%)',
            bgcolor: 'transparent'
          }
        }
      }}
      fullScreen
      open={openMenu}
    >
      <Container disableGutters sx={{ height: '100%', width: '100%' }}>
        <Grid alignItems='center' container item justifyContent='center' sx={{ pb: '12px', pt: '18px' }}>
          <CustomCloseSquare color='#AA83DC' onClick={handleClose} size='48' style={{ cursor: 'pointer' }} />
        </Grid>
        <Grid alignItems='center' container item justifyContent='center' sx={{ bgcolor: '#120D27', border: '2px solid', borderColor: '#FFFFFF0D', borderTopLeftRadius: '32px', borderTopRightRadius: '32px', display: 'block', height: 'calc(100% - 78px)', overflow: 'scroll', p: '10px', position: 'relative' }}>
          <GradientBorder />
          <Grid alignItems='center' columnGap='10px' container item justifyContent='center' p='10px'>
            <Typography color='#fff' fontFamily='OdibeeSans' fontSize='29px' fontWeight={400} textTransform='uppercase'>
              {t('Already have a wallet')}
            </Typography>
          </Grid>
          <RedGradient style={{ top: '-130px' }} />
          <Box sx={{ maxHeight: '440px', overflow: 'scroll', position: 'relative', width: '100%' }}>
            <Grid container item justifyContent='center' sx={{ pb: '5px', position: 'relative', px: '32px', rowGap: '12px', zIndex: 1 }}>
              <ActionButton
                StartIcon={FolderOpen}
                onClick={onRestoreFromJson}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Restore'),
                  secondPart: t('from file')
                }}
                variant='contained'
              />
              <ActionButton
                StartIcon={Check}
                onClick={onImportSeed}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Import from'),
                  secondPart: t('Recovery Phrase')
                }}
                variant='contained'
              />
              <ActionButton
                StartIcon={Key}
                onClick={onImportRawSeed}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Import from'),
                  secondPart: t('Raw Seed')
                }}
                variant='contained'
              />
              <ActionButton
                StartIcon={ScanBarcode}
                onClick={onAttachQR}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Attach'),
                  secondPart: t('QR-signer')
                }}
                variant='contained'
              />
              <ActionButton
                StartIcon={ScanBarcode} // TODO
                onClick={onImportLedger}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Attach'),
                  secondPart: t('Ledger Device')
                }}
                variant='contained'
              />
              <GradientDivider style={{ my: '6px' }} />
              <ActionButton
                StartIcon={Eye}
                onClick={onAddWatchOnly}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Add'),
                  secondPart: t('Watch-Only Account')
                }}
                variant='contained'
              />
              <ActionButton
                StartIcon={Convertshape2}
                onClick={onExploreDemo}
                style={{
                  borderRadius: '18px',
                  height: '46px',
                  width: '100%'
                }}
                text={{
                  firstPart: t('Demo'),
                  secondPart: t('Account Import')
                }}
                variant='contained'
              />
            </Grid>
          </Box>
        </Grid>
      </Container>
    </Dialog>
  );
}

export default AddAccount;
