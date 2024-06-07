import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from 'src/audit-log/entities/audit-log.entity';
import { AuditLogController } from 'src/audit-log/audit-log.controller';
import { AuditLogService } from 'src/audit-log/audit-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog])],
  providers: [AuditLogService], 
  exports: [AuditLogService, TypeOrmModule]
})
export class AuthModule {}
