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
          name: 'check out',
          uses: 'actions/checkout@v4',
          with: {
            submodules: 'recursive',
          },
        },
        {
          name: 'update submodules',
          run: 'git submodule update --remote --recursive',
        },
        {
          name: 'git status',
          run: 'echo "::set-output name=status::$(git status -s)"',
        },
        {
          name: 'Create Pull Request',
          uses: 'peter-evans/create-pull-request@v4',
          if: '${{ steps.status.outputs.status }}',
          with: {
            token: '${{ steps.generate_token.outputs.token }}',
            message: 'chore(deps): upgrade submodules',
            branch: 'github-actions/upgrade-submodules',
            title: 'chore(deps): upgrade submodules',
            author: 'github-actions <github-actions@github.com>',
            comitter: 'github-actions <github-actions@github.com>',
          },
        },
      ],
    },
  });
}

project.synth();