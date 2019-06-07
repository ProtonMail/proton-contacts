# protonmail-contacts

Proton Contacts built with React. To set up the project, follow the steps below:



1. Create a file appConfig.json in the root of your project. To set up the dev env config for this app, add the clientiD `<cleintID>` inside appConfig.json cf [How to dev](https://github.com/ProtonMail/proton-pack#dev-env)

```json
{
    "appConfig": {
        "clientId": "WebSettings"
    }
}

```

2. `npm install`

3. `npm start`

:warning: Do not commit appConfig.json . Notice it's already inside .gitignore