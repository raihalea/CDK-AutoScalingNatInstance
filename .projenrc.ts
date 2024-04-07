import { awscdk, github } from 'projen';
const project = new awscdk.AwsCdkTypeScriptApp({
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  name: 'BottleNat',
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
  projenCredentials: github.GithubCredentials.fromApp({
    appIdSecret: 'APP_ID',
    privateKeySecret: 'PRIVATE_KEY',
  }),
});
project.synth();