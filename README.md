# DeSo Offline Tool

## Online

View the live online site here: https://offline.deso.com

## Offline

There are a few different ways to download the web app and run in offline:

- Download it directly from the [live online site](https://offline.deso.com) by clicking the download button in the main menu.
- Visit the online page, and then in your system menu, click `File` -> `Save Page As`
- Download a specific `deso-offline-tool.zip` version from the [releases tab on github](https://github.com/deso-protocol/deso-offline-tool/releases).

Once you have the files downloaded, you can run the app by extracting `deso-offline-tool.zip` and
opening `dist/index.html`.

## Build from source

- Clone this repo
- Run `npm run build`
- Run `open dist/index.html`

## Development

- Clone this repo
- Run `npm run start` in the root directory
- Make changes in the `./src` directory

## Releases

NOTE: You must have permissions to push to `main`.

On branch `main`:

- Run `npm version {major,minor,patch}`. Choose whichever increment [makes sense
  for your change](https://docs.npmjs.com/about-semantic-versioning#incrementing-semantic-versions-in-published-packages)
- Run `npm run release`. This will trigger a github workflow that will create a new release that has the zipped
  assets attached.
