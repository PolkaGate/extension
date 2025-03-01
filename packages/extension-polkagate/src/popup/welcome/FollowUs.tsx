// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import { faGithubSquare, faSquareXTwitter, faYoutubeSquare, type IconDefinition } from '@fortawesome/free-brands-svg-icons';
import { faComments } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Grid, Link, Typography, useTheme } from '@mui/material';
import React, { useEffect, useState } from 'react';

import { useTranslation } from '../../hooks';

const Icon = ({ bounce = false, icon, link }: { link: string, icon: IconDefinition, bounce?: boolean }) => {
  const theme = useTheme();

  return (
    <Link href={link} rel='noreferrer' target='_blank'>
      <FontAwesomeIcon
        bounce={bounce}
        fontSize='16px'
        icon={icon}
        // eslint-disable-next-line react/jsx-no-bind, no-return-assign
        onMouseEnter={(e) => e.currentTarget.style.color = `${theme.palette.secondary.light}`}
        // eslint-disable-next-line react/jsx-no-bind, no-return-assign
        onMouseLeave={(e) => e.currentTarget.style.color = `${theme.palette.text.primary}`}
        style={{
          color: `${theme.palette.text.primary}`,
          cursor: 'pointer',
          transition: 'color 0.3s'
        }}
      />
    </Link>
  );
};

function FollowUs({ width }: { width: string }): React.ReactElement {
  const { t } = useTranslation();
  const ICON_COUNTS = 4;
  const DEFAULT_BOUNCING = Array(ICON_COUNTS).fill(false) as boolean[];
  const [bounce, setBounce] = useState<boolean[]>(DEFAULT_BOUNCING);

  useEffect(() => {
    const interval = setInterval(() => {
      setBounce((prev) => {
        const bouncingIndex = prev.findIndex((i) => i);

        if (bouncingIndex === ICON_COUNTS - 1) { // if the last icon is bouncing
          clearInterval(interval); // stop the bouncing after one row

          return DEFAULT_BOUNCING;
        }

        const newBounce = [...prev];

        newBounce[bouncingIndex + 1] = true;

        if (bouncingIndex !== -1) {
          newBounce[bouncingIndex] = false;
        }

        return newBounce;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Grid alignItems='flex-start' bgcolor='background.default' container item justifyContent='flex-start' width={width}>
      <Grid alignItems='center' columnGap='10px' container justifyContent='center' justifyItems='center' width='fit-content'>
        <Typography fontSize='14px' lineHeight={1}>
          {t('Social Media')}
        </Typography>
        <Icon
          bounce={bounce[0]}
          icon={faSquareXTwitter}
          link='https://twitter.com/@polkagate'
        />
        <Icon
          bounce={bounce[1]}
          icon={faYoutubeSquare}
          link='https://youtube.com/@polkagate'
        />
        <Icon
          bounce={bounce[2]}
          icon={faGithubSquare}
          link='https://github.com/polkagate'
        />
        <Icon
          bounce={bounce[3]}
          icon={faComments}
          link='https://matrix.to/#/#polkagate:matrix.org'
        />
      </Grid>
    </Grid>
  );
}

export default React.memo(FollowUs);
