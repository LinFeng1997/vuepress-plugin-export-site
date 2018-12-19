const puppeteer = require('puppeteer-cn')
const PDFMerge = require('easy-pdf-merge')
const {path, fs, logger} = require('@vuepress/shared-utils')

module.exports = async ({extension, sourceDir, pages, dest, enabled, host, port}) => {
  if (!enabled) return
  if (extension === 'pdf') {
    await exportPDF({sourceDir, pages, dest, host, port})
  } else {
    logger.warn(`Not support ${extension} format site export!`)
  }
}

async function exportPDF({sourceDir, pages = [], dest, host, port}) {
  try {
    const paths = pages.map(s => s.path)
    const pdfTempDir = path.resolve('./_tempPDF')
    fs.ensureDirSync(pdfTempDir)
    // port finder
    const options = paths.map(path => {
      return {
        location: `http://${host}:${port}${path}`,
        path: `${pdfTempDir}/${path.replace(/\//g, '-').replace('-', '').replace(/\.html/, '').replace(/-$/, '')}.pdf`
      }
    })
    const files = options.map(option => path.resolve(option.path))
    console.time('cost time');
    await downloadPDFs(options)
    await mergePDF(files, dest)
    logger.success(`export ${dest}.pdf file success!`)
    fs.removeSync(pdfTempDir)
    console.timeEnd('cost time');
  } catch (e) {
    console.log('error: ', e);
    logger.error(e.stack || e)
  }
}

async function downloadPDFs(options) {
  // console.log('options',options.length);
  const browser = await puppeteer.launch()
  await Promise.all(options.map(async ({location, path}) => {
    try {
      const page = await browser.newPage()
      await page.goto(location, {waitUntil: 'networkidle0',timeout: 3000 * options.length})
      await page.pdf({path, format: 'A4'})
      logger.success(`pdf ${path} generator success`)
    } catch (e) {
      console.log('download error:', e)
    }
  }))
  await browser.close()
}

function mergePDF(files, exportFile = 'site') {
  return new Promise((resolve, reject) => {
    // if windows,trans file path
    if (process.platform === 'win32') files = files.map(file => path.win32.resolve(file))
    files = files.filter(file => {
      return fs.pathExistsSync(file)
    })
    // console.log('files:\n', files.length)
    PDFMerge(files, `${exportFile}.pdf`, (err) => {
      if (err) {
        reject(err)
      }
      resolve()
    })
  })
}
