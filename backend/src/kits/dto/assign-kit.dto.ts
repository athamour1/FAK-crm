import { IsArray, IsString } from 'class-validator';

export class AssignKitDto {
  /** Array of user IDs to assign. Pass empty array to unassign all. */
  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}
