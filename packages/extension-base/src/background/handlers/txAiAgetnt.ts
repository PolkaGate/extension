// Copyright 2019-2025 @polkadot/extension-polkagate authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MLCEngine } from '@mlc-ai/web-llm';

import { CreateMLCEngine } from '@mlc-ai/web-llm';

import { getStorage } from '@polkadot/extension-polkagate/src/util';
import { STORAGE_KEY } from '@polkadot/extension-polkagate/src/util/constants';

export const DEFAULT_MODEL_ID = 'Phi-3.5-mini-instruct-q4f16_1-MLC';

/**
 * Load the AI agent with the given model ID.
 * Lazy-loads if not already loaded.
 */
export async function loadAgent (engine?: MLCEngine | null, modelId?: string, progressCallback?: (progress: number) => void) {
    if (!engine) {
        const selectedModelId = modelId ?? await getStorage(STORAGE_KEY.AI_MODEL_ID) as string ?? DEFAULT_MODEL_ID;

        console.log(`Creating  the ai model ${selectedModelId} ...`);

        engine = await CreateMLCEngine(selectedModelId, {
            initProgressCallback: (progress) => {
                console.log('Loading model', progress);
                progressCallback?.(progress.progress);
            }
        });
    }

    return engine;
}

const additionalRules = (section: string | undefined) => {
    let additionalRules = '';
    const SECTION = section?.toLowerCase();

    if (SECTION === 'convictionvoting') {
        additionalRules = `
            VOTE RULES:
            - Vote type, vote value, referendum index, balance, token symbol, and decimal are the most important fields
            - Vote interpretation:
              * If vote_value is null → Abstain
              * The vote is a single byte hex string. Determine vote by checking the most significant bit (0x80):
              * If (vote_byte & 0x80) != 0 → Aye, else → Nay.
            - The "balance" field represents voting balance/voting power assigned to this vote (NOT staked or locked amounts)
            - Format: "You are voting [Aye/Nay/Abstain] on referenda [INDEX] using [FORMATTED_AMOUNT] [TOKEN] of voting balance assigned to this vote."
        `;
    } else if (SECTION === 'balances') {
        additionalRules = `
            TRANSFER RULES:
            - Format: "You are sending [FORMATTED_AMOUNT] [TOKEN] to [ADDRESS]"
        `;
    } else if (SECTION === 'staking' || SECTION === 'nominationpools') {
        additionalRules = `
            STAKING RULES:
            - Use phrases like: "You are bonding", "You are nominating", "You are unbonding", "You are withdrawing", "You are claiming rewards"
        `;
    }

    return additionalRules;
};

interface TransactionJson {
    section?: string;
    [key: string]: unknown;
}

/**
 * Explain a transaction JSON using the AI agent.
 * @param txJson - parsed transaction JSON
 * @returns explanation string
 */
export async function explainTransaction (engine: MLCEngine | null, txJson: unknown) {
    if (!engine) {
        // Default model ID if not loaded yet
        engine = await loadAgent();
    }

    const tx = txJson as TransactionJson;
    const ADDITIONAL_RULES = additionalRules(tx?.section);

    const prompt = `
        ROLE:
            You are a transaction explanation engine for the PolkaGate wallet.

        TASK:
            Generate a short, clear explanation describing what the user is currently doing by signing this transaction.

        CONTEXT:
            - The transaction is NOT signed yet.
            - The ONLY source of truth is the JSON below.
            - Extract all values (amounts, decimals, token symbol, addresses, chain info) directly from the JSON.
            - Compute formatted amounts as:
                FORMATTED_AMOUNT = (amount OR balance) / (10 ** DECIMAL)

        ${ADDITIONAL_RULES}

        CONSTRAINTS:
            - Use present continuous tense (e.g., "are sending", "are voting", "are staking")
            - Do NOT explain how the transaction works
            - Do NOT add assumptions or external knowledge
            - Do NOT mention JSON, fields, or technical terms
            - Do NOT include reasoning, steps, or meta comments

        OUTPUT FORMAT:
            - One single sentence
            - 75–200 characters
            - Plain text only

        FORMATTING RULES:
            - Use thousand separators
            - Shorten addresses: first 6 + "..." + last 6

        TRANSACTION JSON:
            ${JSON.stringify(txJson)}
    `;

    const systemPrompt = `
        You are an AI assistance that is an expert blockchain transaction analyzer for PolkaGate wallet that explains Polkadot/Substrate transactions in clear, simple language for PolkaGate users.
        Your task is to read the provided transaction JSON and generate a concise, user-friendly summary of what the transaction does.
        Focus on clarity and simplicity, avoiding technical jargon.
        Always follow the instructions provided in the user message.
    `;

    const response = await engine.chat.completions.create({
        messages: [
            {
                content: systemPrompt,
                role: 'system'
            },
            {
                content: prompt,
                role: 'user'
            }
        ]
    });

    let message = response?.choices?.[0]?.message?.content?.trim() || 'Unknown transaction';

    if (message.toLowerCase().includes('<think>')) {
        message = message.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    }

    return {
        engine,
        message
    };
}
