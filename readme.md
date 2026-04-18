# outa.one – Self-Service Software License Management
A web-based self-service portal (SSP) that allows employees of an IT consulting company to independently retrieve software license keys. Built as part of a university software engineering group project.

The SSP streamlines the internal software procurement process by providing a centralized platform where employees can obtain available software products and retrieve license keys - without manual intervention from IT or administration.

## Features
**Employee**
- Browse available software products and license types
- Request and retrieve license keys (with optional confirmation step)
- View personal license history
- Login and authentication

**Administrator**
- Upload and manage products and license keys
- Manually assign license keys to users
- Manage user accounts and roles
- View audit logs and generate reports on license usage

## Tech Stack
> TBD based on project requirements and team expertise,but initial considerations include:

- **Framework:** `SvelteKit` 
- **Local Storage:** `PostgreSQL Database`
- **FE Libraries:** `Tailwind CSS`

## Further Documentation
Detailed documentation is located in the [`/docs`](docs) folder, this includes:

| Topic                             | File                                             |
|-----------------------------------|--------------------------------------------------|
| Collaboration Guide & Local Setup | [docs/contributing.md](docs/contributing.md)   |


## Team
| Role | Contributor |
|---|---|
| Product Owner | [@fowl-ow](https://github.com/fowl-ow) |
| Scrum Master | [@nicolekaefer](https://github.com/nicolekaefer) |
| Developer | [@zFlxw](https://github.com/zFlxw) |
| Developer | [@nikmtl](https://github.com/nikmtl) |
| Developer | [@michelle128n](https://github.com/michelle128n) |
| Developer | [@Lumalis](https://github.com/Lumalis)

## Scope
This project is developed for academic purposes as part of a university software engineering course.

<!-- 

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
pnpm dlx sv@0.15.1 create --template minimal --types ts --add playwright tailwindcss="plugins:none" drizzle="database:postgresql+postgresql:postgres.js+docker:yes" better-auth="demo:password" paraglide="languageTags:en, es+demo:yes" storybook --install pnpm .
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
-->
