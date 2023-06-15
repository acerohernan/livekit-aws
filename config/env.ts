import { ZodIssue, z } from "zod";

const envSchema = z.object({
  ENVIRONMENT: z.string().nonempty(),
  APP_NAME: z.string().nonempty(),
  AWS_REGION: z.string().nonempty(),
  EC2_KEY_PAIR_NAME: z.string().nonempty(),
});

type ENV = z.infer<typeof envSchema>;

export const env: ENV = process.env as ENV;

export function validateEnvVariables() {
  try {
    envSchema.parse(process.env);
  } catch (err: any) {
    /* Format all the zod issues */
    const errors = err.issues.map(
      (issue: ZodIssue) => `${issue.path[0]}: ${issue.message}`
    );

    console.error(
      `Fix all the errors with the environment variables before to start: `,
      errors
    );

    /* Finish the node proccess */
    process.exit(1);
  }
}
