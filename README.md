# :minidisc: Contentful Export/Import Tool

The tool creates a nice web/GUI format to allow for easy exporting and optional importing of Contentful information. The tool in question is a tiny Node/Koa application.

## :electric_plug: How to Use?

Clone the source and run `npm i` to install the appropriate modules. Start the server with `npm start` and open the browser window to [http://localhost:3000](http://localhost:3000) to get started.

In both circumstances of exporting and importing you will need the space ID for the Contentful space as well as a management token. Both can be obtained from Contenful from Settings > API Keys.

Enter the appopriate information and set either the backup or backup and import mode. The results or information is backed up in the backups folder within the project root (please ensure it exists). Status or the process inbetween is logged by the respective import and export tools.

## :bug: Bugs or Issues

Since this will be handled internally, it shouldn't be too difficult to diagnose any issues. Issues from the backend are logged to the front-end and should be fairly self explanatory.

## :hammer: Original Tools
- [Contentful Import](https://github.com/contentful/contentful-import)
- [Contentful Export](https://github.com/contentful/contentful-export)

## :page_with_curl: Version Log

### 0.1.0
- The initial release! :tada:
