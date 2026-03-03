import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface LambdaStackProps extends cdk.StackProps {
  vpc: ec2.IVpc;
}

export class LambdaStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    // Lambda Layer for dependencies (shared code, common libraries)
    const layer = new lambda.LayerVersion(this, 'EcoRouteCommonLayer', {
      code: lambda.Code.fromAsset('layers/common'),
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X],
      description: 'Shared common dependencies for EcoRoute Lambda functions',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // API Gateway integration
    this.api = new apigateway.RestApi(this, 'EcoRouteApi', {
      restApiName: 'ecoroute-api',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // Example Lambda for task handling
    const taskHandler = new lambda.Function(this, 'TaskHandlerFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'task-handler.handler',
      code: lambda.Code.fromAsset('../backend/src/handlers'), // Adjusted path to reflect actual location
      vpc: props.vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      layers: [layer],
      environment: {
        DATABASE_URL: 'REPLACE_WITH_ACTUAL_URL', // Should be fetched from Secrets Manager ideally
      },
    });

    // API Gateway Task resource
    const tasksResource = this.api.root.addResource('tasks');
    tasksResource.addMethod('POST', new apigateway.LambdaIntegration(taskHandler));
    tasksResource.addMethod('GET', new apigateway.LambdaIntegration(taskHandler));

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
    });
  }
}
