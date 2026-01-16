import sdk from '@farcaster/frame-sdk';

export type FrameContext = Awaited<typeof sdk.context>;

export const farcasterSdk = sdk;

export const readyAndGetContext = async (): Promise<FrameContext> => {
  await sdk.actions.ready();
  const ctx = await sdk.context;
  return ctx;
};

