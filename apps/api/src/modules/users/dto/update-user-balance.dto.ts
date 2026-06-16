import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, Max, Min } from 'class-validator';

export class UpdateUserBalanceDto {
  @ApiProperty({ type: Number, minimum: 0, maximum: 999.9 })
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(0)
  @Max(999.9)
  balance: number;
}
