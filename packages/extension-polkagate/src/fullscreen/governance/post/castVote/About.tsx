// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { Grid, Typography } from '@mui/material';
import React, { useCallback, useState } from 'react';

import { Checkbox2 as Checkbox, PButton } from '../../../../components';
import { useTranslation } from '../../../../hooks';

interface Props {
  setStep: React.Dispatch<React.SetStateAction<number>>;
  nextStep: number;
}

export default function About({ nextStep, setStep }: Props): React.ReactElement {
  const { t } = useTranslation();
  const [dontDisplay, setDisplayText] = useState<boolean>(false);

  const UL = ({ notes, title }: { title?: string, notes: string[] }) => {
    return (
      <Grid container direction='column' pt='15px'>
        {title &&
          <Grid container item>
            <Typography fontSize='14px' fontWeight={500}>
              {title}
            </Typography>
          </Grid>
        }
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
    dontDisplay && window.localStorage.setItem('cast_vote_about_disabled', 'true');
    setStep(nextStep);
  }, [dontDisplay, nextStep, setStep]);

  return (
    <Grid container direction='column'>
      <Grid container item justifyContent='center' pb='30px' pt='45px'>
        <Typography fontSize='22px' fontWeight={700}>
          {t('Some important information')}
        </Typography>
      </Grid>
      <Grid container item sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'secondary.light', borderRadius: '5px', display: 'block', pt: '20px', px: '15px', height: '270px' }}>
        <Grid container item>
          <UL
            notes={[t('Locking tokens for a referendum boosts voting power, but it\'s optional.')]}
          />
        </Grid>
        <Grid container item>
          <UL
            notes={[t('After a successful referendum vote, users can unlock their tokens once the unlock period expires.')]}
          />
        </Grid>
        <Grid container item>
          <UL
            notes={[t('Votes can be revoked in ongoing, cancelled, or after-ended referenda if they were opposed or lacked conviction.')]}
          />
        </Grid>
      </Grid>
      <Grid container item pt='25px'>
        <Checkbox
          checked={dontDisplay}
          iconStyle={{ transform: 'scale(1.2)' }}
          label={t('Don\'t show this again.')}
          labelStyle={{ fontSize: '14px', marginLeft: '7px' }}
          onChange={toggleShow}
          style={{ width: '92%' }}
        />
      </Grid>
      <Grid container item>
        <PButton
          _ml={0}
          _onClick={handleNext}
          text={t('Next')}
        />
      </Grid>
    </Grid>
  );
}
