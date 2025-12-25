import { MigrationInterface, QueryRunner } from "typeorm";

export class Initial1757689191690 implements MigrationInterface {
    name = 'Initial1757689191690'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_paper" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "description" character varying, "ownerId" uuid NOT NULL, CONSTRAINT "PK_e01726051bb8c7d4403cfd98251" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_profile" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fullName" character varying NOT NULL, "avatarUrl" character varying, CONSTRAINT "PK_f44d0cd18cfd80b0fed7806c3b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."organization_invite_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "organization_invite" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "role" character varying NOT NULL, "status" "public"."organization_invite_status_enum" NOT NULL DEFAULT 'pending', "organizationId" uuid, CONSTRAINT "PK_b36f8c9832b1a4b21118585f8b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_472c1f99a32def1b0abb219cd67" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_organization_role_enum" AS ENUM('admin', 'member')`);
        await queryRunner.query(`CREATE TYPE "public"."user_organization_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "user_organization" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."user_organization_role_enum" NOT NULL DEFAULT 'member', "status" "public"."user_organization_status_enum" NOT NULL DEFAULT 'active', "userId" uuid NOT NULL, "organizationId" uuid NOT NULL, CONSTRAINT "PK_3e103cdf85b7d6cb620b4db0f0c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firebaseUid" character varying NOT NULL, "email" character varying NOT NULL, "credits" integer NOT NULL DEFAULT '0', "profileId" uuid NOT NULL, "activeUserOrganizationId" uuid, CONSTRAINT "UQ_905432b2c46bdcfe1a0dd3cdeff" UNIQUE ("firebaseUid"), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "REL_9466682df91534dd95e4dbaa61" UNIQUE ("profileId"), CONSTRAINT "REL_433e76396d468478f60f7e408a" UNIQUE ("activeUserOrganizationId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."media_origintype_enum" AS ENUM('uploaded', 'generated')`);
        await queryRunner.query(`CREATE TYPE "public"."media_uploadstatus_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TYPE "public"."media_status_enum" AS ENUM('active', 'deleted')`);
        await queryRunner.query(`CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "mimetype" character varying NOT NULL, "originalName" character varying NOT NULL, "originType" "public"."media_origintype_enum" NOT NULL, "size" integer NOT NULL, "uploadStatus" "public"."media_uploadstatus_enum" NOT NULL DEFAULT 'pending', "status" "public"."media_status_enum" NOT NULL DEFAULT 'active', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "uploadedById" uuid, CONSTRAINT "UQ_b305063b0a030ab458c128078c7" UNIQUE ("key"), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_image" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "mediaId" uuid, "questionId" uuid NOT NULL, CONSTRAINT "REL_882c090c1e0d235ba77c07f5a7" UNIQUE ("mediaId"), CONSTRAINT "PK_a7cfd9b1a52e5472a191e23f353" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, "index" integer NOT NULL, "marks" integer NOT NULL, "questionPaperId" uuid NOT NULL, CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "option" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, "index" integer NOT NULL, "questionId" uuid, "subQuestionId" uuid, CONSTRAINT "PK_e6090c1c6ad8962eea97abdbe63" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sub_question" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "text" character varying NOT NULL, "index" integer NOT NULL, "marks" integer NOT NULL, "parentQuestionId" uuid NOT NULL, CONSTRAINT "PK_54bd4cceae8e79550d1280c9a0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."feature_usage_featurekey_enum" AS ENUM('GENERATE_QUESTION_PAPER')`);
        await queryRunner.query(`CREATE TABLE "feature_usage" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying NOT NULL, "organizationId" character varying, "featureKey" "public"."feature_usage_featurekey_enum" NOT NULL, "creditsConsumed" integer NOT NULL DEFAULT '0', "metadata" jsonb, "executedAt" TIMESTAMP NOT NULL DEFAULT now(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f5b7116f8fafba341ccaf86919c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."payment_order_provider_enum" AS ENUM('cashfree')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_order_currency_enum" AS ENUM('INR', 'USD')`);
        await queryRunner.query(`CREATE TYPE "public"."payment_order_status_enum" AS ENUM('pending', 'completed', 'failed')`);
        await queryRunner.query(`CREATE TABLE "payment_order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "provider" "public"."payment_order_provider_enum" NOT NULL, "currencyAmount" integer NOT NULL, "currency" "public"."payment_order_currency_enum" NOT NULL, "creditAmount" integer NOT NULL, "providerData" jsonb NOT NULL, "status" "public"."payment_order_status_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f5221735ace059250daac9d9803" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "credit_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" integer NOT NULL, "metadata" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "relatedUsageId" uuid, "relatedPaymentId" uuid, CONSTRAINT "PK_939cbf4663a29962f4d5d97d054" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_paper" ADD CONSTRAINT "FK_521e9b08a5c6da6ba711a41e967" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "organization_invite" ADD CONSTRAINT "FK_f9f14fcc84f775ab90e97b45893" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_organization" ADD CONSTRAINT "FK_29c3c8cc3ea9db22e4a347f4b5a" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_organization" ADD CONSTRAINT "FK_7143f31467178a6164a42426c15" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9466682df91534dd95e4dbaa616" FOREIGN KEY ("profileId") REFERENCES "user_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_433e76396d468478f60f7e408a6" FOREIGN KEY ("activeUserOrganizationId") REFERENCES "user_organization"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "media" ADD CONSTRAINT "FK_4974d31d47717ebefc8b613eb27" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_image" ADD CONSTRAINT "FK_882c090c1e0d235ba77c07f5a7a" FOREIGN KEY ("mediaId") REFERENCES "media"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_image" ADD CONSTRAINT "FK_3cf408abaa0449a577aa8aa0fd9" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_b8c73218e580829313fdafe5dbc" FOREIGN KEY ("questionPaperId") REFERENCES "question_paper"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_b94517ccffa9c97ebb8eddfcae3" FOREIGN KEY ("questionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "option" ADD CONSTRAINT "FK_777916b6729c845e87948bdea82" FOREIGN KEY ("subQuestionId") REFERENCES "sub_question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "sub_question" ADD CONSTRAINT "FK_f833a45a33bee34a49f2a69b6fc" FOREIGN KEY ("parentQuestionId") REFERENCES "question"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_transaction" ADD CONSTRAINT "FK_735b0e9a9ac973240dc55114c38" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_transaction" ADD CONSTRAINT "FK_6071517261d7bc6bec56d774461" FOREIGN KEY ("relatedUsageId") REFERENCES "feature_usage"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "credit_transaction" ADD CONSTRAINT "FK_b33ed76529ca270cd73fac5c273" FOREIGN KEY ("relatedPaymentId") REFERENCES "payment_order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "credit_transaction" DROP CONSTRAINT "FK_b33ed76529ca270cd73fac5c273"`);
        await queryRunner.query(`ALTER TABLE "credit_transaction" DROP CONSTRAINT "FK_6071517261d7bc6bec56d774461"`);
        await queryRunner.query(`ALTER TABLE "credit_transaction" DROP CONSTRAINT "FK_735b0e9a9ac973240dc55114c38"`);
        await queryRunner.query(`ALTER TABLE "sub_question" DROP CONSTRAINT "FK_f833a45a33bee34a49f2a69b6fc"`);
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_777916b6729c845e87948bdea82"`);
        await queryRunner.query(`ALTER TABLE "option" DROP CONSTRAINT "FK_b94517ccffa9c97ebb8eddfcae3"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_b8c73218e580829313fdafe5dbc"`);
        await queryRunner.query(`ALTER TABLE "question_image" DROP CONSTRAINT "FK_3cf408abaa0449a577aa8aa0fd9"`);
        await queryRunner.query(`ALTER TABLE "question_image" DROP CONSTRAINT "FK_882c090c1e0d235ba77c07f5a7a"`);
        await queryRunner.query(`ALTER TABLE "media" DROP CONSTRAINT "FK_4974d31d47717ebefc8b613eb27"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_433e76396d468478f60f7e408a6"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9466682df91534dd95e4dbaa616"`);
        await queryRunner.query(`ALTER TABLE "user_organization" DROP CONSTRAINT "FK_7143f31467178a6164a42426c15"`);
        await queryRunner.query(`ALTER TABLE "user_organization" DROP CONSTRAINT "FK_29c3c8cc3ea9db22e4a347f4b5a"`);
        await queryRunner.query(`ALTER TABLE "organization_invite" DROP CONSTRAINT "FK_f9f14fcc84f775ab90e97b45893"`);
        await queryRunner.query(`ALTER TABLE "question_paper" DROP CONSTRAINT "FK_521e9b08a5c6da6ba711a41e967"`);
        await queryRunner.query(`DROP TABLE "credit_transaction"`);
        await queryRunner.query(`DROP TABLE "payment_order"`);
        await queryRunner.query(`DROP TYPE "public"."payment_order_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_order_currency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."payment_order_provider_enum"`);
        await queryRunner.query(`DROP TABLE "feature_usage"`);
        await queryRunner.query(`DROP TYPE "public"."feature_usage_featurekey_enum"`);
        await queryRunner.query(`DROP TABLE "sub_question"`);
        await queryRunner.query(`DROP TABLE "option"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "question_image"`);
        await queryRunner.query(`DROP TABLE "media"`);
        await queryRunner.query(`DROP TYPE "public"."media_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."media_uploadstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."media_origintype_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "user_organization"`);
        await queryRunner.query(`DROP TYPE "public"."user_organization_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_organization_role_enum"`);
        await queryRunner.query(`DROP TABLE "organization"`);
        await queryRunner.query(`DROP TABLE "organization_invite"`);
        await queryRunner.query(`DROP TYPE "public"."organization_invite_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_profile"`);
        await queryRunner.query(`DROP TABLE "question_paper"`);
    }

}
