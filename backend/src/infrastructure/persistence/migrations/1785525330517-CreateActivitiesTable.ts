import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateActivitiesTable1785525330517 implements MigrationInterface {
  name = 'CreateActivitiesTable1785525330517';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "activities" ("id" uuid NOT NULL, "project_id" uuid NOT NULL, "name" character varying(255) NOT NULL, "bac" double precision NOT NULL, "planned_percentage" double precision NOT NULL, "actual_percentage" double precision NOT NULL, "actual_cost" double precision NOT NULL, CONSTRAINT "PK_7f4004429f731ffb9c88eb486a8" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "activities"`);
  }
}
