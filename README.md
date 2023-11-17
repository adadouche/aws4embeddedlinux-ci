## My Project

TODO: Fill this README out!


### Development Setup

You can use [`npm link`](https://docs.npmjs.com/cli/v10/commands/npm-link) to develop with a checked out copy of this repo.

```bash
# In this library repo:
$ npm link
$ cd your-project
$ npm link aws4embeddedlinux-ci
```

This will link through the system `node_modules` install. When using a system node install on Linux, this can require sudo access. To avoid this, use a [node version manager](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm#using-a-node-version-manager-to-install-nodejs-and-npm) or [set a node prefix](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally).

## Security

See [SECURITY](SECURITY.md) for more information about reporting issues with this project.

### Git Credentials and Build Time Secrets
[AWS Secrets Manager](https://docs.aws.amazon.com/secretsmanager/latest/userguide/intro.html) is the preferred method of adding secrets to your pipeline. This service provides a structured means of access and avoids pitfalls with putting secrets in environment variables, source repos, etc.

1. Create a _Secret_ in Secrets Manager and add your secret value.
1. Grant permissions to the CodeBuild pipeline project.
   1. Find the IAM role for the CodeBuild Project in the CodeBuild console page under the "Build Details". This is also called the "Service Role".
   1. In the IAM console page, add a new policy, replacing \<Secret ARN> with the ARN of the secret created.
```json
{
    "Version": "2012-10-17",
    "Statement": [ {
        "Effect": "Allow",
        "Action": "secretsmanager:GetSecretValue",
        "Resource": "<Secret ARN>"
    } ]
}
```

The secret can then be used in the CodeBuild Project by adding it to the BuildSpec. See the [CodeBuild Documentation](https://docs.aws.amazon.com/codebuild/latest/userguide/build-spec-ref.html) for more details.
```yaml
env:
    secrets-manager:
        SECRET_VALUE: "<Secret ARN>"
```

### CVE Checking With Yocto

CVE checking is enabled in the reference implementations. Details for this can be found in the [yocto documentation](https://docs.yoctoproject.org/4.0.13/singleindex.html#checking-for-vulnerabilities).

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.