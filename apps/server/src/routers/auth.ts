import * as bcrypt from 'bcryptjs';
import { validate } from 'class-validator';
import { NextFunction, Request, Response, Router } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtSecret } from '../checkJwt';
import { User } from '../entities';

export class AuthRouter {
  router: Router;

  constructor() {
    this.router = Router();
    this.init();
  }

  public async login(req: Request, res: Response, next: NextFunction) {
    try {
      let { email, password } = req.body;
      if (!(email && password)) {
        res.status(400).send({});
        return;
      }

      let user: User;
      try {
        user = await User.findOne({
          where: { email: email },
        });
      } catch (error) {
        throw { error };
      }
      if (!user) {
        throw 'User not found!';
      }

      var checkPassword = await bcrypt.compareSync(password, user.password);

      if (!checkPassword) {
        throw 'User not authanticated. Please check your name and password!';
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: '20000 days' }
      );

      res.contentType('application/json').send({
        token,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }
  public async register(req: Request, res: Response, next: NextFunction) {
    try {
      var values = req.body;
      let { email } = values;

      if (!email) {
        throw 'Enter a valid email';
      }

      let user: User;
      try {
        user = await User.findOne({
          where: { email: email },
        });
      } catch (error) {
        throw { error };
      }
      if (user) {
        throw 'This email used before. Plase enter another mail and try again';
      } else {
        user = User.create();
      }

      values.isValidated = true;
      User.merge(user, values);
      const errors = await validate(user);

      if (errors.length > 0) {
        throw errors.map((x) => {
          return Object.keys(x.constraints)
            .map((c) => x.constraints[c])
            .join('\r\n -');
        });
      }

      user.password = await bcrypt.hashSync(values.password, 8);

      await user.save();
      res
        .contentType('application/json')
        .status(200)
        .send({ user: user.id.toString() });
    } catch (error) {
      res.contentType('application/json').status(400).send({ error });
    }
  }

  public async check(req: Request, res: Response, next: NextFunction) {
    const token = <string>req.headers['auth'];

    try {
      const jwtPayload = <any>jwt.verify(token, jwtSecret);
      res.send(true);
    } catch (error) {
      res.send(false);
    }
  }

  async init() {
    this.router.post('/login', this.login.bind(this));
    this.router.post('/register', this.register.bind(this));
    this.router.post('/check', this.check.bind(this));
  }
}
