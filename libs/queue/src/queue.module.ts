import { DynamicModule, Global, Module } from '@nestjs/common';
import { IQueueOptions } from './queue.model';
import { buildChannelProvider } from './queue.helpers';
import { QueueService } from './queue.service';

@Global()
@Module({})
export class QueueModule {
  static forRootAsync(options: IQueueOptions): DynamicModule {
    return {
      module: QueueModule,
      providers: [
        buildChannelProvider(options),
        QueueService,
      ],
      exports: [QueueService],
    };
  }
}
