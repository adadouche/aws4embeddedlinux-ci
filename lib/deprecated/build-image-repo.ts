import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ecr from "aws-cdk-lib/aws-ecr";

/**
 *
 * The ECR Repository to store build host images.
 *
 * This is the output of the {@link BuildImagePipelineStack}
 *
 * @deprecated Use the new {@link PipelineResourcesStack} class instead.
 *
 */
export class BuildImageRepoStack extends cdk.Stack {
  /** The respository to put the build host container in. */
  public readonly repository: ecr.IRepository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.repository = new ecr.Repository(this, "BuildImageRepo", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      emptyOnDelete: true,
    });
  }
}
