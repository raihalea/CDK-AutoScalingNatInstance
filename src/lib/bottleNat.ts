import { AutoScalingGroup } from 'aws-cdk-lib/aws-autoscaling';
import { Ec2Action } from 'aws-cdk-lib/aws-cloudwatch-actions';
import {
  Vpc,
  SubnetType,
  CfnEIP,
  UserData,
  LaunchTemplate,
  SecurityGroup,
  InstanceType,
} from 'aws-cdk-lib/aws-ec2';
import { Cluster, BottleRocketImage, AsgCapacityProvider, MachineImageType, Ec2TaskDefinition, ContainerImage, LogDrivers, Ec2Service } from 'aws-cdk-lib/aws-ecs';
import { Construct } from 'constructs';

export interface BottleNatProps {
  readonly vpc: Vpc;
  readonly eip: CfnEIP;
}
export class BottleNat extends Construct {

  constructor(scope: Construct, id: string, props: BottleNatProps) {
    super(scope, id);

    const { vpc, eip } = props;

    const cluster = new Cluster(this, 'Cluster', {
      vpc: vpc,
    });

    const kernelSettings: string = `[settings.kernel.sysctl]
      "net.ipv4.ip_forward" = "1"`;

    const userData = UserData.custom(kernelSettings);

    const sg = new SecurityGroup(this, 'SG', {
      vpc: vpc,
    });

    const launchTemplate = new LaunchTemplate(this, 'LaunchTemplate', {
      machineImage: new BottleRocketImage(),
      // Alternative option commented out:
      // machineImage: ecs.EcsOptimizedImage.amazonLinux2(),
      userData: userData,
      securityGroup: sg,
      instanceType: new InstanceType('t4g.micro'),
    });

    const autoScalingGroup = new AutoScalingGroup(
      this,
      'ASG',
      {
        vpc: vpc,
        mixedInstancesPolicy: {
          instancesDistribution: {
            onDemandPercentageAboveBaseCapacity: 0,
          },
          launchTemplate: launchTemplate,
        },
        capacityRebalance: true,
        maxCapacity: 1,
      },
    );

    const capacityProvider = new AsgCapacityProvider(this, 'AsgCapacityProvider', {
      autoScalingGroup: autoScalingGroup,
      enableManagedTerminationProtection: false,
      machineImageType: MachineImageType.BOTTLEROCKET,
    });

    cluster.addAsgCapacityProvider(capacityProvider);

    const taskDefinition = new Ec2TaskDefinition(this, 'TaskDef');

    taskDefinition.addContainer('NatContainer', {
      image: ContainerImage.fromRegistry('nginx'),
      portMappings: [{ containerPort: 80, hostPort: 80 }],
      memoryReservationMiB: 256,
      logging: LogDrivers.awsLogs({ streamPrefix: 'NatContaienr' }),
    });

    const service = new Ec2Service(this, 'Service', {
      cluster: cluster,
      taskDefinition: taskDefinition,
      capacityProviderStrategies: [{
        capacityProvider: capacityProvider.capacityProviderName,
        weight: 1,
      }],
      enableExecuteCommand: true,
    });

  }
}