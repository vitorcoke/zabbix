import { SlimService } from './slim.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [SlimService],
  exports: [SlimService],
})
export class SlimModule {}
