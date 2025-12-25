import { MigrationInterface, QueryRunner } from "typeorm";

export class MinorCreditAndUtilityChange1759509990521 implements MigrationInterface {
    name = 'MinorCreditAndUtilityChange1759509990521'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "lastCreditsUpdated" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TYPE "public"."feature_usage_featurekey_enum" RENAME TO "feature_usage_featurekey_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."feature_usage_featurekey_enum" AS ENUM('GENERATE_QUESTION_PAPER', 'GENERATE_QUESTION_PAPER_WITH_AI', 'GENERATE_IMAGE')`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ALTER COLUMN "featureKey" TYPE "public"."feature_usage_featurekey_enum" USING "featureKey"::"text"::"public"."feature_usage_featurekey_enum"`);
        await queryRunner.query(`DROP TYPE "public"."feature_usage_featurekey_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."feature_usage_featurekey_enum_old" AS ENUM('GENERATE_QUESTION_PAPER')`);
        await queryRunner.query(`ALTER TABLE "feature_usage" ALTER COLUMN "featureKey" TYPE "public"."feature_usage_featurekey_enum_old" USING "featureKey"::"text"::"public"."feature_usage_featurekey_enum_old"`);
        await queryRunner.query(`DROP TYPE "public"."feature_usage_featurekey_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."feature_usage_featurekey_enum_old" RENAME TO "feature_usage_featurekey_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastCreditsUpdated"`);
    }

}
