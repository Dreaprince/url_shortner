import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import * as crypto from 'crypto';


@Entity()

export class ShortenUrl {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  description: string;

  @Column()
  name: string;

  @Column()
  website: string;

}
