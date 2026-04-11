import { Controller, Get, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '@ikary/system-auth';
import { PreviewBootstrapService } from './preview-bootstrap.service.js';

@ApiTags('auth')
@Controller('auth')
export class PreviewAuthController {
  constructor(
    @Inject(PreviewBootstrapService) private readonly preview: PreviewBootstrapService,
  ) {}

  @Get('preview-token')
  @Public()
  @ApiOperation({ summary: 'Get the preview JWT for local development' })
  getPreviewToken() {
    const token = this.preview.getToken();
    if (!token) {
      throw new HttpException('Preview token not available', HttpStatus.SERVICE_UNAVAILABLE);
    }

    const user = this.preview.getUser();
    return {
      token,
      userId: user?.userId,
      workspaceId: user?.workspaceId,
      tenantId: user?.tenantId,
    };
  }
}
