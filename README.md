# photolozovikov

My photo portfolio.

## Requirements

- Node.js 14.x and npm 6.x (the locked `node-sass` and `sharp` versions are not compatible with current Node.js releases)
- Firebase CLI for deployment
- PHP is required only if you want to test `src/php/contact.php` locally

## Develop locally

Install the project dependencies from the repository root:

```bash
npm install
```

On Windows, use a version manager such as `nvm-windows` to select Node.js 14 before installing dependencies. Using Node.js 22 or newer currently fails while compiling the locked native dependencies.

Windows also requires Visual Studio Build Tools 2019 with the following components:

- Desktop development with C++ workload
- MSVC v142 build tools
- Windows 10 or Windows 11 SDK

These components are required by `node-gyp` when installing the native `sharp` dependency. If `npm install` previously failed, remove `node_modules` and run it again after installing the components:

```powershell
Remove-Item -Recurse -Force node_modules
npm install
```

Start the complete local workflow:

```bash
npx gulp
```

The default Gulp task will:

1. Build the site into `build/`.
2. Start BrowserSync at http://localhost:9000.
3. Watch `src/` and rebuild changed HTML, JavaScript, Sass, images, and fonts.

The source files are in `src/`. Edit those files rather than files in `build/`, because `build/` is generated and ignored by Git.

Place source images under `src/img/`. Keep the folder structure used by the HTML image paths. For example, images referenced as `img/portfolio/Angelika/content/_MG_2994.jpg` belong at:

```text
src/img/portfolio/Angelika/content/_MG_2994.jpg
```

Place homepage mobile images in `src/img/index/phone/`. The image tasks process files from `src/img/` and generate the corresponding files under `build/img/`, so do not add source images directly to `build/`.

Stop the development server with `Ctrl+C`.

## Build a page locally

Build all pages and assets without starting the watcher:

```bash
npx gulp build
```

The generated site is written to `build/`. For example, `src/about.html` becomes `build/about.html`.

To inspect the generated site in a browser, start the local server after building:

```bash
npx gulp webserver
```

Open http://localhost:9000 and navigate to the generated page. Gulp also compiles and minifies Sass and JavaScript, copies fonts, and processes the image assets during the build.

## Deploy to Firebase Hosting

Firebase configuration is not currently committed to this repository. Set it up once from the repository root:

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
```

When Firebase asks for the public directory, enter `build`. This is a multi-page site, so do not enable the single-page-app rewrite unless the hosting setup specifically requires it. If Firebase asks whether to overwrite an existing `index.html`, keep the generated `build/index.html` and answer accordingly.

For each update, build first and then deploy the generated directory:

```bash
npx gulp build
firebase deploy --only hosting
```

The Firebase CLI uses the `firebase.json` and `.firebaserc` files created during initialization. Keep those files in the repository if other contributors should be able to deploy to the same Firebase project.

### Contact form limitation

Firebase Hosting is static hosting and does not execute PHP. The contact form currently posts to `php/contact.php`, so it will not send mail when deployed only to Firebase Hosting. Use a separately hosted PHP backend or replace the form action with a service or serverless endpoint before relying on it in production.
