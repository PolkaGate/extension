// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { Grid, Stack, Typography, useTheme } from '@mui/material';
import { Folder } from 'iconsax-react';
import React, { useCallback, useContext, useState } from 'react';

import { updateMeta } from '@polkadot/extension-polkagate/src/messaging';
import { SharePopup } from '@polkadot/extension-polkagate/src/partials';

import { AccountContext, DecisionButtons, GradientButton, MyTextField, TwoToneText } from '../../components';
import { useCategorizedAccountsInProfiles, useTranslation } from '../../hooks';
import ProfileAccountSelection from './ProfileAccountSelection';
import { PROFILE_MODE } from './type';
import { addProfileTag } from './utils';

interface Props {
  defaultMode: PROFILE_MODE;
  setPopup: React.Dispatch<React.SetStateAction<PROFILE_MODE>>;
}

enum STEP {
  ADD_NAME,
  CHOOSE_ACCOUNTS
}

function NewProfile({ defaultMode, setPopup }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const { accounts } = useContext(AccountContext);
  const { categorizedAccounts } = useCategorizedAccountsInProfiles();

  const [isBusy, setIsBusy] = useState<boolean>(false);
  const [profileName, setName] = useState<string | null>();
  const [selectedAddresses, setSelectedAddresses] = useState<Set<string>>(new Set());
  const [step, setStep] = useState(STEP.ADD_NAME);

  const handleClose = useCallback(() =>
    setPopup(defaultMode ?? PROFILE_MODE.NONE)
    ,
    [defaultMode, setPopup]);

  const onNext = useCallback(() => {
    setStep(STEP.CHOOSE_ACCOUNTS);
  }, []);

  const onAdd = useCallback(async () => {
    if (!profileName) { // won't happen
      return;
    }

    setIsBusy(true);

    await Promise.all(accounts?.map(async (account) => {
      let newProfileString;
      let metaData;

      if (selectedAddresses.has(account.address)) {
        newProfileString = addProfileTag(account.profile, profileName);
        metaData = JSON.stringify({
          profile: newProfileString === '' ? null : newProfileString
        });

        await updateMeta(account.address, metaData);
      }
    }) || []).finally(() => {
      setIsBusy(false);
      handleClose();
    });
  }, [accounts, handleClose, profileName, selectedAddresses]);

  const onNameChange = useCallback((name: string | null) => setName(name), []);

  return (
    <SharePopup
      modalProps={{ showBackIconAsClose: true }}
      modalStyle={{ minHeight: '200px', padding: '20px' }}
      onClose={handleClose}
      open={true}
      popupProps={{
        TitleIcon: Folder,
        iconSize: 24,
        iconVariant: 'Bulk',
        maxHeight: '100%',
        pt: 20,
        withoutTopBorder: true
      }}
      title={t('New profile')}
    >
      <Grid container item>
        {step === STEP.ADD_NAME &&
          <Grid alignItems='center' container direction='column' item justifyContent='start' sx={{ height: '450px', pb: '20px', position: 'relative', zIndex: 1 }}>
            <Typography color='#BEAAD8' variant='B-4'>
              {t('Give a name to the profile')}
            </Typography>
            <MyTextField
              Icon={Folder}
              focused
              iconSize={18}
              inputValue={profileName}
              onEnterPress={onNext}
              onTextChange={onNameChange}
              placeholder={t('Enter a name')}
              style={{ margin: '20px 0 30px' }}
              title={t('Profile name')}
            />
            <GradientButton
              contentPlacement='center'
              disabled={!profileName}
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
                text={t('Select the addresses you’d like to include in {{profileLabel}} profile', { replace: { profileLabel: profileName } })}
                textPartInColor={profileName ?? ''}
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
                        key={label}
                        label={label}
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
              disabled={!selectedAddresses.size}
              isBusy={isBusy}
              onPrimaryClick={onAdd}
              onSecondaryClick={handleClose}
              primaryBtnText={t('Add {{num}} address{{es}}', { replace: { num: selectedAddresses.size, es: selectedAddresses.size > 1 ? 'es' : '' } })}
              secondaryBtnText={t('Skip')}
              style={{ bottom: 0, position: 'absolute' }}
            />
          </Grid>
        }
      </Grid>
    </SharePopup>
  );
}

export default NewProfile;
