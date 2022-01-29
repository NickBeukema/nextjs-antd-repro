# Reproduction Steps

1. `git clone git@github.com:NickBeukema/nextjs-antd-repro.git`
2. `cd nextjs-antd-repro`
3. `yarn install`
4. `cd packages/next-app`
5. `yarn next dev`

You will see that the test showing will have a red background.

1. `yarn next build`
2. `yarn next start`

You will see that the test showing will NOT have a red background.