import * as Validator from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Share extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0, type: 'float' })
  @Validator.IsNumber({ maxDecimalPlaces: 2 })
  @Validator.IsNotEmpty()
  price: number;

  @OneToMany(() => SharePriceHistory, (x) => x.share, {
    cascade: true,
    orphanedRowAction: 'disable',
    nullable: true,
    lazy: true,
  })
  priceHistory!: Promise<SharePriceHistory[]>;

  @Column()
  @Validator.IsNotEmpty()
  name: string;

  @Column({ length: 3 })
  @Validator.Length(3, 3)
  @Validator.IsNotEmpty()
  @Validator.IsUppercase()
  code: string;

  @CreateDateColumn({ nullable: true })
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate?: Date;
}

@Entity()
export class SharePriceHistory extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0, type: 'float' })
  @Validator.IsNumber({ maxDecimalPlaces: 2 })
  @Validator.IsNotEmpty()
  price: number;

  @ManyToOne(() => Share, (x) => x.priceHistory)
  share: Relation<Share>;

  @CreateDateColumn({ nullable: true })
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate?: Date;
}

@Entity()
export class Portfolio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ nullable: true })
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate?: Date;

  @OneToOne(() => User, (x) => x.portfolio)
  @JoinColumn()
  user?: Relation<User>;

  @OneToMany(() => Transactions, (x) => x.portfolio, {
    cascade: true,
    orphanedRowAction: 'disable',
    nullable: true,
    lazy: true,
  })
  transactions: Promise<Transactions[]>;
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ nullable: true })
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate?: Date;

  @Column()
  @Validator.IsNotEmpty()
  name: string;

  @Column()
  @Validator.IsNotEmpty()
  @Validator.IsStrongPassword(
    {
      minLength: 6,
      minUppercase: 1,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message: (args) =>
        `property ${args.property} error.${args.constraints.map((cnt) =>
          Object.keys(cnt).map((msg) => ` -${msg}: ${cnt[msg]}`)
        )}`,
    }
  )
  password: string;

  @Column()
  @Validator.IsNotEmpty()
  @Validator.IsEmail({})
  email: string;

  @Column({ nullable: true })
  isValidated?: boolean;

  @OneToOne(() => Portfolio, (x) => x.user, { cascade: true })
  portfolio?: Relation<Portfolio>;
}

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
}

@Entity()
export class Transactions extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({ nullable: true })
  createDate?: Date;

  @UpdateDateColumn({ nullable: true })
  updateDate?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedDate?: Date;

  @ManyToOne(() => Portfolio, (x) => x.transactions, { nullable: false })
  @JoinColumn()
  @Validator.IsNotEmpty()
  portfolio: Relation<Portfolio>;

  @ManyToOne(() => Share)
  @JoinColumn()
  share: Relation<Share>;

  @Column({ nullable: true, default: 0 })
  @Validator.IsNotEmpty()
  count?: number;

  @Column({ default: 0, type: 'float' })
  @Validator.IsNumber({ maxDecimalPlaces: 2 })
  @Validator.IsNotEmpty()
  price: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.SELL,
  })
  type?: TransactionType;
}

export const Repo = {
  Share,
  SharePriceHistory,
  User,
  Portfolio,
  Transactions,
};
