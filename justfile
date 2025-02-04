lint:
  npx eslint --fix .

prettier-check:
  npx prettier --check --write '**/*.js'

build:
  npx rollup -c

test-unit:
  node --test tests/**/*.js

test: lint prettier-check build test-unit

release:
  npx standard-version
