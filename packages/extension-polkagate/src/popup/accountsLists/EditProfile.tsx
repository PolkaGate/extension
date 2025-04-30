// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography } from '@mui/material';
import { Folder } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';

import { DecisionButtons, ExtensionPopup, GradientButton, MyTextField } from '../../components';
import { useAccountsOrder, useCategorizedAccountsInProfiles, useProfileAccounts, useTranslation } from '../../hooks';
import ProfileAccountSelection from './ProfileAccountSelection';
import { addProfileTag, removeProfileTag } from './utils';

interface Props {
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
  profileLabel: string;
}

enum STEP {
  EDIT_NAME,
  CHOOSE_ACCOUNTS
}

function EditProfile ({ profileLabel, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const initialAccountList = useAccountsOrder();
  const profileAccounts = useProfileAccounts(initialAccountList, profileLabel);
  const categorizedAccounts = useCategorizedAccountsInProfiles();

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [maybeNewName, setName] = useState<string | null>();
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(STEP.EDIT_NAME);

  const handleClose = useCallback(() => setPopup(false), [setPopup]);

  const onNext = useCallback(() => {
    setStep(STEP.CHOOSE_ACCOUNTS);
  }, []);

  const onEdit = useCallback(async () => {
    const allAccounts = initialAccountList?.map(({ account }) => account);

    setIsBusy(true);

    const cleanedProfiles = new Map<string, string>();

    await Promise.all(profileAccounts?.map(async ({ account }) => {
      if (maybeNewName || account.profile?.includes(profileLabel)) {
        const maybeNewProfile = removeProfileTag(account.profile, profileLabel);

        cleanedProfiles.set(account.address, maybeNewProfile);
        const metaData = JSON.stringify({
          profile: maybeNewProfile === '' ? null : maybeNewProfile
        });

        await updateMeta(account.address, metaData);
      }
    }) || []).catch(console.error);

    await Promise.all(allAccounts?.map(async (account) => {
      let maybeNewProfile;
      let metaData;

      if (selectedAddresses.has(account.address)) {
        const baseProfile = cleanedProfiles.get(account.address) ?? account.profile;

        maybeNewProfile = addProfileTag(baseProfile, maybeNewName ?? profileLabel);
        metaData = JSON.stringify({
          profile: maybeNewProfile === '' ? null : maybeNewProfile
        });

        await updateMeta(account.address, metaData);
      }
    }) || []).finally(() => {
      setIsBusy(false);
      handleClose();
    });
  }, [handleClose, initialAccountList, maybeNewName, profileAccounts, profileLabel, selectedAddresses]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  return (
    <ExtensionPopup
      TitleIcon={Folder}
      handleClose={handleClose}
      iconSize={24}
      iconVariant='Bulk'
      maxHeight='100%'
      openMenu={!!profileLabel}
      title={t('Edit profile')}
      withoutTopBorder
    >
      {step === STEP.EDIT_NAME &&
        <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
          <Typography color='#BEAAD8' variant='B-4'>
            {t('You can give the profile a new name')}
          </Typography>
          <MyTextField
            Icon={Folder}
            iconSize={18}
            onEnterPress={onNext}
            onTextChange={onNameChange}
            placeholder={profileLabel}
            style={{ margin: '20px 0 30px' }}
            title={t('Profile name')}
          />
          <GradientButton
            contentPlacement='center'
            onClick={onNext}
            style={{
              bottom: '0',
              height: '44px',
              position: 'absolute',
              width: '97%'
            }}
            text={t('Next')}
          />
        </Grid>
      }
      {step === STEP.CHOOSE_ACCOUNTS &&
        <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
          <Typography color='#BEAAD8' variant='B-4'>
            {t('Select the addresses you’d like to include in {{profileLabel}} profile', { replace: { profileLabel: maybeNewName ?? profileLabel } })}
          </Typography>
          <Stack direction='column' sx={{ height: '350px', mt: '25px', overflow: 'scroll', width: '100%' }}>
            {Object.entries(categorizedAccounts)?.map(([label, accounts]) => {
              return (
                <>
                  {
                    !!accounts?.length &&
                    <ProfileAccountSelection
                      accounts={accounts}
                      defaultProfile={profileLabel}
                      key={label}
                      label={label}
                      maybeNewName={label === profileLabel ? maybeNewName : undefined}
                      selectedAddresses={selectedAddresses}
                      setSelectedAddresses={setSelectedAddresses}
                    />
                  }
                </>
              );
            })}
          </Stack>
          <DecisionButtons
            cancelButton
            direction='horizontal'
            isBusy={isBusy}
            onPrimaryClick={onEdit}
            onSecondaryClick={handleClose}
            primaryBtnText={t('Apply')}
            secondaryBtnText={t('Skip')}
            style={{ bottom: 0, position: 'absolute' }}
          />
        </Grid>
      }
    </ExtensionPopup>
  );
}

export default EditProfile;
