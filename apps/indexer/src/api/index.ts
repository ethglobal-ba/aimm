import { db } from 'ponder:api';
import schema from 'ponder:schema';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { client, graphql } from 'ponder';

const app = new Hono();

// Fully permissive CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowHeaders: ['*'],
  exposeHeaders: ['*'],
  credentials: true,
  maxAge: 86400,
}));

app.use('/sql/*', client({ db, schema }));

app.use('/', graphql({ db, schema }));
app.use('/graphql', graphql({ db, schema }));

export default app;
