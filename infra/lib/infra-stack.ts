import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as path from 'path';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. User Pool for Auth
    const userPool = new cognito.UserPool(this, 'EcoRouteUserPool', {
      userPoolName: 'ecoroute-users',
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      autoVerify: { email: true },
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For dev
    });

    const userPoolClient = userPool.addClient('EcoRouteClient', {
      authFlows: {
        userPassword: true,
      }
    });

    // 2. DynamoDB Table
    const table = new dynamodb.Table(this, 'EcoRouteTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 3. Lambda Handler
    const handler = new lambda.Function(this, 'EcoRouteHandler', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'handler.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../backend/lambda')),
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    table.grantReadWriteData(handler);

    // 4. API Gateway with Cognito Authorizer
    const api = new apigateway.RestApi(this, 'EcoRouteApi', {
      restApiName: 'EcoRoute Service',
      description: 'This service handles eco travel plans.',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'EcoRouteAuthorizer', {
      cognitoUserPools: [userPool],
    });

    const authOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    const plans = api.root.addResource('plans');
    plans.addMethod('POST', new apigateway.LambdaIntegration(handler), authOptions);
    
    const plan = plans.addResource('{id}');
    plan.addMethod('GET', new apigateway.LambdaIntegration(handler), authOptions);

    // Outputs for Frontend
    new cdk.CfnOutput(this, 'UserPoolId', { value: userPool.userPoolId });
    new cdk.CfnOutput(this, 'UserPoolClientId', { value: userPoolClient.userPoolClientId });
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
