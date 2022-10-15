import { Action } from '../../types/action';
import { Payload } from '../../types/payload';
import { Query } from '../../types/query';
import { ServerConfiguration } from '../../types/serverConfiguration';
import fetch from 'cross-fetch';

interface PayloadSender {
  serverConfiguration: ServerConfiguration;
  queries: Query[];
  action: Action;
  database: string;
  collection: string;
  payload: Record<string, unknown> | Record<string, unknown>[];
}

const requestMapper = (action: Action) => {
  switch (action) {
    case 'create':
      return 'POST';
    case 'get':
      return 'POST';
    case 'update':
      return 'PUT';
    case 'delete':
      return 'DELETE';
    default:
      return 'POST';
  }
};

const checkIfPayloadValid = (action: Action, queries: Query[]) => {
  if (action === 'create' || queries.length !== 0) return;
  switch (action) {
    case 'get':
      return;
    case 'update':
      throw new Error(
        'Where condition must be set in order to use Update function'
      );
    case 'delete':
      throw new Error(
        'Where condition must be set in order to use Delete function'
      );
    default:
      throw new Error(
        `The action ${action} is not handled yet. If you see this, please report this problem via GitHub issue`
      );
  }
};

export const payloadSender = async ({
  serverConfiguration,
  queries,
  action,
  database,
  collection,
  payload,
}: PayloadSender) => {
  try {
    checkIfPayloadValid(action, queries);

    const requestPayload: Payload = {
      query: queries,
      payload: payload,
    };

    const targetUrl = [
      serverConfiguration.host,
      action,
      database,
      collection,
    ].join('/');

    const targetMethod = requestMapper(action);

    const response = await fetch(targetUrl, {
      method: targetMethod,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    return response.json();
  } catch (error) {
    return error;
  }
};
