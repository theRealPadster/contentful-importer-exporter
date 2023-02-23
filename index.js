'use strict';

const koa = require('koa');
const views = require('koa-views');
const Router = require('koa-router');
const path = require('path');
const contentfulImport = require('contentful-import');
const contentfulExport = require('contentful-export');

const app = new koa();
const router = new Router();

// GET route (render the page)
router.get('/', async ctx => {
  await ctx.render('index');
});

// POST route (handle the form submission)
router.post('/', async ctx => {
  try {
    const body = ctx.request.body;
    const environment = body.exportEnvironment || 'master';
    console.log(`ENVIRONMENT: ${environment} ---------`);

    const reducedBackupName = body.backupName.replace(/\s+/g, '-').toLowerCase();

    // validate that all the necessary fields have been sent
    if(body.mode && body.mode === 'backup-only') {
      if(!(body.backupName && body.exportSpace && body.exportManagement)) throw new Error('missing information');

      await contentfulExport({
        spaceId: body.exportSpace,
        managementToken: body.exportManagement,
        environmentId: environment,
        exportDir: `./backups/${reducedBackupName}/`,
        contentFile: `${reducedBackupName}.json`,
        downloadAssets: body.includeAssets ? true : false,
      });

    } else if (body.mode && body.mode === 'backup-and-import') {
      if(!(body.backupName && body.exportSpace && body.exportManagement && body.importSpace && body.importManagement)) throw new Error('missing information');

      await contentfulExport({
        spaceId: body.exportSpace,
        managementToken: body.exportManagement,
        environmentId: environment,
        exportDir: `./backups/${reducedBackupName}/`,
        contentFile: `${reducedBackupName}.json`,
        downloadAssets: body.includeAssets ? true : false,
      });

      await contentfulImport({
        spaceId: body.importSpace,
        managementToken: body.importManagement,
        environmentId: 'master',
        contentFile: `./backups/${reducedBackupName}/${reducedBackupName}.json`,
        uploadAssets: body.includeAssets ? true : false,
        assetsDirectory: `./backups/${reducedBackupName}/`,
      });

    } else if (body.mode && body.mode === 'import-only') {
      console.log('import only not implemented yet');
      throw new Error('mode not supported');
    } else {
      throw new Error('mode not supported');
    }

    ctx.status = 200;
    ctx.body = {success: true, message: 'Information successfully backed up'};
  } catch(e) {
    if(e.message === 'mode not supported') {
      ctx.status = 400;
      ctx.body = { success: false, message: 'the mode selected is not supported by this application, or no mode has been selected at all' };
    } else if(e.message === 'missing information') {
      ctx.status = 400;
      ctx.body = { success: false, message: 'information missing in form submission' };
    } else {
      console.log(e);
      ctx.status = 500;
      ctx.body = {success: false, message: e.message};
    }
  }
});

// Initialize the server
app
  .use(views(path.resolve(__dirname, './views')), { map: { html: 'swig' } })
  .use(require('koa-bodyparser')())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('The magic is happening at: http://localhost:3000'));
