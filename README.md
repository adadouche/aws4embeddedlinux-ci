# aws4embeddedlinux-ci

This [AWS CDK](https://github.com/aws/aws-cdk) library helps you deploy an AWS cloud infrastructure supporting the embedded Linux builds for your project using pipelines.

## Architecture

![architecture overview](images/architecture-v0.2.x.svg "Architecture")

## API documentation

[API documentation](https://aws4embeddedlinux.github.io/aws4embeddedlinux-ci/) generated by `npm run doc`.

## Setup

In order to use this library, you must set up the [AWS CDK](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html), including
installing the CDK tool and bootstrapping the account you wish to deploy to. 

Additionally, you must have [NodeJS](https://nodejs.org/en/) installed.

> [!NOTE]
>
> This library is tested against Node Versions 18, 20, and 22. If these versions are not available for your system, we recommend using [NVM](https://github.com/nvm-sh/nvm) to install a compatible version.
>  

## Quickstart

You can use the [sample code](https://github.com/aws4embeddedlinux/aws4embeddedlinux-ci-examples) provided in our examples repo to get started with deploy the stacks.

### Setting Up A New Project

In order to create a new project, you will need to initialize a new CDK project. 

More details can be found in the [CDK Getting Started Documentation](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html).

The following commands will create a new CDK project named `my-project`:

```bash
mkdir my-project
cd my-project
cdk init app --language typescript
```

Then you will need to install the `aws4embeddedlinux-ci` cdk library:

```bash
npm install aws4embeddedlinux/aws4embeddedlinux-ci
```

Once added, you can start creatin your application using the library. 

Refer to the [API Documentation](https://aws4embeddedlinux.github.io/aws4embeddedlinux-ci) and the [sample](github.com/aws4embeddedlinux/aws4embeddedlinux-ci-examples) for more details.

Once you have completed the code of your application, you can deploy the CDK stack using:

```bash
cdk deploy
```

After the CDK application is successfully deployed, the 'Base Image' pipeline needs to complete successfully. 

This will create an Ubuntu based container for building the Yocto images. 

> [!NOTE]
>
> This container is used by the other pipelines. If the other pipelines are run before this container is created and pushed to [ECR](https://aws.amazon.com/ecr/), they will fail. 
>
> The 'Base Image' pipeline will run weekly by default to keep the container patched and up to date.
>

Once the 'Base Image' pipeline complete successfully, the rest of your application pipelines can be executed. 

> [!NOTE]
>
> We recommend you to deploy first the 'Base Image' pipeline and once the pipeline completes successfully, then you can deploy the other pipelines in you application as described in the [sample](github.com/aws4embeddedlinux/aws4embeddedlinux-ci-examples).
>

Once your pipelines completes successfully, the Yocto deploy directory generated content will be pushed into a S3 bucket.

## Development Setup

You can use [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link) to develop with a local copy of this repo.

### In this library repo:

```bash
npm install
npm run build
npm link
```

### In your project folder:

```bash
npm install
npm link ../aws4embeddedlinux-ci
```

This will link through the system `node_modules` install. 

Then you can import the packages / classes using:

```ts
import {
  EmbeddedLinuxPipelineStack,
  EmbeddedLinuxCodebuildProjectStack,
  BuildImageSourceStack,
  BuildImagePipelineStack,
  BuildImageRepoStack,
  PipelineNetworkStack,
} from "<relative path>/aws4embeddedlinux-ci/lib";
```

> _Note:_
>
> When using a system node install on Linux, this can require sudo access. 
> To avoid this, use a [node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm) or [set a node prefix](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

### Using Git Credentials and Build Time Secrets

[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) is the preferred method for adding and using secrets in your pipelines.

The service provides a structured means of access and avoids the pitfalls of putting secrets in environment variables, source repos, etc.

The following steps detaisl at a high level, how you can enable the use of AWS Secrets Manager in your pipelines:

- Create a _Secret_ in Secrets Manager and add your secret value.
- Grant access permissions to the CodeBuild pipeline project.
- Create a [Policy Statement](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_iam.PolicyStatement.html) which allows `secretsmanager:GetSecretValue` for your secret.
- Add this policy statement to the `buildPolicyAdditions` props for the `EmbeddedLinuxPipelineStack`. e.g.

  ```typescript
  import * as iam from "aws-cdk-lib/aws-iam";

  const pipeline = new EmbeddedLinuxPipelineStack(app, "MyPokyPipeline", {
    imageRepo: buildImageRepo.repository,
    imageTag: ImageKind.Ubuntu22_04,
    vpc: vpc.vpc,
    buildPolicyAdditions: [
      iam.PolicyStatement.fromJson({
        Effect: "Allow",
        Action: "secretsmanager:GetSecretValue",
        Resource:
          "arn:aws:secretsmanager:us-west-2:123456789012:secret:my-secret-??????",
      }),
    ],
  });
  ```
- The secret can then be used in the CodeBuild Project by adding it to the BuildSpec. 

  ```yaml
  env:
      secrets-manager:
          SECRET_VALUE: "<Secret ARN>"
  ```
See the [CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html) for more details.

### CVE Checking With Yocto

CVE checking is enabled in the reference implementations. Details on this can be found in the [Yocto documentation](https://docs.yoctoproject.org/4.0.13/singleindex.html#checking-for-vulnerabilities).

## Known issues

- The use of this CDK library is currently not supported in Windows environments (you can still use WSL).
- When using AWS Cloud9, a micro instance type will run out of memory.
- Deletion of stacks while a CodePipeline is running can lead to unexpected behaviours.
- The NXP-IMX pipeline will fail unless you adjust the build spec file and address the licence acceptance requirement.

## Security

See [SECURITY](SECURITY.md) for more information about reporting issues with this project.

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

This library is licensed under the MIT-0 License. See the [LICENSE](LICENSE) file.
