// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2 as Checkbox, PButton } from '../../../components';
import { useTranslation } from '../../../hooks';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
}

export default function DelegateNote ({ setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [dontDisplay, setDisplayText] = useState<boolean>(false);

  const UL = ({ notes, title }: { title: string, notes: string[] }) => {
    return (
      <Grid container direction='column' pt='15px'>
        <Grid container item>
          <Typography fontSize='14px' fontWeight={500}>
            {title}
          </Typography>
        </Grid>
        <Grid container item>
          <ul style={{ margin: 0, paddingLeft: '25px' }}>
            {notes.map((note, index) => (
              <li key={index}>
                <Typography fontSize='14px' fontWeight={400} lineHeight='20px' textAlign='left'>
                  {note}
                </Typography>
              </li>
            ))}
          </ul>
        </Grid>
      </Grid>
    );
  };

  const toggleShow = useCallback(() => setDisplayText(!dontDisplay), [dontDisplay]);
  const handleNext = useCallback(() => {
    // eslint-disable-next-line no-void
    dontDisplay && window.localStorage.setItem('DelegateNoteDisable', 'true');
    setStep(1);
  }, [dontDisplay, setStep]);

  return (
    <Grid container direction='column'>
      <Grid container item justifyContent='center' pb='20px' pt='45px'>
        <Typography fontSize='22px' fontWeight={700}>
          {t<string>('Some important information')}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', pb: '15px', px: '15px' }}>
        <Grid container item>
          <UL
            notes={[t<string>('Delegation empowers trusted individuals  to vote on your behalf.')]}
            title={t<string>('What is Vote Delegation?')}
          />
        </Grid>
        <Grid container item>
          <UL
            notes={[
              t<string>('Delegate to experienced voters for better decisions.'),
              t<string>('Stay involved even if you\'re unable to actively vote.')
            ]}
            title={t<string>('Why Consider Vote Delegation?')}
          />
        </Grid>
        <Grid container item>
          <UL
            notes={[
              t<string>('You can give your vote power to another account with a vote multiplier.'),
              t<string>('The duration of your tokens\' lock period depends on the selected multiplier.'),
              t<string>('You can choose to delegate votes in all tracks or specific ones.'),
              t<string>('If you have already voted in a category, it cannot be selected for delegation.')
            ]}
            title={t<string>('Important Information:')}
          />
        </Grid>
      </Grid>
      <Grid container item pt='25px'>
        <Checkbox
          checked={dontDisplay}
          iconStyle={{ transform: 'scale(1.2)' }}
          label={t<string>('Don\'t show this again.')}
          labelStyle={{ fontSize: '14px', marginLeft: '7px' }}
          onChange={toggleShow}
          style={{ width: '92%' }}
        />
      </Grid>
      <Grid container item>
        <PButton
          _ml={0}
          _mt='15px'
          _onClick={handleNext}
          _width={100}
          text={t<string>('Next')}
        />
      </Grid>
    </Grid>
  );
}
