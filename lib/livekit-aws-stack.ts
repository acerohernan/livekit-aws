import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as path from "path";
import { readFileSync } from "fs";
import { env } from "../config/env";

export class LivekitAwsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* Get the default vpc by lookup */
    const vpc = ec2.Vpc.fromLookup(this, "default-vpc", {
      isDefault: true,
    });

    /* Create the security group for the instance */
    const instanceSecurityGroup = new ec2.SecurityGroup(this, "instance-sg", {
      vpc,
      allowAllOutbound: true,
    });

    /* Allow SSH access from anywhere with the key-pair */
    /* For production environments is safer add only the IP address of the administrator */
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    /* Allow HTTP trafic from anywhere */
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80));

    /* Allow HTTS trafic from anywhere */
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443));

    /* Allow WebRTC over TCP */
    instanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(7881)
    );

    /* Allow 443/UDP - TURN/UDP*/
    instanceSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.udp(443));

    /* Allow UDP ports between 50000-60000 - WebRTC over UDP*/
    instanceSecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.udpRange(50000, 60000)
    );

    /* Create the ec2 isntance */
    const ec2Instance = new ec2.Instance(this, "livekit-instance", {
      vpc,
      securityGroup: instanceSecurityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.BURSTABLE2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: env.EC2_KEY_PAIR_NAME,
    });

    /* Adding the user-data script where we'll setup the livekit-server */
    const livekitInitFile = readFileSync(
      path.resolve(__dirname, "..", "resources", "livekit-init.sh"),
      "utf-8"
    );
    ec2Instance.addUserData(livekitInitFile);

    /* Create an elastic ip address to asociate with the instance */
    const instanceElasticIP = new ec2.CfnEIP(this, "instance-ip");

    /* Associate the elastic ip with the instance */
    new ec2.CfnEIPAssociation(this, "ec2-ip-association", {
      eip: instanceElasticIP.ref,
      instanceId: ec2Instance.instanceId,
    });
  }
}
