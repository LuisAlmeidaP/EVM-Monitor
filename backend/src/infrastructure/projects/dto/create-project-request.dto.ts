import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { PROJECT_NAME_MAX_LENGTH } from '../entities/project.orm-entity';

export class CreateProjectRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(PROJECT_NAME_MAX_LENGTH)
  nombre: string;
}
