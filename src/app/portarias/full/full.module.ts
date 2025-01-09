import { FullService } from './full.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [FullService],
  exports: [FullService],
})
export class FullModule {}
