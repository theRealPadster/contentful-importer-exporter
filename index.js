'use strict'

const koa = require('koa'),
      views = require('koa-views'),
      Router = require('koa-router'),
      path = require('path'),
      contentfulImport = require('contentful-import'),
      contentfulExport = require('contentful-export');

const app = new koa();
const router = new Router();

router.get('/', async ctx => {
  await ctx.render('index');
});

router.post('/', async ctx => {
  try {
    const body = ctx.request.body;
    console.log('ENVIRONMENT: ---------');
    console.log(body.exportEnvironment? body.exportEnvironment : 'master');

    // validate that all the necessary fields have been sent
    if(body.mode && body.mode == 'backup-only') {
      if(!(body.backupName && body.exportSpace && body.exportManagement)) throw new Error('missing information');

      await contentfulExport({
        spaceId: body.exportSpace,
        managementToken: body.exportManagement,
        exportDir: './backups/',
        contentFile: body.backupName.replace(/\s+/g, '-').toLowerCase() + '.json',
      });

    } else if (body.mode && body.mode == 'backup-and-import') {
      if(!(body.backupName && body.exportSpace && body.exportManagement && body.importSpace && body.importManagement)) throw new Error('missing information');

      let reducedFileName = body.backupName.replace(/\s+/g, '-').toLowerCase();

      await contentfulExport({
        spaceId: body.exportSpace,
        managementToken: body.exportManagement,
        environmentId: body.exportEnvironment? body.exportEnvironment : 'master',
        exportDir: './backups/',
        contentFile: reducedFileName + '.json'
      });

      await contentfulImport({
        spaceId: body.importSpace,
        managementToken: body.importManagement,
        environmentId: 'master',
        contentFile: './backups/' + reducedFileName + '.json'
      });

    } else {
      throw new Error('mode not supported');
    }

    ctx.status = 200;
    ctx.body = {success: true, message: 'Information successfully backed up'};
  } catch(e) {
    if(e.message == 'mode not supported') {
      ctx.status = 400;
      ctx.body = { success: false, message: 'the mode selected is not supported by this application, or no mode has been selected at all' };
    } else if(e.message == 'missing information') {
      ctx.status = 400;
      ctx.body = { success: false, message: 'information missing in form submission' };
    } else {
      console.log(e);
      ctx.status = 500;
      ctx.body = {success: false, message: e.message};
    }
  }
});

app
  .use(views(path.resolve(__dirname, './views')), { map: { html: 'swig' } })
  .use(require('koa-bodyparser')())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('The magic is happening at: http://localhost:3000'));
