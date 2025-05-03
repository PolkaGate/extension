// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Box, Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { PROFILE_TAGS } from '@polkadot/extension-polkagate/src/hooks/useProfileAccounts';
import { forgetAccount, updateMeta } from '@polkadot/extension-polkagate/src/messaging';

import { info } from '../../assets/gif';
import { DecisionButtons, ExtensionPopup, TwoToneText } from '../../components';
import { useAccountsOrder, useProfileAccounts, useTranslation } from '../../hooks';
import { removeProfileTag } from './utils';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<string | undefined>>;
  label: string;
}

function ConfirmationOfAction({ label, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const initialAccountList = useAccountsOrder();
  const profileAccounts = useProfileAccounts(initialAccountList, label);
  const [isBusy, setIsBusy] = useState<boolean>(false);

  const handleClose = useCallback(() => setPopup(undefined), [setPopup]);
  const onDelete = useCallback(async () => {
    const isDefaultProfile = Object.values(PROFILE_TAGS).includes(label);

    await Promise.all(profileAccounts?.map(async ({ account }) => {
      setIsBusy(true);
      const address = account.address;

      if (isDefaultProfile) {
        if (!account.profile) {
          await forgetAccount(account.address);
        }
      } else {
        // if a user defined profile
        const maybeNewProfile = removeProfileTag(account.profile, label);
        const metaData = JSON.stringify({
          profile: maybeNewProfile === '' ? null : maybeNewProfile
        });

        await updateMeta(address, metaData);
      }
    }) || []).finally(() => {
      setIsBusy(false);
      handleClose();
    });
  }, [handleClose, label, profileAccounts]);

  return (
    <ExtensionPopup
      handleClose={handleClose}
      openMenu={!!label}
      pt={165}
      withoutTopBorder
    >
      <Grid alignItems='center' container direction='column' item justifyContent='center' sx={{ pb: '5px', position: 'relative', zIndex: 1 }}>
        <Box
          component='img'
          src={info as string}
          sx={{ height: '100px', width: '100px', zIndex: 2 }}
        />
        <Typography color='text.primary' sx={{ zIndex: 2 }} textTransform='uppercase' variant='H-3'>
          {t('Confirmation of action')}
        </Typography>
        <Typography color='text.primary' sx={{ mt: '15px' }} variant='B-4'>
          <TwoToneText
            text={t('Profile "{{label}}" will be deleted.', { replace: { label } })}
            textPartInColor={`"${label}"`}
          />
        </Typography>
        <Typography color='text.secondary' fontWeight={700} variant='B-4'>
          {t('Accounts unique to this profile will be deleted.')}
        </Typography>
        <Typography color='text.primary' variant='B-4'>
          {t('Are you sure you want to continue?')}
        </Typography>
        <DecisionButtons
          cancelButton
          direction='vertical'
          isBusy={isBusy}
          onPrimaryClick={onDelete}
          onSecondaryClick={handleClose}
          primaryBtnText={t('Yes, delete the profile')}
          secondaryBtnText={t('Back')}
          style={{ margin: '15px 0', width: '97%' }}
        />
      </Grid>
    </ExtensionPopup>
  );
}

export default ConfirmationOfAction;
