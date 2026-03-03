# EcoRoute Sync Infrastructure

Infrastructure as Code for the EcoRoute Sync application using AWS CDK.

## Components

### Cognito Stack
- **User Pool**: Manages user registration and authentication.
- **MFA**: Configured to require OTP for enhanced security.
- **App Client**: Client configuration for web and mobile applications.

### Database Stack
- **RDS PostgreSQL**: Managed relational database.
- **VPC**: Isolated network environment with public and private subnets.
- **PostGIS**: Spatial database extender for geographic objects.

### Lambda Stack
- **API Gateway**: RESTful API interface.
- **Lambda Functions**: Serverless compute for application logic.
- **Lambda Layers**: Shared common dependencies (e.g., `pg`, `axios`).

## Deployment

1. Ensure AWS CLI and CDK are configured.
2. Navigate to the `infra` directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Deploy the stacks:
   ```bash
   cdk deploy --all
   ```

## Development

The environment is set to use the default AWS account and region from the local configuration.
For development, `RemovalPolicy` is set to `DESTROY` on persistent resources.
