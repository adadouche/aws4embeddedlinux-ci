import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
  SourceRepo,
  ProjectKind,
} from "../../lib/deprecated/constructs/source-repo";

describe("Pipeline Source Repository", () => {
  const props = {
    env: { account: "12341234", region: "eu-central-1" },
    kind: ProjectKind.Poky,
    repoName: "charlie",
  };

  test("Snapshot", () => {
    const app = new cdk.App();
    const stack = new cdk.Stack(app, "TestStack", props);
    new SourceRepo(stack, "MyTestStack", props);
    const template = Template.fromStack(stack);
    expect(template).toMatchSnapshot();
  });
});
