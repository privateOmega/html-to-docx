// CommonJS entry. `require('html-to-docx')` returns the function itself, so
// this entry has a single default export, which tsdown emits as
// `module.exports =` with `export =` declarations.
import generateContainer from './index';

export default generateContainer;
