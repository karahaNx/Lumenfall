#!/usr/bin/env node
'use strict';
const { parseArgs, resolvePath, main } = require('./lib/cli.cjs');
const { serve } = require('./lib/static-server.cjs');
main(async () => {
  const args = parseArgs(process.argv.slice(2), ['--directory', '--port']);
  if (args.positional.length) throw Error('Usage: node scripts/serve.cjs --directory mobile/www --port 4173');
  const port = Number(args.port || 4173);
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw Error('Invalid port');
  const server = await serve(resolvePath(args.directory || 'mobile/www'), port);
  console.log('Serving on http://127.0.0.1:' + server.address().port);
  for (const signal of ['SIGTERM', 'SIGINT']) process.on(signal, () => { server.closeAllConnections(); server.close(); });
});
