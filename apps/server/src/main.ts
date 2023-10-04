import * as bodyParser from 'body-parser';
import express from 'express';
import * as path from 'path';
import * as database from './database';
import { AuthRouter } from './routers/auth';
import { ShareRouter } from './routers/share';
import { TransactionsRouter } from './routers/transactions';
import { PortfolioRouter } from './routers/portfolio';
import * as pg from 'pg';
import * as classValidator from 'class-validator';

const dbInit = database.AppDataSource;
const app = express();

function corsPrefetch(req: Request, res: express.Response, next: Function) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, *');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}

app.use(corsPrefetch as any);
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to EvaExchange!' });
});

app.use('/api/auth', new AuthRouter().router);
app.use('/api/share', new ShareRouter().router);
app.use('/api/portfolio', new PortfolioRouter().router);
app.use('/api/transactions', new TransactionsRouter().router);

const port = process.env.PORT || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
