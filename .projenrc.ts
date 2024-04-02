import { awscdk } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'ASGNatInstance',
  projenrcTs: true,
  repository: 'https://github.com/raihalea/CDK-AutoScalingNatInstance.git',
  gitignore: [
    'cdk.context.json',
    'test/__snapshots__',
  ],
  deps: [
    'constructs',
  ],
  devDeps: ['@types/aws-lambda'],
});
project.synth();