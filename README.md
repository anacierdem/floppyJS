floppyJS
========

Electron based floppy disk image reader.

Intended to be used to read and modify images at the end, preferentially with direct disk access to manipulate USB floppy emulator's flash memory floopy banks.

Currently working with only FAT12 images and only file download is possible. Any help is appreciated.

- [ ] Migrate UI to use React.
- [ ] Re-write and move parsing code to main process.
- [ ] Implement file adding support.
- [ ] Add support for long Windows file names in addition to 8.3
- [ ] Add direct disk access functionality.

Uses dTree -> http://www.destroydrop.com/javascripts/tree/