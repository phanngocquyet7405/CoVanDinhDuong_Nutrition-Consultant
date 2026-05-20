import { Module } from '@nestjs/common';
import { AhpService } from './ahp.service';

@Module({
  providers: [AhpService],
  exports: [AhpService],
})
export class AhpModule { }
