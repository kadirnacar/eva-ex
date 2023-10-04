import { DataSource } from 'typeorm';
import * as Entities from './entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DB_URL, //'postgres://evauser:eva123@postgres:5432/evaexchange'
  synchronize: true,
  logging: false,
  subscribers: [],
  migrations: [],

  entities: Object.keys(Entities).map((itm) => {
    return Entities[itm];
  }),
  extra: {
    trustServerCertificate: true,
  },
});

AppDataSource.initialize()
  .then(() => {
    // here you can start to work with your database
  })
  .catch((error) => {
    console.log('err', error);
  });
