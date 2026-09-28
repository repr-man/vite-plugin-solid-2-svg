var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// package/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default
});
module.exports = __toCommonJS(index_exports);
var import_promises = require("fs/promises");
var import_svgo = require("svgo");
async function compileSvg(source, compilerOptions) {
  let svgWithProps = source.replace(/([{}])/g, "{'$1'}").replace(/<!--\s*([\s\S]*?)\s*-->/g, "{/* $1 */}").replace(/(<svg[^>]*)>/i, "$1{...props}>");
  if (compilerOptions.allow_props_children) {
    svgWithProps = svgWithProps.replace(/\{'\{'\}\s*(props\.children)\s*\{'\}'\}/g, "{$1}");
  }
  return `export default (props = {}) => ${svgWithProps}`;
}
async function optimizeSvg(content, path, svgoConfig) {
  const config = svgoConfig || await (0, import_svgo.loadConfig)();
  if (config && config.datauri) {
    throw new Error(
      "datauri option for svgo is not allowed when you use vite-plugin-solid-svg. Remove it or use a falsy value."
    );
  }
  const result = (0, import_svgo.optimize)(content, Object.assign({}, config, { path }));
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
        let code = await (0, import_promises.readFile)(path, { encoding: "utf8" });
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
