import { MigrationInterface, QueryRunner } from "typeorm";

export class AuthChanges1779991707985 implements MigrationInterface {
    name = 'AuthChanges1779991707985'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "refresh_token" TO "status"`);
        await queryRunner.query(`CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "refresh_token_hash" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum" RENAME TO "roles_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."roles_permissions_enum" AS ENUM('admin', 'read_apps', 'manage_apps', 'read_roles', 'manage_roles')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "permissions" TYPE "public"."roles_permissions_enum"[] USING "permissions"::"text"::"public"."roles_permissions_enum"[]`);
        await queryRunner.query(`DROP TYPE "public"."roles_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('active', 'blocked')`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" "public"."users_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" character varying`);
        await queryRunner.query(`CREATE TYPE "public"."roles_permissions_enum_old" AS ENUM('admin', 'read_apps', 'manage_apps')`);
        await queryRunner.query(`ALTER TABLE "roles" ALTER COLUMN "permissions" TYPE "public"."roles_permissions_enum_old"[] USING "permissions"::"text"::"public"."roles_permissions_enum_old"[]`);
        await queryRunner.query(`DROP TYPE "public"."roles_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."roles_permissions_enum_old" RENAME TO "roles_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "user_sessions"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "status" TO "refresh_token"`);
    }

}
