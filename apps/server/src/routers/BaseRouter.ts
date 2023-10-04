import { validate } from 'class-validator';
import { Request, Response, Router } from 'express';
import { IOptionsObject, QueryBuilder } from 'typeorm-query-parser';
import { checkJwt } from '../checkJwt';
import { Repo } from '../entities';

export class BaseRouter {
  router: Router;

  constructor(public entityName: string) {
    this.router = Router();
    this.init();
  }

  public async getList(req: Request, res: Response): Promise<void> {
    try {
      var params = req.query || {};
      const options: IOptionsObject = {};
      const parser = new QueryBuilder(options);
      const parsedQuery: any = parser.build(params);
      const data = await Repo[this.entityName].find(parsedQuery);
      res.status(200).send(data);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  public async getItem(req: Request, res: Response) {
    try {
      const id = req.params['id'] || '-1';
      var params = req.query || {};
      const options: IOptionsObject = {};
      const parser = new QueryBuilder(options);
      const parsedQuery: any = parser.build(params);
      const data = await Repo[this.entityName].findOneOrFail({
        where: {
          id: parseInt(id),
        },
        ...parsedQuery,
      });
      res.status(200).send(data);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  public async deleteItem(req: Request, res: Response) {
    try {
      const id = req.params['id'] || '-1';
      const model = await Repo[this.entityName].findOneByOrFail({
        id: parseInt(id),
      });
      await model.softRemove();
      res.status(200).send({ id });
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  public async updateItem(req: Request, res: Response) {
    try {
      const values = req.body || {};
      const model = await Repo[this.entityName].findOneByOrFail({
        id: values.id,
      });
      Repo[this.entityName].merge(model, values);
      const errors = await validate(model);

      if (errors.length > 0) {
        if (errors.length > 0) {
          throw errors.map((x) => {
            return Object.keys(x.constraints)
              .map((c) => x.constraints[c])
              .join('\r\n -');
          });
        }
      }
      await model.save();
      res.status(200).send(model);
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  async createItem(req: Request, res: Response): Promise<void> {
    try {
      var values = req.body || {};
      const model = Repo[this.entityName].create(values);
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
    this.router.get('/', [checkJwt], this.getList.bind(this));
    this.router.get('/:id', [checkJwt], this.getItem.bind(this));
    this.router.delete('/:id', [checkJwt], this.deleteItem.bind(this));
    this.router.patch('/', [checkJwt], this.updateItem.bind(this));
    this.router.post('/', [checkJwt], this.createItem.bind(this));
  }
}
