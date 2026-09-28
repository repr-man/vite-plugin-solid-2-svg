import { Config } from 'svgo';
import { Plugin } from 'vite';

type CompilerOptions = {
    allow_props_children?: boolean;
};
type SolidSVGPluginOptions = {
    /**
     * If true, will export as JSX component if `as` isn't specified.
     *
     * Otherwise will export as JSX component if '?as=component-solid'
     */
    defaultAsComponent?: boolean;
    svgo?: {
        enabled?: boolean;
        svgoConfig?: Config;
    };
    compilerOptions?: CompilerOptions;
};
declare function export_default(options?: SolidSVGPluginOptions): Plugin;

export { type SolidSVGPluginOptions, export_default as default };
