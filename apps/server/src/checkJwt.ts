import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

export const jwtSecret = '@QEGTUI44';

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = <string>req.headers['auth'];
  let jwtPayload;

  try {
    jwtPayload = <any>jwt.verify(token, jwtSecret);
    res.locals.jwtPayload = jwtPayload;
  } catch (error) {
    res.status(401).send("Authantication required");
    return;
  }

  res.setHeader('token', token);
  next();
};
