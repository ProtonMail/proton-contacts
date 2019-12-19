[![CircleCI](https://circleci.com/gh/ProtonMail/proton-contacts.svg?style=svg)](https://circleci.com/gh/ProtonMail/proton-contacts)

# protonmail-contacts

Proton Contacts built with React.



>**⚠ If you use Windows plz follow this document before anything else [how to prepare Windows](https://github.com/ProtonMail/proton-shared/wiki/setup-windows)**



## Basic installation

To set up the project, follow the steps below:

1. Create a file `appConfig.json` at the root of your project. To set up the dev env config for this app, add the clientiD `<clientID>` inside appConfig.json (cf. [How to dev](https://github.com/ProtonMail/proton-pack#dev-env))

```json
{
    "appConfig": {
        "clientId": "WebSettings"
    }
}
```

2. `npm install`

3. `npm start`

>:warning: Do not commit appConfig.json . Notice it's already inside .gitignore

## Deploy

Currently available in the `deploy-contacts` branch.

1. Create a new version + tag => `npm version (patch|minor|major)`.

2. Deploy via npm `npm run deploy`.

### Deploy to prod

`$ npm run deploy:prod` 

> Build from master post git clone into /tmp. `--no-remote` build from local.


### CLI Flags

- `--branch` : Deploy branch dest
- `--api` : Set an API for the app (default `build`)
- `--debug`: turn on debug mode for the command (default `false`)
- `--i18n`: Force sync translations (default `false`)
