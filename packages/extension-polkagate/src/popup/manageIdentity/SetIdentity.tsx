// Copyright 2019-2023 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ApiPromise } from '@polkadot/api';
import { DeriveAccountRegistration } from '@polkadot/api-derive/types';
import { BN, BN_ZERO } from '@polkadot/util';

import { PButton, ShowBalance } from '../../components';
import { useTranslation } from '../../components/translate';
import { isEmail, isUrl } from '../../util/utils';
import SetIdentityForm from './partial/SetIdentityForm';
import { Mode, STEPS } from '.';

interface Props {
  api: ApiPromise | null | undefined;
  identity?: DeriveAccountRegistration | null;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  setIdentityToSet: React.Dispatch<React.SetStateAction<DeriveAccountRegistration | null | undefined>>;
  setDepositValue: React.Dispatch<React.SetStateAction<BN>>;
  basicDeposit: BN | undefined;
  fieldDeposit: BN | undefined;
  totalDeposit: BN;
  setMode: React.Dispatch<React.SetStateAction<Mode>>;
}

export default function PreviewIdentity({ api, basicDeposit, fieldDeposit, identity, setDepositValue, setIdentityToSet, setMode, setStep, totalDeposit }: Props): React.ReactElement {
  const { t } = useTranslation();

  const [display, setDisplay] = useState<string | undefined>();
  const [legal, setLegal] = useState<string | undefined>();
  const [email, setEmail] = useState<string | undefined>();
  const [website, setWebsite] = useState<string | undefined>();
  const [twitter, setTwitter] = useState<string | undefined>();
  const [riot, setRiot] = useState<string | undefined>();
  const [discord, setDiscord] = useState<string | undefined>();

  useEffect(() => {
    if (!basicDeposit || !fieldDeposit) {
      return;
    }

    const totalDeposit = basicDeposit.add(discord ? fieldDeposit : BN_ZERO);

    setDepositValue(totalDeposit);
  }, [basicDeposit, discord, display, email, fieldDeposit, legal, riot, setDepositValue, twitter, website]);

  useEffect(() => {
    if (!display) {
      return;
    }

    setIdentityToSet({
      display,
      email,
      image: undefined,
      judgements: [],
      legal,
      other: discord ? { discord } : {},
      riot,
      twitter,
      web: website
    });
  }, [discord, display, email, legal, riot, setIdentityToSet, twitter, website]);

  const nextBtnDisable = useMemo(() => !!(!display || (email && !isEmail(email)) || (website && !isUrl(website))), [display, email, website]);

  const goReview = useCallback(() => {
    setMode('Set');
    setStep(STEPS.REVIEW);
  }, [setStep, setMode]);

  // const hasBeenSet = useCallback((value: string | null | undefined) => {
  //   if (value === 'None' || value === null || value === undefined) {
  //     return undefined;
  //   } else {
  //     return value;
  //   }
  // }, []);

  // useEffect(() => {
  //   if (!identity) {
  //     return;
  //   }

  //   setDisplay(hasBeenSet(identity.display));
  //   setLegal(hasBeenSet(identity.legal));
  //   setEmail(hasBeenSet(identity.email));
  //   setWebsite(hasBeenSet(identity.web));
  //   setTwitter(hasBeenSet(identity.twitter));
  //   setRiot(hasBeenSet(identity.riot));
  //   setDiscord(hasBeenSet(identity.other?.discord));
  // }, [hasBeenSet, identity]);

  return (
    <Grid container item sx={{ display: 'block', px: '10%' }}>
      <Typography fontSize='22px' fontWeight={700} pb='25px' pt='40px'>
        {t<string>('Set On-chain Identity')}
      </Typography>
      <Typography fontSize='14px' fontWeight={400}>
        {t<string>('Polkadot provides a naming system that allows participants to add personal information to their on-chain account and subsequently ask for verification of this information by registrars.')}
      </Typography>
      <SetIdentityForm
        discord={discord}
        display={display}
        email={email}
        identity={identity}
        legal={legal}
        riot={riot}
        setDiscord={setDiscord}
        setDisplay={setDisplay}
        setEmail={setEmail}
        setLegal={setLegal}
        setRiot={setRiot}
        setTwitter={setTwitter}
        setWeb={setWebsite}
        twitter={twitter}
        web={website}
      />
      <Grid alignItems='center' container item justifyContent='space-between' m='auto' pt='15px'>
        <Grid container item sx={{ width: 'fit-content' }}>
          <Typography fontSize='16px' fontWeight={400} lineHeight='23px'>
            {t<string>('Deposit:')}
          </Typography>
          <Grid item lineHeight='22px' pl='5px'>
            <ShowBalance
              api={api}
              balance={totalDeposit}
              decimalPoint={4}
              height={22}
            />
          </Grid>
        </Grid>
        <Grid container item width='40%'>
          <PButton
            _mt='1px'
            _onClick={goReview}
            disabled={nextBtnDisable}
            text={t<string>('Next')}
          />
        </Grid>
      </Grid>
    </Grid>
  );
}
