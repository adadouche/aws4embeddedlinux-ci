import * as cdk from 'aws-cdk-lib';

import { Annotations, Match } from 'aws-cdk-lib/assertions';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { DEFAULT_ENV } from './util';
import { PipelineResourcesStack } from '../lib';

function addNagSuppressions(stack: cdk.Stack) {
  // NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/BuildImageBucketRole/DefaultPolicy/Resource`,
  //   [{ id: 'AwsSolutions-IAM5', reason: 'Because these are the default permissions assigned to a CDK default created role.', },]
  // );

  // NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/BuildImageBucketRole/Resource`,
  //   [{ id: 'AwsSolutions-IAM5', reason: '/aws/lambda/BuildImageData-CustomCDKBucketDeployment* is needed here.', },]
  // );
  NagSuppressions.addResourceSuppressionsByPath(stack, `/${stack.stackName}/VMImportRole/Resource`,
    [{
      id: 'AwsSolutions-IAM5', reason: 'Read permissions needed on bucket.',
      appliesTo: [
        { regex: '/Resource::<PipelineResourceOutputVMImportBucketD4D4A837.Arn>/\\*$/g', },
        { regex: `/Resource::arn:aws:ec2:${DEFAULT_ENV.region}::snapshot/\\*$/g`, },
        { regex: '/Resource::\\*$/g', },
      ],
    },
    ]
  );
}

describe('PipelineResourcesStack cdk-nag AwsSolutions Pack', () => {
  let app: cdk.App = new cdk.App();
  let stack: cdk.Stack;

  beforeAll(() => {
    // GIVEN
    const props = {
      env: DEFAULT_ENV,
      resoruce_prefix: `${DEFAULT_ENV.account}-${DEFAULT_ENV.region}`,
    };

    stack = new PipelineResourcesStack(app, 'MyTestStack', props);

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