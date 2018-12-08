const siteExport = require('./export')

module.exports = (options = {}, ctx) => {
  return {
    async ready () {
      const port = await resolvePort(ctx.cliOptions.port || ctx.siteConfig.port);
      const { host } = await resolveHost(ctx.cliOptions.host || ctx.siteConfig.host)

      setTimeout(() => {
        siteExport({
          extension: options.extension,
          sourceDir: ctx.sourceDir,
          pages: ctx.pages,
          dest: ctx.outDir,
          enabled: !ctx.isProd,
          port,
          host
        }, 0)
      })
    }
  }
}

function resolveHost (host) {
  // webpack-serve hot updates doesn't work properly over 0.0.0.0 on Windows,
  // but localhost does not allow visiting over network :/
  const defaultHost = process.platform === 'win32' ? 'localhost' : '0.0.0.0'
  host = host || defaultHost
  const displayHost = host === defaultHost && process.platform !== 'win32'
    ? 'localhost'
    : host
  return {
    displayHost,
    host
  }
}

async function resolvePort (port) {
  const portfinder = require('portfinder')
  portfinder.basePort = parseInt(port) || 8080
  port = await portfinder.getPortPromise()
  return port
}