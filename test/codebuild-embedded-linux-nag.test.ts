import * as cdk from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { EmbeddedLinuxCodeBuildProjectStack } from '../lib/codebuild-embedded-linux';
import { DEFAULT_ENV } from './util';

function addNagSuppressions(stack: cdk.Stack) {

  NagSuppressions.addStackSuppressions(stack,
    [
      { id: 'CdkNagValidationFailure', reason: 'Multiple Validation Failures.', },
      { id: 'AwsSolutions-CB3', reason: 'CodeBuild Privilege mode is required for this pipeline.', },
      { id: 'AwsSolutions-IAM4', reason: 'TODO: Re-evaluate managed policies per resources.', },
    ]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/EmbeddedLinuxCodeBuildProject/PolicyDocument/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'Because these are the default permissions assigned to a CDK default created role.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/EmbeddedLinuxCodeBuildProject/Role/DefaultPolicy/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'Because these are the default permissions assigned to a CDK default created role.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/EmbeddedLinuxCodeBuildProjectOSImageCheckOnStart/ServiceRole/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'This is a default CDK created policy, with default policy permissions.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/EmbeddedLinuxCodeBuildProjectOSImageCheckOnStart/Resource`,
    [{ id: 'AwsSolutions-L1', reason: 'There is no latest PYTHON version to set.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/EmbeddedLinuxCodeBuildProjectOSImageCheckOnStart/ServiceRole/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'This is a default CDK created policy, with default policy permissions.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'This is a default CDK created policy, with default policy permissions.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'This is a default CDK created policy, with default policy permissions.', },]
  );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/LogRetentionaae0aa3c5b4d4f87b02d85b201efdd8a/ServiceRole/DefaultPolicy/Resource`,
    [{ id: 'AwsSolutions-IAM5', reason: 'This is a default CDK created policy, with default policy permissions.', },]
  );
}

describe('EmbeddedLinuxCodeBuildProjectStack cdk-nag AwsSolutions Pack', () => {
  let app: cdk.App = new cdk.App();
  let stack: cdk.Stack;

  beforeAll(() => {
    // GIVEN
    const baseStack = new cdk.Stack(app, 'BaseStack', { env: DEFAULT_ENV });

    const encryptionKey = new kms.Key(baseStack, 'EncryptionKey', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      enableKeyRotation: true,
    });
    const ecrRepository = new ecr.Repository(baseStack, 'ECRRepository', {});
    const vpc = new ec2.Vpc(baseStack, 'Vpc', {});

    const props = {
      env: DEFAULT_ENV,
      ecrRepository: ecrRepository,
      ecrRepositoryImageTag: "ubuntu_22_04",
      vpc: vpc,
      encryptionKey: encryptionKey,
    };

    stack = new EmbeddedLinuxCodeBuildProjectStack(app, 'MyTestStack', props);

    addNagSuppressions(stack);

    // WHEN
    cdk.Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  });

  // THEN
  test('No unsuppressed Warnings', () => {
    const results = Annotations.fromStack(stack).findWarning('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    for (const result of results) { console.log(JSON.stringify(result, null, 4)); }
    expect(results).toHaveLength(0);

  });
  test('No unsuppressed Errors', () => {
    const results = Annotations.fromStack(stack).findError('*', Match.stringLikeRegexp('AwsSolutions-.*'));
    for (const result of results) { console.log(JSON.stringify(result, null, 4)); }
    expect(results).toHaveLength(0);
  });
});
