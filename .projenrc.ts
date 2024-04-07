import { awscdk, github } from 'projen';
import { JobPermission } from 'projen/lib/github/workflows-model';
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

if (project.github) {
  const updateSubmoduels = project.github.addWorkflow('update-submodules');
  updateSubmoduels.on({ schedule: [{ cron: '0 0 1 * *' }], workflowDispatch: {} });
  updateSubmoduels.addJobs({
    updateCtfd: {
      runsOn: ['ubuntu-latest'],
      name: 'update-submoduels',
      permissions: {
        contents: JobPermission.READ,
      },
      steps: [
        { uses: 'actions/checkout@v4' },
        {
          name: 'update submodules',
          run: 'git submodule update --remote --recursive',
        },
        {
          name: 'Find mutations',
          id: 'crete_patch',
          run: `
          git add ./
          git diff --staged --patch --exit-code > .repo.patch || echo "patch_created=true" >> $GITHUB_OUTPUT
          `,
          workingDirectory: './',
        },
        {
          name: 'Generate token',
          id: 'generate_token',
          uses: 'actions/create-github-app-token@v1',
          with: {
            app_id: '${{ secrets.APP_ID }}',
            private_key: '${{ secrets.PRIVATE_KEY }}',
          },
        },
        {
          name: 'Create Pull Request',
          uses: 'peter-evans/create-pull-request@v6',
          with: {
            token: '${{ steps.generate_token.outputs.token }}',
            message: 'chore(deps): upgrade dependencies',
            branch: 'github-actions/upgrade',
            title: 'chore(deps): upgrade dependencies',
          },
        },
      ],
    },
  });
}

project.synth();