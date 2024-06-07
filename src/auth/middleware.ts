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

// [
//   {"surcharge":null,"contactless":null,"requestLocation":null,"description":"FEDERAL ROAD SAFETY CORPS",
//   "requestIp":null,"billsPaymentStatus":"SUCCESS","topUpFee":null,"billerName":"FEDERAL ROAD SAFETY CORPS",
//   "externalRef":null,"responseCode":"00","payerBankCode":null,"formattedTransactionDate":"18-05-2024",
//   "payerAccountNumber":null,"processorId":"Remita","transactionAmount":3161.25,"customerReference":"A311948562172146",
//   "payerName":"fets payment","currency":"NGN","id":200480,"reciepientName":"fets payment","deviceType":"MOBILE",
//   "requestLong":null,"processorFee":null,"transactionReference":"10000000208091","transactionStatus":"PENDING",
//   "requestLat":null,"topUpVat":null,"billPaymentProductName":"VEHICLE NUMBER PLATE VIOLATION (NPV)",
//   "aggregatorId":"11","channelFee":null,"transactionDate":"2024-05-18T19:53:34Z","transactionType":"BILLS_PAYMENT",
//   "amountDue":null,"rrr":"341048630828","customerTotalAmount":null,"costToAgent":null,"feeSharing":null,
//   "profileId":"MER10000000000463","paymentMethod":null,
//   "commissionSharing":
//   {"topUpVat":0,"topUpFee":0,"terminalOwnerCommissionShare":"0.00","superAgentCommissionShare":"53.21",
//   "aggregatorCommissionShare":"0.00","transactionAmount":0,"tpAgtShare":0,"agentCommissionShare":"0.00",
//   "id":131396,"tpSupShare":0,"tpSupVat":0,"commissionAmount":53.21,"tpAgrShare":0},
//   "responseMessage":"Bills Payment Processed Successfully","customerPhoneNumber":"09078767826"
// }, 
  
//   {"surcharge":null,"contactless":null,"requestLocation":null,"description":"FEDERAL ROAD SAFETY CORPS",
//   "requestIp":null,"billsPaymentStatus":"SUCCESS","topUpFee":null,"billerName":"FEDERAL ROAD SAFETY CORPS",
//   "externalRef":null,"responseCode":"00","payerBankCode":null,"formattedTransactionDate":"17-05-2024",
//   "payerAccountNumber":null,"processorId":"Remita","transactionAmount":3161.25,
//   "customerReference":"A026721846171425","payerName":"fets payment","currency":"NGN","id":199742,
//   "reciepientName":"fets payment","deviceType":"MOBILE","requestLong":null,"processorFee":null,
//   "transactionReference":"10000000207259","transactionStatus":"PENDING","requestLat":null,
//   "topUpVat":null,"billPaymentProductName":"VEHICLE NUMBER PLATE VIOLATION (NPV)","aggregatorId":"11",
//   "channelFee":null,"transactionDate":"2024-05-17T22:59:54Z","transactionType":"BILLS_PAYMENT","amountDue":null,
//   "rrr":"311048293722","customerTotalAmount":null,"costToAgent":null,"feeSharing":null,
//   "profileId":"MER10000000000463","paymentMethod":null,
//   "commissionSharing":
//   {"topUpVat":0,"topUpFee":0,"terminalOwnerCommissionShare":"0.00","superAgentCommissionShare":"53.21",
//   "aggregatorCommissionShare":"0.00","transactionAmount":0,"tpAgtShare":0,"agentCommissionShare":"0.00",
//   "id":130788,"tpSupShare":0,"tpSupVat":0,"commissionAmount":53.21,"tpAgrShare":0},
//   "responseMessage":"Bills Payment Processed Successfully","customerPhoneNumber":"08168208035"
// }, 

// {"surcharge":null,"contactless":null,"requestLocation":null,"description":"FEDERAL ROAD SAFETY CORPS",
// "requestIp":null,"billsPaymentStatus":null,"topUpFee":null,"billerName":"FEDERAL ROAD SAFETY CORPS",
// "externalRef":null,"responseCode":"00","payerBankCode":null,"formattedTransactionDate":"17-05-2024",
// "payerAccountNumber":null,"processorId":"Remita","transactionAmount":3161.25,"customerReference":"A849401173171405",
// "payerName":"fets payment","currency":"NGN","id":199722,"reciepientName":"fets payment","deviceType":"MOBILE",
// "requestLong":null,"processorFee":null,"transactionReference":"10000000207239","transactionStatus":"PENDING",
// "requestLat":null,"topUpVat":null,"billPaymentProductName":"WRONGFUL OVERTAKING (WOV","aggregatorId":"11",
// "channelFee":null,"transactionDate":"2024-05-17T22:35:50Z","transactionType":"BILLS_PAYMENT","amountDue":null,
// "rrr":"341048384785","customerTotalAmount":null,"costToAgent":null,"feeSharing":null,"profileId":"MER10000000000463",
// "paymentMethod":null,"commissionSharing":{"topUpVat":null,"topUpFee":null,"terminalOwnerCommissionShare":"0.00",
// "superAgentCommissionShare":"53.21","aggregatorCommissionShare":"0.00","transactionAmount":3000,"tpAgtShare":null,
// "agentCommissionShare":"0.00","id":130769,"tpSupShare":null,"tpSupVat":null,"commissionAmount":53.21,
// "tpAgrShare":null},"responseMessage":"Approved or completed successfully","customerPhoneNumber":"08168208035"}, 
// ]

