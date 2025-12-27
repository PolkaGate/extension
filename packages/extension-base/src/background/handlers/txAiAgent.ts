// Copyright 2019-2025 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { MLCEngine } from '@mlc-ai/web-llm';
import type { AiTxAnyJson } from '@polkadot/extension-base/utils/AiUtils/aiTypes';

import { CreateMLCEngine } from '@mlc-ai/web-llm';

import { additionalRules, RAG } from '@polkadot/extension-base/utils/AiUtils/aiUtils';
import { explainTx } from '@polkadot/extension-base/utils/AiUtils/handlers';

export const DEFAULT_MODEL_ID = 'gemma-2-2b-it-q4f16_1-MLC';
export const AI_MODEL_ID = 'aiModelId';

export const getStorage = (label: string, parse = false): Promise<object | string> => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([label], (result) => {
            if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
            } else {
                resolve(parse ? JSON.parse((result[label] || '{}') as string) as object : result[label] as object);
            }
        });
    });
};

/**
 * Load the AI agent with the given model ID.
 * Lazy-loads if not already loaded.
 */
export async function loadAgent (engine?: MLCEngine | null, modelId?: string, progressCallback?: (progress: number) => void) {
    if (!engine) {
        const selectedModelId = modelId ?? await getStorage(AI_MODEL_ID) as string ?? DEFAULT_MODEL_ID;

        console.log(`Loading the AI model ${selectedModelId} ...`);

        engine = await CreateMLCEngine(selectedModelId, {
            initProgressCallback: (progress) => {
                console.log('Loading model', progress);
                progressCallback?.(progress.progress);
            }
        });
    }

    return engine;
}

/**
 * Explain a transaction JSON using the AI agent.
 * @param txJson - parsed transaction JSON
 * @returns explanation string
 */
export async function explainTransaction (engine: MLCEngine | null, txJson: AiTxAnyJson) {
    try {
        if (!engine) {
            // Default model ID if not loaded yet
            engine = await loadAgent();
        }

        const key = `${txJson['section'] as string}.${txJson['method'] as string}`;
        const data = { ...txJson['decode'], ...txJson } as AiTxAnyJson;
        const txData = JSON.stringify(explainTx(data, key));
        const ragInfo = RAG(key);

        const prompt = `
        Explain the following ${txJson['chainName']} network transaction to a user.

        Use the 'Transaction explanation helper info' field as the source of truth.
        Do not reinterpret or calculate anything yourself.

        Context:
        ${additionalRules(txJson['section'] as string)}

        Transaction explanation helper info:
        ${ragInfo}

        Transaction data:
        ${txData}
    `;

        // console.log('prompt:', prompt);

        const systemPrompt = `
        You are an AI assistant that explains Polkadot blockchain transactions to end users in clear, simple language.

        Rules (critical):
        - You MUST NOT reinterpret, recompute, or guess any technical values.
        - If an 'explanation' object is provided, it is authoritative and already correct.
        - NEVER perform math, decoding, or bitwise logic yourself.
        - NEVER contradict the 'explanation' field.
        - Your task is ONLY to convert provided facts into a natural-language explanation.
        - Your sentences must be like, e.g. "You are doing something ...".

        Behavior:
        - If 'explanation.type' is "KNOWN", produce a single concise sentence explaining the action.
        - If 'explanation.type' is "GENERIC", explain the transaction generically without assumptions.
        - Be accurate, calm, and user-friendly.
        - Do not mention internal fields, JSON, or implementation details.

        Output:
        - One short paragraph (75 characters minimum - 250 characters maximum).
        - Do NOT add extra explanations, synonyms, or extra wording.
    `;

        const response = await engine.chat.completions.create({
            messages: [
                { content: systemPrompt, role: 'system' },
                { content: prompt, role: 'user' }
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
    } catch (error) {
        console.error('Failed to explain transaction:', error);
        throw new Error(`AI transaction explanation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
}
