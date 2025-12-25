import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

export enum UploadStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum MediaStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export enum MediaOriginType {
  UPLOADED = 'uploaded',
  GENERATED = 'generated',
}

@Entity()
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  key: string;

  @Column()
  mimetype: string;

  @Column()
  originalName: string;

  @Column({
    type: 'enum',
    enum: MediaOriginType,
  })
  originType: MediaOriginType;

  @Column()
  size: number;

  @Column({
    type: 'enum',
    enum: UploadStatus,
    default: UploadStatus.PENDING,
  })
  uploadStatus: UploadStatus;

  @Column({
    type: 'enum',
    enum: MediaStatus,
    default: MediaStatus.ACTIVE,
  })
  status: MediaStatus;

  @ManyToOne(() => User)
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;
}
