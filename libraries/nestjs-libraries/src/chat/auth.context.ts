import { getAuth } from '@reachly/nestjs-libraries/chat/async.storage';

export const checkAuth = (inputData: any, context: any) => {
  const auth = getAuth();
  const authInfo = auth || context?.mcp?.extra?.authInfo;
  if (authInfo && context?.requestContext) {
    (context.requestContext as any).set(
      'organization',
      JSON.stringify(authInfo)
    );
    (context.requestContext as any).set('ui', 'false');
  }
};
