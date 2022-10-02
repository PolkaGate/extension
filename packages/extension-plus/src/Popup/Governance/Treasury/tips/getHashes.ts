// Copyright 2017-2022 @polkadot/react-hooks authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AugmentedEvent } from '@polkadot/api/types';
import type { EventRecord } from '@polkadot/types/interfaces';
import { ApiPromise } from '@polkadot/api';

import { ChainInfo } from '../../../../util/plusTypes';

interface Result {
  blockHash: string;
  events: EventRecord[];
}

const IDENTITY_FILTER = () => true;
const EMPTY_RESULT: Result = {
  blockHash: '',
  events: []
};

type EventCheck = AugmentedEvent<'promise'> | false | undefined | null;

async function eventTrigger(api: ApiPromise, checks: EventCheck[], filter: (record: EventRecord) => boolean = IDENTITY_FILTER): Promise<Result> {
  let state = EMPTY_RESULT;
  // const [checks] = useState(() => _checks);
  const eventRecords = await api.query.system.events();

  console.log('eventRecords:', eventRecords);

  if (eventRecords) {
    const events = eventRecords.filter((r) => r.event && checks.some((c) => c && c.is(r.event)) && filter(r));

    if (events.length) {
      state = {
        blockHash: eventRecords.createdAtHash?.toHex() || '',
        events
      };
    }
  }

  console.log('state:', state);

  return state;
}


export default async function getHashes(chainInfo: ChainInfo) {
  const {api} = chainInfo;

  const trigger = await eventTrigger(api, [
    api.events.tips?.NewTip,
    api.events.tips?.TipClosed,
    api.events.tips?.TipRetracted
  ]);


  return;//useMapKeys((api.query.tips || api.query.treasury)?.tips, options, trigger.blockHash);
}