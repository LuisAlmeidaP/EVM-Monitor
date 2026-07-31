import { Column, Entity, PrimaryColumn } from 'typeorm';

export const ACTIVITY_NAME_MAX_LENGTH = 255;

@Entity({ name: 'activities' })
export class ActivityOrmEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @Column({ type: 'varchar', length: ACTIVITY_NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'double precision' })
  bac: number;

  @Column({ type: 'double precision', name: 'planned_percentage' })
  plannedPercentage: number;

  @Column({ type: 'double precision', name: 'actual_percentage' })
  actualPercentage: number;

  @Column({ type: 'double precision', name: 'actual_cost' })
  actualCost: number;
}
