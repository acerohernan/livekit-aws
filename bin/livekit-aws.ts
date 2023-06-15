#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LivekitAwsStack } from '../lib/livekit-aws-stack';

const app = new cdk.App();

new LivekitAwsStack(app, 'LivekitAwsStack'  , {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});