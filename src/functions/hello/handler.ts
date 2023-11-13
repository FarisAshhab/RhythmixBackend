import type { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import AwsService from "../../service/Aws/AwsService"

import schema from './schema';
const awsService = AwsService()
const hello: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  const TOKEN = await awsService.fetchCredential("MONGO_API_KEY")
  return formatJSONResponse({
    message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    event,
  });
};

export const main = middyfy(hello);
