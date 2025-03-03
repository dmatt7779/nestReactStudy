import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
// import { Usuario } from './usuario.entity';

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

//   @ManyToOne(() => Usuario, usuario => usuario.projects, { onDelete: 'CASCADE' }) // Relación con Usuario
//   usuario: Usuario;
}