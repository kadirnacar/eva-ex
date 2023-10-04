import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { Share, SharePriceHistory } from '../entities';
import { BaseRouter } from './BaseRouter';
import { checkJwt } from '../checkJwt';

export class ShareRouter extends BaseRouter {
  router: Router;

  constructor() {
    super('Share');
    super.init();
    this.init();
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      var values = req.body || {};
      let model = await Share.findOne({
        where: [{ name: values.name }, { code: values.code }],
      });

      if (model) {
        throw 'This name or code used before.  Plase enter another name or code and try again';
      }

      model = Share.create(values);
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

  public async updatePrice(req: Request, res: Response) {
    try {
      const values = req.body || {};
      const model = await Share.findOneOrFail({
        where: {
          id: values.id,
        },
      });

      if (values.price && model.price && model.price != values.price) {
        const oldPrices = await model.priceHistory;
        const lastPriceDate =
          oldPrices.length > 0
            ? Math.max.apply(
                Math,
                oldPrices?.map((o) => {
                  return o.updateDate;
                })
              )
            : model.updateDate;
        const diff =
          (new Date().getTime() -
            (new Date(lastPriceDate) || new Date()).getTime()) /
          1000;
        if (diff < 3600) {
          const remain = 3600 - diff;
          throw `You can update price after ${Math.floor(
            remain / 60
          )} minutes ${Math.floor(remain % 60)} seconds later`;
        }

        oldPrices.push(SharePriceHistory.create({ price: model.price }));
        model.priceHistory = Promise.resolve(oldPrices);
        Share.merge(model, values);
        const errors = await validate(model);

        if (errors.length > 0) {
          throw errors.map((x) => {
            return Object.keys(x.constraints).map((c) => x.constraints[c]);
          });
        }
        await model.save();
      }

      res.status(200).send(model);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  public async deleteItem(req: Request, res: Response) {
    try {
      const id = req.params['id'] || '-1';
      const model = await Share.findOneByOrFail({
        id: parseInt(id),
      });
      await model.softRemove();
      res.status(200).send({ id });
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  async init() {
    this.router.patch('/', [checkJwt], this.updatePrice.bind(this));
  }
}
