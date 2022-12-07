# Reproduction of AG-Grid rendering issue

### Steps
run on node -v 16.13.1 and yarn -v 1.22.17
1. `yarn`
1. `node scripts/moveSnapshot.js`
1. `yarn dev`
1. Click the counter, react runs fine
1. Click render AG-Grid

The app crashes with
```
TypeError: Cannot read properties of undefined (reading 'addEventListener')
at BeanStub2.addManagedListener
```

This example doesn't include other react libraries but our application has many react libs which work fine with the externalized and snapshotted React.
