import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path'
import { viteExternalsPlugin } from 'vite-plugin-externals';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), injectV8SnapshotResolutions()]
})


// // custom rollup plugin for resolving snapshotted modules
async function injectV8SnapshotResolutions() {
  // read source of snapshots
  const file = (
    await readFile(resolve(__dirname, 'imports.js'), {
      encoding: 'utf8',
      flag: 'r',
    })
  )
    .split('\n')
    .filter((line) => !line.startsWith('/'))
    .join('\n');

  const regex = /\("([^\)]+)"\)/gm;
  const modules = [...file.matchAll(regex)]
    .map((s) => s.at(1))
    .filter((s) => s) as string[];

  /** Given a package name e.g. @urql/core, jotai/utils, etc.
   * attempt to determine the relative filepath of the entrypoint
   * e.g. f("@urql/core") = "@urql/core/dist/urql-core.js"
   *  * e.g. f("jotai/utils") = "jotai/utils.js"
   */
  async function getEntrypoint(m: string) {
    const segments = m.split('/');
    const permutations: string[] = [];
    for (let i = 1; i <= segments.length; i += 1) {
      const perm = segments.slice(0, i).join('/');
      permutations.push(perm);
    }
    for (const p of permutations) {
      const res = await getEntrypointRecur(p, m);
      if (res) {
        const out = res.includes(".") ? res : `${res}.js`;
        return out;
      }
    }
    return `${m}/index.js`;
  }

  async function getEntrypointRecur(m: string, requesting: string) {
    const packageRoot = resolve(
      __dirname,
      './node_modules/',
      m,
      'package.json'
    );
    let packageString: string | null = null;
    try {
      packageString = await readFile(packageRoot, {
        encoding: 'utf8',
        flag: 'r',
      });
    } catch {
      // file doesn't exist
      return null;
    }
    const packageJson = JSON.parse(packageString);
    // heuristic for entrypoint, can maybe be improved
    const main = packageJson['main'];
    const wantExport =
      packageJson['name'] === requesting
        ? '.'
        : `./${requesting.split('/').splice(1).join('/')}`;
    const modules = packageJson['exports']?.[wantExport];
    if (typeof modules === 'object') {
      const validModuleTypes = ['default', 'require'];
      for (const f of validModuleTypes) {
        if (f in modules) {
          const out = `${m}/${modules[f].replace('./', '')}`;
          return out;
        }
      }
    }
    const out = main ? `${m}/${main}`.replace('./', '') : null;
    return out;
  }

  // resolves the module name into the global value
  function getChain(m: string) {
    // read the package.json for the entrypoint

    const out = [
      `snapshotResult`,
      `customRequire`,
      `cache`,
      `./node_modules/${m}`,
      `exports`,
    ];
    console.log(out)
    return out
  }

  const entries: Array<[string, string[]]> = await Promise.all(
    modules.map(async (m) => [m, getChain(await getEntrypoint(m))])
  );

  const generatedGlobals = Object.fromEntries(entries);

  // const visited = new Set<string>()
  return {
    ...viteExternalsPlugin(generatedGlobals),
    name: 'inject-snapshot-resolution',
  };
}
