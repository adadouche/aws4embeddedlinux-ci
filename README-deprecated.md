# aws4embeddedlinux-ci - Deprecated API

This [AWS CDK](https://github.com/aws/aws-cdk) library helps you deploy an AWS cloud infrastructure supporting the embedded Linux builds for your project using pipelines.

This README is documenting the deprecated set of APIs. 

## Architecture

Here is the overall architecture :

![architecture overview](images/architecture-v0.1.x.svg "Architecture")

As you can notice, the architecture is using AWS CodeCommit (compared to S3 in the non deprecated version) which is no longer available in newly created AWS accounts.

## API documentation

The [API documentation](https://aws4embeddedlinux.github.io/aws4embeddedlinux-ci/) generated by `npm run doc` includes both APIs.

## Setup

The instructions remains the same as in the [README](./README.md) except for the packages / classes imports:

```ts
import {
  EmbeddedLinuxPipelineStack,
  EmbeddedLinuxCodebuildProjectStack,
  BuildImageDataStack,
  BuildImagePipelineStack,
  BuildImageRepoStack,
  PipelineNetworkStack,
  ImageKind,
  ProjectKind,
} from "<relative path>/aws4embeddedlinux-ci/lib";
```

## Known issues

Please refer to the [README](./README.md)

## Security

Please refer to the [README](./README.md)

## Contributing

Please refer to the [README](./README.md)

## License

Please refer to the [README](./README.md)