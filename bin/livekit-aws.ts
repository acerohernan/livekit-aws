#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { LivekitAwsStack } from "../lib/livekit-aws-stack";

import { config } from "dotenv";
import { env, validateEnvVariables } from "../config/env";

/* Setting up the environment */
config({});
validateEnvVariables();

/* Initialize the CDK app */
const app = new cdk.App();

new LivekitAwsStack(app, `${env.APP_NAME}-stack-${env.ENVIRONMENT}`, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: env.AWS_REGION,
  },
});
