import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import * as crypto from 'crypto';


@Entity()
@Unique(['userId', 'email'])
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ unique: true })
  userId: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: true })
  passwordReset: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP' })
  passwordChangedAt: Date;

  @Column({ nullable: true })
  passwordResetString: string;

  @Column({ length: 512, nullable: true })
  passwordResetToken: string;

  @Column({ length: 512, nullable: true }) 
  accessToken: string;

  @Column({ nullable: true })
  passwordResetExpires: Date;

  createPasswordResetToken(): string {
    const resetToken: string = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = resetToken;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);
    return resetToken;
  }
}
