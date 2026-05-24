// Copyright 2019-2026 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ArrowForwardIosRounded as ArrowForwardIosRoundedIcon } from '@mui/icons-material';
import { Divider, Grid, Typography, useTheme } from '@mui/material';
// @ts-ignore
import { Circle } from 'better-react-spinkit';
import React from 'react';

import { noop } from '@polkadot/util';

export enum popupNumbers {
  LOCKED_IN_REFERENDA,
  FORGET_ACCOUNT,
  RENAME,
  EXPORT_ACCOUNT,
  DERIVE_ACCOUNT,
  RECEIVE,
  HISTORY
}

interface TaskButtonProps {
  disabled?: boolean;
  dividerWidth?: string;
  icon: React.JSX.Element;
  loading?: boolean;
  mr?: string;
  noBorderButton?: boolean;
  onClick: () => void;
  secondaryIconType: 'popup' | 'page';
  text: string;
  show?: boolean;
}

export const openOrFocusTab = (relativeUrl: string, closeCurrentTab?: boolean): void => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]?.url) {
      const extensionUrl = tabs[0].url;
      const extensionBaseUrl = extensionUrl.split('#')[0];

      const tabUrl = `${extensionBaseUrl}#${relativeUrl}`;

      chrome.tabs.query({}, function (allTabs) {
        const existingTab = allTabs.find(function (tab) {
          return tab.url === tabUrl;
        });

        if (existingTab?.id) {
          chrome.tabs.update(existingTab.id, { active: true }).catch(console.error);
        } else {
          chrome.tabs.create({ url: tabUrl }).catch(console.error);
        }

        closeCurrentTab && window.close();
      });
    } else {
      console.error('Unable to retrieve extension URL.');
    }
  });
};

export const TaskButton = ({ disabled, dividerWidth = '66%', icon, loading, mr = '25px', noBorderButton = false, onClick, secondaryIconType, show = true, text }: TaskButtonProps) => {
  const theme = useTheme();

  return (
    <>
      {show &&
        <>
          <Grid alignItems='center' container item justifyContent='space-between' onClick={disabled ? noop : onClick} sx={{ '&:hover': { bgcolor: disabled ? 'transparent' : 'divider' }, borderRadius: '5px', cursor: disabled ? 'default' : 'pointer', m: 'auto', minHeight: '45px', p: '5px 10px' }} width='90%'>
            <Grid container item mr={mr} xs={1.5}>
              {icon}
            </Grid>
            <Grid container item xs>
              <Typography color={disabled ? theme.palette.action.disabledBackground : theme.palette.text.primary} fontSize='16px' fontWeight={500}>
                {text}
              </Typography>
            </Grid>
            {secondaryIconType === 'page' && !loading &&
              <Grid alignItems='center' container item justifyContent='flex-end' xs={2}>
                <ArrowForwardIosRoundedIcon sx={{ color: disabled ? 'text.disabled' : 'secondary.light', fontSize: '26px', stroke: disabled ? theme.palette.text.disabled : theme.palette.secondary.light, strokeWidth: 1 }} />
              </Grid>
            }
            {loading &&
              <Circle
                color={theme.palette.primary.main}
                scaleEnd={0.7}
                scaleStart={0.4}
                size={25}
              />
            }
          </Grid>
          {!noBorderButton &&
            <Divider sx={{ bgcolor: 'divider', height: '2px', justifySelf: 'flex-end', m: '5px 15px', width: dividerWidth }} />
          }
        </>
      }
    </>
  );
};
