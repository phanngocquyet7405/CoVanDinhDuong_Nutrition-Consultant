import { Module } from '@nestjs/common';
import { TopsisService } from './topsis.service';

@Module({
  providers: [TopsisService],
  exports: [TopsisService],
})
export class TopsisModule { }
