// Type declarations for untyped dependencies and import paths.

// @types/virtual-dom declares these deep imports without the `.js`
// extension, which Node's ESM loader requires (virtual-dom has no exports map).
declare module 'virtual-dom/vnode/vnode.js' {
  import VNode = require('virtual-dom/vnode/vnode');
  export = VNode;
}
declare module 'virtual-dom/vnode/vtext.js' {
  import VText = require('virtual-dom/vnode/vtext');
  export = VText;
}
declare module 'virtual-dom/vnode/is-vnode.js' {
  import isVNode = require('virtual-dom/vnode/is-vnode');
  export = isVNode;
}
declare module 'virtual-dom/vnode/is-vtext.js' {
  import isVText = require('virtual-dom/vnode/is-vtext');
  export = isVText;
}

declare module 'html-to-vdom' {
  interface HTMLToVDOMOptions {
    VNode: VirtualDOM.VNodeConstructor;
    VText: VirtualDOM.VTextConstructor;
  }
  function HTMLToVDOM(
    options: HTMLToVDOMOptions,
  ): (html: string) => VirtualDOM.VTree | VirtualDOM.VTree[];
  export = HTMLToVDOM;
}
