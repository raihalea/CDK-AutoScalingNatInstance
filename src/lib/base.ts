import {
  Vpc,
  SubnetType,
  CfnEIP,
} from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';


export class Base extends Construct {
  readonly vpc: Vpc;
  readonly eip: CfnEIP;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.vpc = new Vpc(this, 'VPC', {
      natGateways: 0,
      subnetConfiguration: [
        {
          subnetType: SubnetType.PUBLIC,
          name: 'Public',
        },
        {
          subnetType: SubnetType.PRIVATE_WITH_EGRESS,
          name: 'Private',
        },
      ],
    });

    this.eip = new CfnEIP(this, 'EIP');

  }
}