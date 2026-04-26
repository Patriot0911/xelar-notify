import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { FEATURE_KEY } from '../decorator/features.decorator';
import { featureConfig } from '@libs/config';

@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(featureConfig.KEY)
    private featureConfigService: ConfigType<typeof featureConfig>,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const feature = this.reflector.get<string>(
      FEATURE_KEY,
      ctx.getHandler(),
    );

    if (!feature) {
      return true;
    }

    const enabled = this.featureConfigService[feature];

    if (!enabled) {
      throw new ForbiddenException(`Feature "${feature}" is disabled`);
    }
    return true;
  }
}
