// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { FormControl, Grid, RadioGroup, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { AccountInputWithIdentity, Infotip2, TwoButtons } from '../../../components';
import { useApi, useChain, useFormatted, useTranslation } from '../../../hooks';
import { LoadingSkeleton } from './partial/ReferendaTracks';
import TAccountsDisplay from './TAccountDisplay';
import { DELEGATE_STEPS, DelegateInformation } from '.';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setDelegateInformation: React.Dispatch<React.SetStateAction<DelegateInformation | undefined>>;
}

export default function ChooseDelegator ({ setDelegateInformation, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const { address } = useParams<{ address: string }>();
  const myFormattedAddress = useFormatted(address);
  const chain = useChain(address);
  const api = useApi(address);
  const theme = useTheme();

  const [delegatorAddress, setDelegatorAddress] = useState<string | null | undefined>();
  const [selectedTrustedAddress, setSelectedTrustedAddress] = useState<string | undefined>();
  const [trustedAccounts, setTrustedAccounts] = useState<string[] | undefined>();

  const nextDisable = useMemo(() => (!delegatorAddress && !selectedTrustedAddress), [delegatorAddress, selectedTrustedAddress]);

  const getTrustedAccountsFromGithub = useCallback(() => {
    fetch('https://raw.githubusercontent.com/PolkaGate/polkagate-extension/main/trustedDelegationAccounts.json').then((response) => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      return response.json();
    }).then((data) => {
      try {
        const arrayData = Object.values(data as object);

        setTrustedAccounts(arrayData);
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
    }).catch((error) => {
      console.error('Error fetching file:', error);
    });
  }, []);

  useEffect(() => {
    getTrustedAccountsFromGithub();
  }, [getTrustedAccountsFromGithub]);

  useEffect(() => {
    if (!delegatorAddress && !selectedTrustedAddress) {
      return;
    }

    setDelegateInformation((information) => {
      if (!information) {
        return undefined;
      }

      information.delegateeAddress = selectedTrustedAddress ?? delegatorAddress;

      return information;
    });
  }, [delegatorAddress, selectedTrustedAddress, setDelegateInformation]);

  const onSelectTrustedAccount = useCallback((event: React.ChangeEvent<HTMLInputElement>, value: string) => {
    setSelectedTrustedAddress(value);
  }, []);

  const onClearTrustedAddress = useCallback(() => {
    setSelectedTrustedAddress(undefined);
  }, []);

  const goReview = useCallback(() => {
    setStep(DELEGATE_STEPS.REVIEW);
  }, [setStep]);

  const goBack = useCallback(() => {
    setStep(DELEGATE_STEPS.INDEX);
  }, [setStep]);

  return (
    <Grid container direction='column'>
      <Grid container item>
        <AccountInputWithIdentity
          address={delegatorAddress}
          chain={chain}
          helperText={t<string>('Enter the account address that you want to delegate to')}
          ignoreAddress={String(myFormattedAddress)}
          label={t('Delegate to Account')}
          setAddress={setDelegatorAddress}
          style={{ pt: '15px' }}
        />
      </Grid>
      <Typography py='20px' textAlign='left'>
        {t<string>('Or')}
      </Typography>
      <Grid container item>
        <Grid container justifyContent='space-between' pb='5px'>
          <Grid item>
            <Infotip2 iconTop={26} showQuestionMark text={'TODO'}>
              <Typography fontSize='16px' fontWeight={400} sx={{ textAlign: 'left' }}>
                {t('Choose from Trusted Accounts')}
              </Typography>
            </Infotip2>
          </Grid>
          <Grid item onClick={onClearTrustedAddress}>
            <Typography fontSize='16px' fontWeight={400} sx={{ color: selectedTrustedAddress ? theme.palette.mode === 'dark' ? 'text.primary' : 'primary.main' : theme.palette.text.disabled, cursor: selectedTrustedAddress ? 'pointer' : 'default', textAlign: 'left', textDecorationLine: 'underline' }}>
              {t('Clear')}
            </Typography>
          </Grid>
        </Grid>
        <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.main', borderRadius: '5px', display: 'block', height: '360px', maxHeight: '360px', overflowY: 'scroll' }}>
          {trustedAccounts
            ? <FormControl fullWidth>
              <RadioGroup onChange={onSelectTrustedAccount} row>
                {trustedAccounts.map((trustedAccount) => (
                  <TAccountsDisplay address={trustedAccount} api={api} chain={chain} key={trustedAccount} selectedTrustedAddress={selectedTrustedAddress} />
                ))}
              </RadioGroup>
            </FormControl>
            : <LoadingSkeleton skeletonsNum={15} />
          }
        </Grid>
      </Grid>
      <Grid container item sx={{ '> div': { ml: 0, width: '100%' } }}>
        <TwoButtons
          disabled={nextDisable}
          mt='15px'
          onPrimaryClick={goReview}
          onSecondaryClick={goBack}
          primaryBtnText={t<string>('Next')}
          secondaryBtnText={t<string>('Back')}
        />
      </Grid>
    </Grid>
  );
}
