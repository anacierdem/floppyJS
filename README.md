floppyJS
========

Electron based floppy disk image reader.

Intended to read and modify images at the end, preferentially with direct disk access to manipulate USB floppy emulator's flash memory banks.

Currently working with only FAT12 images and only file download is possible. Any help is appreciated.

Roadmap:
========

- [ ] Migrate UI to use React.
- [ ] Move parsing code to main process.
- [ ] Re-write parsing code.
- [ ] Implement file adding support.
- [ ] Add support for long Windows file names in addition to 8.3
- [ ] Add direct disk access functionality.