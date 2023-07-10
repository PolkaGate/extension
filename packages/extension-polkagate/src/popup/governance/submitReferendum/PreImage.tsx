// Copyright 2019-2023 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable react/jsx-max-props-per-line */

import type { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import type { Codec, Registry, TypeDef } from '@polkadot/types/types';

import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { Button, Grid, Skeleton, Typography, useTheme } from '@mui/material';
import React, { useMemo } from 'react';

import { getTypeDef } from '@polkadot/types';
import { formatNumber, isUndefined } from '@polkadot/util';

import { CopyAddressButton, ShowBalance, Warning } from '../../../components';
import { useApi, useDecimal, useFormatted, usePreImage, useToken, useTranslation } from '../../../hooks';
import getInitValue from './initValues';

interface Props {
  address: string | undefined;
  hash: Hash | `0x${string}` | FrameSupportPreimagesBounded | null | undefined;
  key: number;
}

interface Param {
  name: string;
  type: TypeDef;
}

interface Value {
  isValid: boolean;
  value: Codec;
}

export interface ParamDef {
  length?: number;
  name?: string;
  type: TypeDef;
}

export type RawParamValue = unknown | undefined;
export type RawParamValueArray = (RawParamValue | RawParamValue[])[];

export type RawParamValues = RawParamValue | RawParamValueArray;

export interface RawParam {
  isValid: boolean;
  value: RawParamValues;
}

export type RawParams = RawParam[];

export function createValue(registry: Registry, param: { type: TypeDef }): RawParam {
  const value = getInitValue(registry, param.type);

  return {
    isValid: !isUndefined(value),
    value
  };
}

export default function createValues(registry: Registry, params: { type: TypeDef }[]): RawParam[] {
  return params.map((param) => createValue(registry, param));
}

function splitSingle(value: string[], sep: string): string[] {
  return value.reduce((result: string[], value: string): string[] => {
    return value.split(sep).reduce((result: string[], value: string) => result.concat(value), result);
  }, []);
}

function splitParts(value: string): string[] {
  return ['[', ']'].reduce((result: string[], sep) => splitSingle(result, sep), [value]);
}

interface Meta {
  docs: Text[];
}

function formatMeta(meta?: Meta): [React.ReactNode, React.ReactNode] | null {
  if (!meta || !meta.docs.length) {
    return null;
  }

  const strings = meta.docs.map((d) => d.toString().trim());
  const firstEmpty = strings.findIndex((d) => !d.length);
  const combined = (
    firstEmpty === -1
      ? strings
      : strings.slice(0, firstEmpty)
  ).join(' ').replace(/#(<weight>| <weight>).*<\/weight>/, '');
  const parts = splitParts(combined.replace(/\\/g, '').replace(/`/g, ''));

  return [
    parts[0].split(/[.(]/)[0],
    <>{parts.map((part, index) => index % 2 ? <em key={index}>[{part}]</em> : <span key={index}>{part}</span>)}&nbsp;</>
  ];
}

export function PreImage({ address, hash, key }: Props): React.ReactElement<Props> {
  const { t } = useTranslation();
  const decimal = useDecimal(address);
  const api = useApi(address);
  const token = useToken(address);
  const formatted = useFormatted(address);
  const theme = useTheme();
  const preImage = usePreImage(address, hash);

  const params = preImage?.proposal?.meta?.args?.map(({ name, type }): Param => ({
    name: name.toString(),
    type: getTypeDef(type.toString())
  }));

  const values = preImage?.proposal?.args?.map((value): Value => ({
    isValid: true,
    value
  }));

  const derivedValues = values && api && params?.reduce((result: RawParams, param, index): RawParams => {
    result.push(
      values && values[index]
        ? values[index]
        : createValue(preImage.proposal.args.registry, param)
    );

    return result;
  }, []);

  // console.log('preimage:', preImage);
  // console.log('params:', params);

  const call = useMemo(() =>
    preImage?.proposal && preImage.proposal.callIndex
      ? preImage.proposal.registry.findMetaCall(preImage.proposal.callIndex)
      : null
    , [preImage]);

  return (
    <Grid container item>
      {preImage
        ? preImage?.deposit?.who === formatted &&
        <Grid alignItems='center' container item justifyContent='space-between'>
          <Grid container item sx={{ width: '134px' }} xs={2.2}>
            <Grid item sx={{ fontSize: '16px', fontWeight: 400 }}>
              {hash.substring(0, 8) + '...'}
            </Grid>
            <Grid item>
              <CopyAddressButton address={String(hash)} />
            </Grid>
          </Grid>
          <Grid fontSize='16px' fontWeight={400} item textAlign='left' xs={5.6}>
            {preImage?.proposalError
              ? <Warning
                iconDanger
                marginTop={0}
                theme={theme}
              >
                {preImage.proposalError}
              </Warning>
              : call &&
              <Grid container item>
                <Grid item>
                  <Typography>
                    {`${call.section}.${call.method}`}
                  </Typography>
                  <Typography fontSize='12px'>
                    {formatMeta(call.meta)?.[0] || ''}
                  </Typography>
                </Grid>
                <Grid container item pt='5px' pb='10px'>
                  {values && params?.map(({ name, type }: ParamDef, index: number) => (
                    <Grid item xs={12} key={index}>
                      <Typography fontSize='13px'>
                        {`${name || ''}:${type.type.toString()}`}
                      </Typography>
                      <Typography fontSize='13px' fontWeight={400}>
                        {`${values[index].value.toString()}`}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            }
          </Grid>
          <Grid item xs={1}>
            {formatNumber(preImage.proposalLength)}
          </Grid>
          <Grid item xs={1.5}>
            <ShowBalance balance={preImage.deposit.amount} decimal={decimal} decimalPoint={2} token={token} />
          </Grid>
          <Grid container item justifyContent='flex-end' xs={1.5}>
            {/* <Identity
              address={address}
              api={api}
              identiconSize={31}
              showSocial={false}
              style={{
                height: '38px',
                maxWidth: '100%',
                minWidth: '35%',
                width: 'fit-content',
                fontSize: '16px'
              }}
            /> */}
            <Button endIcon={<NavigateNextIcon sx={{ fontSize: '30px' }} />} sx={{ textTransform: 'none', color: 'primary.main', fontSize: '16px' }} variant='text'>
              {t('Select')}
            </Button>
          </Grid>
        </Grid>
        : <Skeleton height={20} sx={{ display: 'inline-block', fontWeight: 'bold', transform: 'none', width: '100%', my: '5px' }} />
      }
    </Grid>
  );
}
