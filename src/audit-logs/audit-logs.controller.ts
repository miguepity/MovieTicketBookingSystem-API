import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un registro de auditoría' })
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los registros de auditoría' })
  findAll() {
    return this.auditLogsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un registro de auditoría por ID' })
  @ApiParam({ name: 'id', description: 'ID del registro de auditoría' })
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un registro de auditoría' })
  @ApiParam({ name: 'id', description: 'ID del registro de auditoría' })
  update(
    @Param('id') id: string,
    @Body() updateAuditLogDto: UpdateAuditLogDto,
  ) {
    return this.auditLogsService.update(+id, updateAuditLogDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un registro de auditoría' })
  @ApiParam({ name: 'id', description: 'ID del registro de auditoría' })
  remove(@Param('id') id: string) {
    return this.auditLogsService.remove(+id);
  }
}
