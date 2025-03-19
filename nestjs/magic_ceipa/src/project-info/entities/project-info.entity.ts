import { User } from '../../users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, DeleteDateColumn } from 'typeorm';

@Entity()
export class ProjectInfo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  projectName: string;

  @Column('simple-array')
  teamMembers: string[];

  @Column()
  openingYear: number;

  @Column('simple-array')
  professor: string[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userEmail', referencedColumnName: 'email'})
  user: User;

  @Column()
  userEmail: string;

  @DeleteDateColumn()
  deletedAt: Date;
}