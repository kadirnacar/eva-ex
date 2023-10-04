import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { checkJwt } from '../checkJwt';
import { Share, TransactionType, Transactions, User } from '../entities';

export class TransactionsRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  async buyShare(req: Request, res: Response): Promise<void> {
    try {
      const values = req.body || {};
      const userInfo = res.locals.jwtPayload;
      const user = await User.findOneOrFail({
        where: { id: userInfo.userId },
        relations: { portfolio: true },
      });

      if (!user.portfolio) {
        throw 'You have to create a portfolio for transaction';
      }

      const model: Transactions = Transactions.create(values);
      const share: Share = await Share.findOneOrFail({
        where: { id: values?.share?.id },
      });
      if (!share) {
        throw 'Please select an valid share id';
      }
      model.portfolio = user.portfolio;
      model.price = share.price;
      model.type = TransactionType.BUY;

      const errors = await validate(model);

      if (errors.length > 0) {
        throw errors.map((x) => {
          return Object.keys(x.constraints)
            .map((c) => x.constraints[c])
            .join('\r\n -');
        });
      }

      await model.save();
      res.status(200).send(model);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  async sellShare(req: Request, res: Response): Promise<void> {
    try {
      const values = req.body || {};
      const userInfo = res.locals.jwtPayload;
      const user = await User.findOneOrFail({
        where: { id: userInfo.userId },
        relations: { portfolio: true },
      });

      if (!user.portfolio) {
        throw 'You have to create a portfolio for transaction';
      }

      const share: Share = await Share.findOneOrFail({
        where: { id: values?.share?.id },
      });

      const userPortfolioCase = await Transactions.find({
        where: {
          share: { id: share.id },
          portfolio: { id: user.portfolio.id },
        },
        relations: { portfolio: true },
      });

      const toltal = userPortfolioCase.reduce((prev, cur, index, arr) => {
        return prev + cur.count * (cur.type == TransactionType.BUY ? 1 : -1);
      }, 0);

      if (toltal < values.count) {
        throw 'Your portfolio has not enough for selling this share';
      }

      const model: Transactions = Transactions.create(values);

      if (!share) {
        throw 'Please select an valid share id';
      }
      model.portfolio = user.portfolio;
      model.price = share.price;
      model.type = TransactionType.SELL;

      const errors = await validate(model);

      if (errors.length > 0) {
        throw errors.map((x) => {
          return Object.keys(x.constraints)
            .map((c) => x.constraints[c])
            .join('\r\n -');
        });
      }

      await model.save();
      res.status(200).send(model);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  async init() {
    this.router.post('/buy', [checkJwt], this.buyShare.bind(this));
    this.router.post('/sell', [checkJwt], this.sellShare.bind(this));
  }
}
