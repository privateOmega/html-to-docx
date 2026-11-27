import JSZip from 'jszip';
import { create } from 'xmlbuilder2';

const XML_PART = /\.(xml|rels)$/;

const prettyXML = (xml) => create(xml).end({ prettyPrint: true, headless: false });

/**
 * Unzips a generated docx and returns its file list plus every XML part
 * pretty-printed, so snapshot diffs stay readable.
 */
export async function readDocx(buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const files = Object.keys(zip.files)
    .filter((name) => !zip.files[name].dir)
    .sort();

  const parts = {};
  await Promise.all(
    files
      .filter((name) => XML_PART.test(name))
      .map(async (name) => {
        parts[name] = prettyXML(await zip.file(name).async('string'));
      }),
  );

  return { files, parts };
}
