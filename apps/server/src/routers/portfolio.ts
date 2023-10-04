import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { checkJwt } from '../checkJwt';
import { Portfolio, User } from '../entities';

export class PortfolioRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      const userInfo = res.locals.jwtPayload;
      const user: User = await User.findOneOrFail({
        where: { id: userInfo.userId },
        relations: { portfolio: true },
      });
      let model = user.portfolio;

      if (!model) {
        model = Portfolio.create();
      }
      user.portfolio = model;
      const errors = await validate(model);

      if (errors.length > 0) {
        throw errors.map((x) => {
          return Object.keys(x.constraints)
            .map((c) => x.constraints[c])
            .join('\r\n -');
        });
      }

      await user.save();
      res.status(200).send(model);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  async init() {
    this.router.post('/', [checkJwt], this.createItem.bind(this));
  }
}
