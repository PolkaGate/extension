// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MessageTypes, TransportRequestMessage } from '../types';

import { assert } from '@polkadot/util';

import { PORT_EXTENSION } from '../../defaults';
import Extension from './Extension';
import State from './State';
import Tabs from './Tabs';

const state = new State();
const extension = new Extension(state);
const tabs = new Tabs(state);

export default function handler<TMessageType extends MessageTypes>({ id, message, request }: TransportRequestMessage<TMessageType>, port: chrome.runtime.Port, extensionPortName = PORT_EXTENSION): void {
  const isExtension = port.name === extensionPortName;
  const sender = port.sender;
  const from = isExtension
    ? 'extension'
    : sender?.tab?.url || sender?.url || '<unknown>';
  const source = `${from}: ${id}: ${message}`;

  const promise = isExtension
    ? extension.handle(id, message, request, port)
    : tabs.handle(id, message, request, from, port);

  promise
    .then((response): void => {
      // between the start and the end of the promise, the user may have closed
      // the tab, in which case port will be undefined
      assert(port, 'Port has been disconnected');

      port.postMessage({ id, response });
    })
    .catch((error: Error): void => {
      console.log(`[err] ${source}:: ${error.message}`);

      // only send message back to port if it's still connected
      if (port) {
        port.postMessage({ error: error.message, id });
      }
    });
}
