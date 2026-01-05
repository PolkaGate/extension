// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { Folder } from 'iconsax-react';
import React, { useCallback, useState } from 'react';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { DecisionButtons, GradientButton, MyTextField, TwoToneText } from '../../components';
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

function EditProfile({ profileLabel, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const allAccounts = useAccountsOrder();
  const profileAccounts = useProfileAccounts(allAccounts, profileLabel);
  const { categorizedAccounts } = useCategorizedAccountsInProfiles();

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [maybeNewName, setName] = useState<string | null>();
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(STEP.EDIT_NAME);

  const handleClose = useCallback(() => setPopup(false), [setPopup]);

  const onNext = useCallback(() => {
    setStep(STEP.CHOOSE_ACCOUNTS);
  }, []);

  const onEdit = useCallback(async () => {
    setIsBusy(true);

    const cleanedProfiles = new Map<string, string>();

    await Promise.all(profileAccounts?.map(async (account) => {
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
  }, [handleClose, allAccounts, maybeNewName, profileAccounts, profileLabel, selectedAddresses]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  return (
    <SharePopup
      modalProps={{
        dividerStyle: { margin: '5px 0 20px' }
      }}
      modalStyle={{ minHeight: '200px' }}
      onClose={handleClose}
      open={!!profileLabel}
      popupProps={{
        TitleIcon: Folder,
        iconSize: 24,
        iconVariant: 'Bulk',
        maxHeight: '100%',
        withoutTopBorder: true
      }}
      title={t('Edit profile')}
    >
      <>
        {step === STEP.EDIT_NAME &&
          <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
            <Typography color='#BEAAD8' variant='B-4'>
              {t('You can give the profile a new name')}
            </Typography>
            <MyTextField
              Icon={Folder}
              focused
              iconSize={18}
              inputValue={maybeNewName}
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
              <TwoToneText
                color={theme.palette.text.primary}
                text={t('Select the addresses you’d like to include in {{profileLabel}} profile', { replace: { profileLabel: maybeNewName ?? profileLabel } })}
                textPartInColor={maybeNewName ?? profileLabel ?? ''}
              />
            </Typography>
            <Stack direction='column' sx={{ height: '350px', mt: '25px', overflowY: 'auto', width: '100%' }}>
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
      </>
    </SharePopup>
  );
}

export default EditProfile;
