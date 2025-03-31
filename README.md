# React Application Template

This is a simple template for a React application.

This template uses:

- [Vite](https://vitejs.dev/) for bundling and running the dev server.
- [Vitest](https://vitest.dev/) for testing, along with
  [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [ESLint](https://eslint.org/) for linting

## Installation

To create a fresh copy of this project, clone the repository, then remove it's
git history:

1. Clone this repo into a folder on your machine.
2. `cd` into that folder `cd my-project-name`
3. Delete the git history: `rm -rf .git`
4. Create a new git history: `git init`
5. Install the necessary dependencies - run `npm install` in the folder where
   the package.json is located.

## Scripts

The following can all be found under the `"scripts"` section in your
`package.json`. You can add more scripts here if you like, and run them with
`npm run my-script`.

### Running in Development Mode

```zsh
npm run dev
```

### Running Tests

```zsh
npm run test
```

### Linting

```zsh
npm run lint
```

### Building for Production

```zsh
npm run build
```
