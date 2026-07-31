import { Column, Entity, PrimaryColumn } from 'typeorm';

export const PROJECT_NAME_MAX_LENGTH = 255;

@Entity({ name: 'projects' })
export class ProjectOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: PROJECT_NAME_MAX_LENGTH })
  name: string;
}
