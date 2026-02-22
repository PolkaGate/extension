// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { ExtensionPopupCloser } from '@polkadot/extension-polkagate/util/handleExtensionPopup';

import { Avatar, Grid, Link, Stack, Typography } from '@mui/material';
import { Record } from 'iconsax-react';
import React, { memo, useCallback } from 'react';

import { GradientButton } from '@polkadot/extension-polkagate/src/components';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials';
import getLogo2 from '@polkadot/extension-polkagate/src/util/getLogo2';

import { useTranslation } from '../../hooks';

interface Props {
  chainName?: string;
  setOpen: ExtensionPopupCloser;
}

type GovernanceDapp = keyof typeof POWERED_BY;

interface ItemProps {
  chainName?: string;
  name: GovernanceDapp;
}

const POWERED_BY = {
  polkassembly: 'Polka Labs',
  subsquare: 'OpenSquare'
};

function Item({ chainName, name }: ItemProps): React.ReactElement {
  const { t } = useTranslation();

  const _name = name === 'polkassembly' ? 'PolkassemblyIo' : name;
  const logo = getLogo2(_name)?.logo;

  return (
    <Link href={`https://${chainName ?? 'polkadot'}.${name}.io/`} rel='noreferrer' sx={{ bgcolor: 'background.default', borderRadius: '14px', my: '5px', width: '100%' }} target='_blank' underline='none'>
      <Stack direction='column' sx={{ padding: '15px 20px', position: 'relative' }}>
        <Stack alignItems='center' columnGap='15px' direction='row'>
          {logo &&
            <Avatar
              src={logo}
              sx={{ borderRadius: '50%', height: '40px', width: '40px' }}
              variant='square'
            />
          }
          <Typography color='text.secondary' textTransform='uppercase' variant='H-3'>
            {name}
          </Typography>
        </Stack>
        <Typography color='primary.main' sx={{ bottom: '15px', position: 'absolute', right: '15px' }} textAlign='end' variant='S-2'>
          {t('Powered by {{pb}}', { replace: { pb: POWERED_BY[name] } })}
        </Typography>
      </Stack>
    </Link>
  );
}

function GovernanceModal({ chainName, setOpen }: Props): React.ReactElement {
  const { t } = useTranslation();

  const onClose = useCallback(() => {
    setOpen();
  }, [setOpen]);

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 0' },
        showBackIconAsClose: true
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={onClose}
      open
      popupProps={{
        TitleIcon: Record,
        iconSize: 24,
        iconVariant: 'Bulk',
        pt: 185
      }}
      title={t('Explore Governance')}
    >
      <Grid container sx={{ position: 'relative', zIndex: 1 }}>
        <Typography color='text.secondary' sx={{ m: '15px 0 25px', textAlign: 'center' }} variant='B-1'>
          {t('Continue by selecting one of the following dapps')}
        </Typography>
        <Item chainName={chainName} name='subsquare' />
        <Item chainName={chainName} name='polkassembly' />
        <GradientButton
          contentPlacement='center'
          onClick={onClose}
          style={{
            height: '44px',
            marginTop: '20px'
          }}
          text={t('Close')}
        />
      </Grid>
    </SharePopup>
  );
}

export default memo(GovernanceModal);
