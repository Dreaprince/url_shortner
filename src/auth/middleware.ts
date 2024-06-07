import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { config as dotenvConfig } from 'dotenv';
import { AuditLogService } from 'src/audit-log/audit-log.service';

dotenvConfig();

// Declaration merging
declare global {
    namespace Express {
      interface Request {
        decoded?: any;
      }
    }
  }

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    constructor(private readonly auditLogService: AuditLogService) {}

    use(req: Request, res: Response, next: NextFunction) {
      const token = req.headers['token'];
      if (!token) {
        throw new UnauthorizedException('Auth token is not supplied');
      }
  
      // Check if token is an array
      if (Array.isArray(token)) {
        throw new UnauthorizedException('Invalid token format');
      }
  
      jwt.verify(
        token, 
        process.env.JWT_SECRET,
        (err, decoded) => {
        if (err) {
            throw new UnauthorizedException('Invalid token');
        } else {
          req.decoded = decoded;
          this.logUserActivity(req)
          next();
        }
      });
    }

    async logUserActivity(req: any) {
        try {
            if (req.method !== 'GET') {
                const auditLogObject = {
                    userId: req.decoded.userId,
                    fullName: req.decoded.fullName,
                    action: req.method,
                    newData: JSON.stringify(req.body),
                    resource: req.originalUrl,
                    role: req.decoded.role,
                };
                await this.auditLogService.logUserActivity(auditLogObject);
            }
        } catch (error) {
            console.log("Error occurred while logging user activity: ", error);
            throw error;
        }
    }
}



