import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class UserProfile {
  @ApiProperty({
    description: 'User profile ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  @Column()
  fullName: string;

  @ApiProperty({
    description: 'Avatar URL for the user profile',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  @Column({ nullable: true })
  avatarUrl?: string;

  @ApiProperty({
    description: 'User associated with this profile',
    type: () => User,
  })
  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
