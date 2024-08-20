const fs = require('fs');
const path = require('path');

const rootFolder = 'DFZ DF10k PROP KIT';
let totalFilesRenamed = 0;

function renameFilesInFolder(folderPath) {
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error(`Error reading folder: ${folderPath}`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats of file: ${filePath}`, err);
          return;
        }

        if (stats.isDirectory()) {
          renameFilesInFolder(filePath);
        } else if (stats.isFile()) {
          if (file.startsWith('Props_')) {
            const newFilePath = path.join(folderPath, file.replace('Props_', 'Prop_'));
            fs.rename(filePath, newFilePath, (err) => {
              if (err) {
                console.error(`Error renaming file: ${filePath}`, err);
                return;
              }
              totalFilesRenamed++;
              console.log(`Renamed: ${filePath} -> ${newFilePath}`);
            });
          }
        }
      });
    });
  });
}

renameFilesInFolder(rootFolder);

process.on('exit', () => {
  console.log(`Total files renamed: ${totalFilesRenamed}`);
});
