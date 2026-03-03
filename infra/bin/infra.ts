import * as cdk from 'aws-cdk-lib';
import { CognitoStack } from './cognito-stack';
import { DatabaseStack } from './database-stack';
import { LambdaStack } from './lambda-stack';

const app = new cdk.App();

const databaseStack = new DatabaseStack(app, 'EcoRouteDatabaseStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new CognitoStack(app, 'EcoRouteCognitoStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new LambdaStack(app, 'EcoRouteLambdaStack', {
  vpc: databaseStack.vpc,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});
