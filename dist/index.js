// package/index.ts
import { readFile } from "fs/promises";
import { optimize, loadConfig } from "svgo";
async function compileSvg(source, compilerOptions) {
  let svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/<!--\s*([\s\S]*?)\s*-->/g, "{/* $1 */}").replace(/(<svg[^>]*)>/i, "$1{...props}>");
  if (compilerOptions.allow_props_children) {
    svgWithProps = svgWithProps.replace(/\{'\{'\}\s*(props\.children)\s*\{'\}'\}/g, "{$1}");
  }
  return `export default (props = {}) => ${svgWithProps}`;
}
async function optimizeSvg(content, path, svgoConfig) {
  const config = svgoConfig || await loadConfig();
  if (config && config.datauri) {
    throw new Error(
      "datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value."
    );
  }
  const result = optimize(content, Object.assign({}, config, { path }));
  return result.data;
}
function index_default(options = {}) {
  const {
    defaultAsComponent = true,
    svgo = { enabled: true },
    compilerOptions = { allow_props_children: false }
  } = options;
  const extPrefix = "component-solid";
  const shouldProcess = (qs) => {
    const params = new URLSearchParams(qs);
    return defaultAsComponent && !Array.from(params.entries()).length || params.has(extPrefix);
  };
  let config;
  let solidPlugin;
  return {
    enforce: "pre",
    name: "solid-svg",
    configResolved(cfg) {
      config = cfg;
      solidPlugin = config.plugins.find((p) => p.name == "solid");
      if (!solidPlugin) {
        throw new Error("solid plugin not found");
      }
    },
    async load(id) {
      const [path, qs] = id.split("?");
      if (!path.endsWith(".svg")) {
        return null;
      }
      if (shouldProcess(qs)) {
        let code = await readFile(path, { encoding: "utf8" });
        if (svgo.enabled) {
          let optimized = await optimizeSvg(code, path, svgo.svgoConfig);
          code = optimized || code;
        }
        const result = await compileSvg(code, compilerOptions);
        return result;
      }
    },
    transform(source, id, transformOptions) {
      const [path, qs] = id.split("?");
      if (path.endsWith(".svg") && shouldProcess(qs)) {
        const transformFn = typeof solidPlugin.transform === "function" ? solidPlugin.transform : solidPlugin.transform.handler;
        return transformFn.bind(this)(source, `${path}.tsx`, transformOptions);
      }
    }
  };
}
export {
  index_default as default
};
