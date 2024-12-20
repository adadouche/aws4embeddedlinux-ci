import * as path from 'path';

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as events from 'aws-cdk-lib/aws-events';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as events_target from 'aws-cdk-lib/aws-events-targets';

/**
 * Select options for the {@link BuildImageCodePipelineStack}.
 */
export interface BuildBaseImageCodePipelineProps extends cdk.StackProps {
  /** The source bucket */
  readonly sourceBucket: s3.IBucket;
  /** The ECR Repository to push to. */
  readonly ecrRepository: ecr.IRepository;
  /** Artifact bucket to use */
  readonly artifactBucket: s3.Bucket;
  /** The encryption key use across*/
  readonly encryptionKey: kms.Key;
}

/**
 * The pipeline for building the CodeBuild Image used in other pipelines. This
 * will produce an image for an OS based on verified Yocto hosts.
 *
 * For configuration options see {@link BuildBaseImageCodePipelineProps}.
 */
export class BuildBaseImageCodePipelineStack extends cdk.Stack {
  public readonly imageTag: string = 'ubuntu_22_04';

  constructor(scope: Construct, id: string, props: BuildBaseImageCodePipelineProps) {
    super(scope, id, props);

    const sourceBase: string = 'pipeline-source-base-image';
    const sourceFileName: string = 'source-base-image.zip';
    const sourceLocalPath: string = `assets/${sourceBase}`;
    const sourceDestinationKeyPrefix: string = `assets/${sourceBase}`;


    // create the policy & role for the source bucket deployment
    const sourceBucketDeploymentPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: [
            'logs:CreateLogGroup',
            'logs:CreateLogStream',
            'logs:PutLogEvents',
          ],
          resources: [
            `arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/BuildBaseImageCodePipeline-CustomCDKBucketDeployment*"`,
          ],
        }),
      ],
    });
    const sourceBucketDeploymentRole = new iam.Role(
      this,
      'CodePipelineBuildBaseImageBucketDeploymentRole',
      {
        assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
        inlinePolicies: { sourceBucketDeploymentPolicy },
      }
    );

    // deploy the source to the bucket 
    const bucketDeployment = new BucketDeployment(this, 'CodePipelineBuildBaseImageBucketDeployment', {
      // Note: Run `npm run zip-data` before deploying this stack!
      sources: [Source.asset(path.join(__dirname, '..', sourceLocalPath))],
      destinationBucket: props.sourceBucket,
      role: sourceBucketDeploymentRole,
      extract: true,
      destinationKeyPrefix: sourceDestinationKeyPrefix,
    });

    // Create a source action.
    const sourceOutput = new codepipeline.Artifact('Source');
    const sourceAction = new codepipeline_actions.S3SourceAction({
      actionName: 'Source',
      trigger: codepipeline_actions.S3Trigger.EVENTS,
      output: sourceOutput,
      bucket: props.sourceBucket,
      bucketKey: `${sourceDestinationKeyPrefix}/${sourceFileName}`,
    });

    // Create a build action.
    const project = new codebuild.PipelineProject(
      this,
      'CodePipelineBuildBaseImageProject',
      {
        buildSpec: codebuild.BuildSpec.fromSourceFilename(
          `buildspec.yml`
        ),
        environment: {
          computeType: codebuild.ComputeType.LARGE,
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
          privileged: true,
        },
        environmentVariables: {
          ECR_REPOSITORY_URI: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: props.ecrRepository.repositoryUri,
          },
          AWS_ACCOUNT_ID: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: cdk.Stack.of(this).account,
          },
          AWS_DEFAULT_REGION: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: cdk.Stack.of(this).region,
          },
          IMAGE_TAG: {
            type: codebuild.BuildEnvironmentVariableType.PLAINTEXT,
            value: this.imageTag,
          },
        },
        logging: {
          cloudWatch: {
            logGroup: new logs.LogGroup(this, 'CodePipelineBuildBaseImageBuildLogs', {
              retention: logs.RetentionDays.TEN_YEARS,
            }),
          },
        },
        encryptionKey: props.encryptionKey,
      }
    );
    project.node.addDependency(bucketDeployment);
    props.ecrRepository.grantPullPush(project);

    const buildAction = new codepipeline_actions.CodeBuildAction({
      actionName: 'Build',
      project: project,
      input: sourceOutput,
    });

    const pipeline = new codepipeline.Pipeline(this, 'CodePipelineBuildBaseImageCodePipeline', {
      artifactBucket: props.artifactBucket,
      pipelineName: `${id}-${this.imageTag}`,
      pipelineType: codepipeline.PipelineType.V1,
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Build',
          actions: [buildAction],
        },
      ],
      restartExecutionOnUpdate: true,
    });
    pipeline.node.addDependency(project);

    // Run this pipeline weekly to update the image OS regularly.
    const pipelineTarget = new events_target.CodePipeline(pipeline);
    new events.Rule(this, 'CodePipelineBuildBaseImageWeeklyRefreshSchedule', {
      schedule: events.Schedule.cron({
        weekDay: 'Monday',
        minute: '0',
        hour: '6',
      }),
      targets: [pipelineTarget],
    });
  }
}
