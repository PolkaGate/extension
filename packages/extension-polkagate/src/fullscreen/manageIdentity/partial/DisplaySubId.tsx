// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0
// @ts-nocheck


import { faEdit, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ArrowForward as ArrowForwardIcon, Replay as UndoIcon } from '@mui/icons-material';
import { Divider, Grid, type SxProps, type Theme, Typography, useTheme } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';

import { ApiPromise } from '@polkadot/api';

import { Identicon, ShortAddress } from '../../../components';
import { useTranslation } from '../../../components/translate';
import { useAccountName, useChain } from '../../../hooks';
import { getSubstrateAddress } from '../../../util/utils';
import SubIdForm from './SubIdForm';

interface Props {
  addressesToSelect?: string[];
  api?: ApiPromise | undefined;
  error?: boolean;
  index?: number;
  judgements?: RegExpMatchArray | null;
  noButtons?: boolean;
  onRemove?: (index: number | undefined) => void;
  parentName: string;
  subIdInfo: { address: string | undefined; name: string | undefined; status?: 'current' | 'new' | 'remove' }
  setSubName?: (subName: string | null | undefined, index: number | undefined) => void;
  setSubAddress?: (address: string | null | undefined, index: number | undefined) => void;
  toModify?: boolean;
}

interface ManageButtonProps {
  icon: unknown;
  text: string;
  onClick: () => void;
  style?: SxProps<Theme> | undefined
}

export default function DisplaySubId({ addressesToSelect, api, error = false, index, judgements, noButtons = false, onRemove, parentName, setSubAddress, setSubName, subIdInfo, toModify = false }: Props): React.ReactElement {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useParams<{ address: string }>();
  const chain = useChain(params.address);
  const subIdAddress = getSubstrateAddress(subIdInfo.address);
  const subIdExtensionName = useAccountName(subIdAddress);

  const [isModifying, setModify] = useState<boolean>(false);
  const toRemove = useMemo(() => subIdInfo.status === 'remove', [subIdInfo.status]);

  const fadeColor = useMemo(() => theme.palette.mode === 'light' ? '#EEEEEE' : 'rgba(0,0,0,0.8)', [theme.palette.mode]);

  useEffect(() => setModify(toModify), [toModify]);

  const ManageButton = ({ icon, onClick, style, text }: ManageButtonProps) => (
    <Grid alignItems='center' container item onClick={onClick} sx={{ cursor: 'pointer', width: 'fit-content', ...style }}>
      <Grid container item pr='5px' width='fit-content'>
        {icon}
      </Grid>
      <Typography fontSize='16px' fontWeight={400} sx={{ textDecoration: 'underline' }}>
        {text}
      </Typography>
    </Grid>
  );

  const onModify = useCallback(() => {
    !toRemove && setModify(true);
  }, [toRemove]);

  const onRemoveItem = useCallback(() => {
    onRemove && onRemove(index);
  }, [index, onRemove]);

  return (
    <>
      {!isModifying || toRemove
        ? <Grid container item sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'secondary.contrastText', borderRadius: noButtons ? '10px' : '2px', boxShadow: '2px 3px 4px 0px #0000001A', p: '8px 15px', position: 'relative' }}>
          <Grid alignItems='center' container item>
            <Grid alignItems='center' container item width='40%'>
              <Grid alignItems='center' container item xs={10}>
                <Grid container item xs={2}>
                  <Identicon
                    iconTheme={chain?.icon ?? 'polkadot'}
                    prefix={chain?.ss58Format ?? 42}
                    size={31}
                    value={subIdInfo.address}
                  />
                </Grid>
                <Grid container item pl='8px' sx={{ '> div': { justifyContent: 'flex-start' } }} xs={10}>
                  {subIdExtensionName
                    ? <Typography fontSize='24px' fontWeight={400} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='95%'>
                      {subIdExtensionName}
                    </Typography>
                    : <ShortAddress address={subIdInfo.address} charsCount={6} />
                  }
                </Grid>
              </Grid>
              <ArrowForwardIcon sx={{ fontSize: '25px', width: 'fit-content' }} />
            </Grid>
            <Grid alignItems='center' container item sx={{ width: '60%' }}>
              <Grid container item xs={1}>
                <Identicon
                  iconTheme={chain?.icon ?? 'polkadot'}
                  isSubId={!!parentName}
                  judgement={judgements}
                  prefix={chain?.ss58Format ?? 42}
                  size={31}
                  value={subIdInfo.address}
                />
              </Grid>
              <Grid container item pl='8px' xs={11}>
                <Typography fontSize='24px' fontWeight={500} overflow='hidden' textOverflow='ellipsis' whiteSpace='nowrap' width='95%'>
                  {`${parentName} / ${subIdInfo.name ?? ''}`}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          {!noButtons &&
            <Grid container item justifyContent='flex-end'>
              <Divider sx={{ bgcolor: 'secondary.main', height: '2px', my: '12px', width: '95%' }} />
              <Grid columnSpacing='20px' container item justifyContent='flex-end'>
                <ManageButton
                  icon={
                    <FontAwesomeIcon
                      color={theme.palette.secondary.main}
                      fontSize='25px'
                      icon={faEdit}
                    />
                  }
                  onClick={onModify}
                  text={t('Modify')}
                />
                <ManageButton
                  icon={toRemove
                    ? <UndoIcon
                      sx={{ color: theme.palette.secondary.main, fontSize: '28px' }}
                    />
                    : <FontAwesomeIcon
                      color={theme.palette.secondary.main}
                      fontSize='25px'
                      icon={faTrash}
                    />
                  }
                  onClick={onRemoveItem}
                  style={{ zIndex: toRemove ? 10 : 1 }}
                  text={toRemove
                    ? t('Undo')
                    : t('Remove')}
                />
              </Grid>
            </Grid>
          }
          {toRemove && <Grid container item style={{ backgroundColor: fadeColor, bottom: 0, left: 0, opacity: 0.8, position: 'absolute', right: 0, top: 0, zIndex: 1 }}></Grid>}
        </Grid>
        : <SubIdForm
          address={subIdInfo.address}
          addressesToSelect={addressesToSelect}
          api={api}
          chain={chain as any}
          error={error}
          index={index}
          name={subIdInfo.name}
          onRemove={onRemoveItem}
          setSubAddress={setSubAddress}
          setSubName={setSubName}
        />
      }
    </>
  );
}
