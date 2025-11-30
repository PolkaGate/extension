// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Icon } from 'iconsax-react';
//@ts-ignore
import type { PalletConvictionVotingVoteAccountVote } from '@polkadot/types/lookup';
import type { AnyTuple } from '@polkadot/types-codec/types';
import type { BN } from '@polkadot/util';

import { Stack, Typography, useTheme } from '@mui/material';
import { Dislike, Like1, MinusCirlce, Scissor } from 'iconsax-react';
import React, { useMemo } from 'react';

import { DisplayBalance, TwoToneText } from '../../../../../components';
import { useChainInfo, useTranslation } from '../../../../../hooks';

interface Props {
  args: AnyTuple;
  genesisHash: string;
}

function ConvictionVotingVote ({ args, genesisHash }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const theme = useTheme();

  const { decimal, token } = useChainInfo(genesisHash, true);
  const rfIndex = String(args[0]);
  const vote = args[1] as unknown as PalletConvictionVotingVoteAccountVote;

  const { Icon, balance, iconColor, iconStyle = {}, text, textInColor } = useMemo((): { Icon: Icon, balance?: BN, iconColor: string, iconStyle?: React.CSSProperties, text: string, textInColor?: string } => {
    const defaultCase = {
      Icon: MinusCirlce,
      iconColor: theme.palette.nay.main,
      text: t('Vote on referendum {{rfIndex}}', { replace: { rfIndex } })
    };

    try {
      const hVote = vote.toPrimitive();
      const key = Object.keys(hVote)[0];

      switch (key) {
        case 'standard':
          {
            const { balance, vote: { aye, conviction } } = hVote[key] as unknown as { balance: BN, vote: { aye: boolean, conviction: string } };
            const voteType = aye ? 'AYE' : 'NAY';
            const convictionCount = Number(conviction.match(/\d+/)?.[0]);

            return {
              Icon: aye ? Like1 : Dislike,
              balance,
              iconColor: aye ? theme.palette.success.main : theme.palette.warning.main,
              iconStyle: aye ? {} : { transform: 'scaleX(-1)' },
              text: t('{{voteType}} on ref {{rfIndex}} ({{convictionCount}}x multiplier)', { replace: { convictionCount, rfIndex, voteType } }),
              textInColor: t('{{convictionCount}}x', { replace: { convictionCount } })
            };
          }

        case 'split':
          {
            // const { aye, nay } = hVote[key];

            return {
              Icon: Scissor,
              iconColor: theme.palette.nay.main,
              text: t('Split Vote on referendum {{rfIndex}}', { replace: { rfIndex } })
            };
          }

        case 'splitAbstain':
          {
            // const { abstain, aye, nay } = hVote[key];

            return {
              Icon: MinusCirlce,
              iconColor: theme.palette.nay.main,
              text: t('Split Abstain vote on referendum {{rfIndex}}', { replace: { rfIndex } })
            };
          }

        default:
          {
            return defaultCase;
          }
      }
    } catch (e) {
      console.error('Something went wrong while checking governance transaction:', e);

      return defaultCase;
    }
  }, [rfIndex, t, theme.palette.nay.main, theme.palette.success.main, theme.palette.warning.main, vote]);

  return (
    <Stack alignItems='center' columnGap='10px' direction='row' justifyContent='start'>
      <Icon
        color={iconColor}
        size={30}
        style={iconStyle}
        variant='Bulk'
      />
      <Stack alignItems='flex-start' direction='column'>
        {balance &&
          <DisplayBalance
            balance={balance}
            decimal={decimal}
            decimalPoint={2}
            style={{ color: '#EAEBF1', ...theme.typography['B-2'] }}
            token={token}
          />
        }
        <Stack alignItems='center' columnGap='5px' direction='row'>
          <Typography color='#BEAAD8' sx={{ textWrapMode: 'noWrap' }} variant='B-4'>
            <TwoToneText
              color={theme.palette.text.primary}
              text={text}
              textPartInColor={textInColor ?? ''}
            />
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}

export default React.memo(ConvictionVotingVote);
