const fs = require("fs");
const { dialog } = require("electron");
const { winHandle } = require("./app");

exports.loadData = () => {
  const EXPECTED_FILE_SIZE = 2880 * 512;

  // TODO: add support for direct disk access using
  // https://github.com/ronomon/direct-io This will enable manipulating
  // combined floppy data e.g for floppy emulator flash drives.
  dialog.showOpenDialog(winHandle, {}, function(filePaths) {
    // No files selected
    if (!filePaths) {
      return;
    }
    if (filePaths.length > 1 || filePaths.length === 0) {
      // This is not possible on a Windows system. Must check for other OSes
      // TODO: remove if unnecessary.
      dialog.showMessageBox(winHandle, {
        type: "error",
        message: "Select only one file.",
        title: "Unexpected input",
      });
    } else {
      // Prepare sector buffers
      // TODO: this may be a one contiguous buffer as well.
      let currentIndex = 0;
      const sectors = [];

      for (let i = 0; i < 2880; i++) {
        sectors[i] = new Uint8Array(512);
      }

      const stats = fs.statSync(filePaths[0]);

      if (stats.size !== EXPECTED_FILE_SIZE) {
        dialog.showMessageBox(winHandle, {
          type: "error",
          message: "Not a valid floppy image.",
          title: "Unexpected input",
        });

        return;
      }

      const stream = fs.createReadStream(filePaths[0], {
        start: 0,
        end: EXPECTED_FILE_SIZE,
      });

      stream.on("data", chunk => {
        for (let i = 0; i < chunk.length; i++) {
          const sectorIndex = Math.floor(currentIndex / 512);
          const sectorPosition = currentIndex % 512;

          sectors[sectorIndex][sectorPosition] = chunk[i];
          currentIndex++;
        }
      });

      stream.on("end", () => {
        winHandle.webContents.send("fileLoaded", sectors);
      });

      stream.on("error", () => {
        dialog.showMessageBox(winHandle, {
          type: "error",
          message: "Error reading file.",
          title: "Read error",
        });
      });
    }
  });
};
