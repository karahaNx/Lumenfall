'use strict';
const zlib = require('node:zlib');
const crcTable = Array.from({ length: 256 }, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(data) {
  let crc = 0xffffffff;
  for (const value of data) crc = crcTable[(crc ^ value) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function entries(data) {
  let end = -1;
  for (let at = data.length - 22; at >= Math.max(0, data.length - 65557); at--) {
    if (data.readUInt32LE(at) === 0x06054b50 && at + 22 + data.readUInt16LE(at + 20) === data.length) { end = at; break; }
  }
  if (end < 0) throw Error('Missing ZIP directory');
  if (data.readUInt16LE(end + 4) || data.readUInt16LE(end + 6)) throw Error('Split ZIP is unsupported');
  const count = data.readUInt16LE(end + 10), size = data.readUInt32LE(end + 12), offset = data.readUInt32LE(end + 16);
  if (count === 65535 || size === 0xffffffff || offset === 0xffffffff) throw Error('ZIP64 is unsupported');
  if (count !== data.readUInt16LE(end + 8) || offset + size > end) throw Error('Invalid ZIP directory bounds');
  const result = [];
  let at = offset;
  for (let i = 0; i < count; i++) {
    if (at + 46 > offset + size || data.readUInt32LE(at) !== 0x02014b50) throw Error('Invalid ZIP directory entry');
    const nameLength = data.readUInt16LE(at + 28), extra = data.readUInt16LE(at + 30), comment = data.readUInt16LE(at + 32);
    const next = at + 46 + nameLength + extra + comment;
    if (next > offset + size) throw Error('Truncated ZIP directory entry');
    result.push({ name: data.subarray(at + 46, at + 46 + nameLength).toString('utf8'),
      flags: data.readUInt16LE(at + 8), method: data.readUInt16LE(at + 10), crc: data.readUInt32LE(at + 16),
      compressed: data.readUInt32LE(at + 20), bytes: data.readUInt32LE(at + 24), offset: data.readUInt32LE(at + 42) });
    at = next;
  }
  if (at !== offset + size) throw Error('ZIP directory size mismatch');
  return result;
}
function verifyZip(data) {
  const rows = entries(data);
  for (const row of rows) {
    const at = row.offset;
    if (at + 30 > data.length || data.readUInt32LE(at) !== 0x04034b50 || row.flags & 1) throw Error('Invalid/encrypted ZIP entry: ' + row.name);
    const start = at + 30 + data.readUInt16LE(at + 26) + data.readUInt16LE(at + 28);
    if (start + row.compressed > data.length) throw Error('Truncated ZIP payload: ' + row.name);
    const packed = data.subarray(start, start + row.compressed);
    const payload = row.method === 0 ? packed : row.method === 8 ? zlib.inflateRawSync(packed) : null;
    if (!payload || payload.length !== row.bytes || crc32(payload) !== row.crc) throw Error('ZIP CRC/size failed: ' + row.name);
  }
  return rows;
}
module.exports = { entries, verifyZip, crc32 };
