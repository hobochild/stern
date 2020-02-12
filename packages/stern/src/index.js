const npmFetch = require('npm-registry-fetch')
const tar = require('tar')
const stream = require('stream')
const { promisify } = require('util')
const fs = require('fs')
const got = require('got')

const pipeline = promisify(stream.pipeline)

const run = async pkgName => {
  const file = await getComposeFile(pkgName)
  console.log(file)
}

const getComposeFile = async pkgName => {
  try {
    const meta = await npmFetch.json(`stern-${pkgName}`)
    const latest = meta['dist-tags']['latest']

    const distUrl = meta['versions'][latest]['dist']['tarball']
    console.log(meta)
    console.log(distUrl)

    await pipeline(
      got.stream(distUrl),
      fs.createWriteStream(`stern-${pkgName}.tgz`)
    )

    tar
      .x({
        file: `stern-${pkgName}.tgz`,
        filter: (path, entry) => {
          console.log('path:', path)
          if (path.includes('docker-compose.yaml')) {
            return true
          }
          return true
        },
        onEntry: entry => {
          console.log(entry)
        },
        C: `~/.stern/${pkgName}`
      })
      .then(_ => {
        console.log('tarball has been dumped in cwd')
      })
  } catch (err) {
    throw err
  }
}

run('mutt')
  .then(console.log)
  .catch(console.log)
  .catch(console.log)
