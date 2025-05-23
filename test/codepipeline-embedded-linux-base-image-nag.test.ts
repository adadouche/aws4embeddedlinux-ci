import { describe, expect, test, beforeAll } from "@jest/globals";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { Annotations, Match } from "aws-cdk-lib/assertions";

import * as cdk from "aws-cdk-lib";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  EmbeddedLinuxCodePipelineBaseImageProps,
  EmbeddedLinuxCodePipelineBaseImageStack,
} from "../lib";
import { DEFAULT_ENV } from "./util";

const base_path = `CodePipelineBuildBaseImage`;

function addNagSuppressions(
  _stack: EmbeddedLinuxCodePipelineBaseImageStack,
  _props: EmbeddedLinuxCodePipelineBaseImageProps,
) {
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/Custom::CDKBucketDeployment8693BB64968944B69AAFB0CC9EB8756C/Resource`,
    [
      {
        id: "AwsSolutions-L1",
        reason: "This Lambda function is 3rd Party (from CDK libs)",
      },
    ],
  );
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/${base_path}BucketDeploymentRole/Resource`,
    [
      {
        id: "AwsSolutions-IAM5",
        reason: `Because ${base_path}BucketDeploymentRole/Resource is needed here.`,
      },
    ],
  );
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/${base_path}BucketDeploymentRole/DefaultPolicy/Resource`,
    [
      {
        id: "AwsSolutions-IAM5",
        reason:
          "Because these are the default permissions assigned to a CDK default created role.",
      },
    ],
  );
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/${base_path}Project/Role/DefaultPolicy/Resource`,
    [
      {
        id: "AwsSolutions-IAM5",
        reason:
          "Because these are the default permissions assigned to a CDK default created role.",
      },
    ],
  );
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/${base_path}CodePipeline/Role/DefaultPolicy/Resource`,
    [
      {
        id: "AwsSolutions-IAM5",
        reason:
          "Because these are the default permissions assigned to a CDK default created role.",
      },
    ],
  );
  NagSuppressions.addResourceSuppressionsByPath(
    _stack,
    `/${_stack.stackName}/${base_path}CodePipeline/Source/Source/CodePipelineActionRole/DefaultPolicy/Resource`,
    [
      {
        id: "AwsSolutions-IAM5",
        reason:
          "Because these are the default permissions assigned to a CDK default created role.",
      },
    ],
  );
}

describe("EmbeddedLinuxCodePipelineBaseImageStack cdk-nag AwsSolutions Pack", () => {
  const resource_prefix = "test";

  let app: cdk.App;
  let stack: EmbeddedLinuxCodePipelineBaseImageStack;
  let props: EmbeddedLinuxCodePipelineBaseImageProps;
  let common: cdk.Stack;

  beforeAll(() => {
    // GIVEN
    app = new cdk.App();

    common = new cdk.Stack(app, `${resource_prefix}-common`, {
      env: DEFAULT_ENV,
    });

    // Create required resources for testing
    const pipelineSourceBucket = new s3.Bucket(
      common,
      `${resource_prefix}-src`,
      { versioned: true },
    );
    const pipelineArtifactBucket = new s3.Bucket(
      common,
      `${resource_prefix}-art`,
      {},
    );
    const ecrRepository = new ecr.Repository(common, `${resource_prefix}-ecr`);
    const encryptionKey = new kms.Key(common, `${resource_prefix}-key`);

    props = {
      env: DEFAULT_ENV,
      pipelineSourceBucket: pipelineSourceBucket,
      pipelineArtifactBucket: pipelineArtifactBucket,
      ecrRepository: ecrRepository,
      encryptionKey: encryptionKey,
    };
    stack = new EmbeddedLinuxCodePipelineBaseImageStack(
      app,
      `${resource_prefix}-stack`,
      props,
    );

    addNagSuppressions(stack, props);

    // WHEN
    cdk.Aspects.of(stack).add(new AwsSolutionsChecks({ verbose: true }));
  });

  // THEN
  test("No unsuppressed Warnings", () => {
    const results = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    for (const result of results) {
      console.log(JSON.stringify(result, null, 4));
    }
    expect(results).toHaveLength(0);
  });
  test("No unsuppressed Errors", () => {
    const results = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    for (const result of results) {
      console.log(JSON.stringify(result, null, 4));
    }
    expect(results).toHaveLength(0);
  });
});
