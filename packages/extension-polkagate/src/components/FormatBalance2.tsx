// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable header/header */

import type BN from 'bn.js';
import type { Compact } from '@polkadot/types';
import type { INumber } from '@polkadot/types-codec/types';

import React, { type CSSProperties, useMemo } from 'react';

import { formatBalance, isString } from '@polkadot/util';

import { useIsHideNumbers, useTranslation } from '../hooks';
import { FLOATING_POINT_DIGIT } from '../util/constants';
import { Dots } from '.';

type LabelPost = string | React.ReactNode
interface Props {
  decimals: number[],
  tokens: string[],
  children?: React.ReactNode;
  format?: [number, string];
  formatIndex?: number;
  isShort?: boolean;
  label?: React.ReactNode;
  labelPost?: LabelPost;
  value?: Compact<INumber> | BN | string | null; // 'all'
  valueFormatted?: string;
  style?: CSSProperties;
  withCurrency?: boolean;
  withSi?: boolean;
  decimalPoint?: number;
}

const K_LENGTH = 3 + 1;

function getFormat (decimals: number[], tokens: string[], formatIndex = 0): [number, string] {
  return [
    formatIndex < decimals.length
      ? decimals[formatIndex]
      : decimals[0],
    formatIndex < tokens.length
      ? tokens[formatIndex]
      : tokens[1]
  ];
}

function createElement (prefix: string, postfix: string, unit: string, label: LabelPost = '', isShort = false, decimalPoint: number): React.ReactNode {
  return <>{`${prefix}${isShort ? '' : '.'}`}{!isShort && <span>{`00${postfix?.slice(0, decimalPoint) || ''}`.slice(-decimalPoint)}</span>}<span> {unit}</span>{label}</>;
}

function splitFormat (value: string, decimalPoint: number, label?: LabelPost, isShort?: boolean): React.ReactNode {
  const [prefix, postfixFull] = value.split('.');
  const [postfix, unit] = postfixFull.split(' ');

  return createElement(prefix, postfix, unit, label, isShort, decimalPoint);
}

function applyFormat (decimalPoint: number, value: Compact<INumber> | BN | string, [decimals, token]: [number, string], withCurrency = true, withSi?: boolean, _isShort?: boolean, labelPost?: LabelPost): React.ReactNode {
  const [prefix, postfix] = formatBalance(value, { decimals, forceUnit: '-', withSi: false }).split('.');
  const isShort = _isShort || (withSi && prefix.length >= K_LENGTH);
  const unitPost = withCurrency ? token : '';

  if (prefix.length > K_LENGTH) {
    const [major, rest] = formatBalance(value, { decimals, withUnit: false }).split('.');
    const minor = rest.slice(0, decimalPoint);
    const unit = rest.slice(4);

    return <>{major}.<span>{minor}</span><span>{unit}{unit ? unitPost : ` ${unitPost}`}</span>{labelPost || ''}</>;
  }

  return createElement(prefix, postfix, unitPost, labelPost, isShort, decimalPoint);
}

function FormatBalance ({ children, decimalPoint = FLOATING_POINT_DIGIT, decimals, format, formatIndex, isShort, label, labelPost, style, tokens, value, valueFormatted, withCurrency, withSi }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const { isHideNumbers } = useIsHideNumbers();

  const formatInfo = useMemo(() =>
    format || getFormat(decimals, tokens, formatIndex)
  , [decimals, tokens, format, formatIndex]);

  return (
    <div style={{ ...style }}>
      {label
        ? <>{label}&nbsp;</>
        : ''
      }
      <span>
        { isHideNumbers
          ? <Dots
            color={style?.color}
            postText={tokens[0]}
            postTextStyle={style}
            style='small'
          />
          : valueFormatted
            ? splitFormat(valueFormatted, decimalPoint, labelPost, isShort)
            : value
              ? value === 'all'
                ? <>{t('everything')}{labelPost || ''}</>
                : applyFormat(decimalPoint, value, formatInfo, withCurrency, withSi, isShort, labelPost)
              : isString(labelPost)
                ? `-${labelPost}`
                : labelPost
        }
      </span>
      {children}
    </div>
  );
}

export default React.memo(FormatBalance);
