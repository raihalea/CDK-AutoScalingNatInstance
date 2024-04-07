import { App, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Base } from './lib/base';
import { BottleNat } from './lib/bottleNat';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const base = new Base(this, 'Base');
    new BottleNat(this, 'BottleNat', {
      vpc: base.vpc,
      eip: base.eip,
    });

  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'ASGNatInstance-dev', { env: devEnv });
// new MyStack(app, 'ASGNatInstance-prod', { env: prodEnv });

app.synth();