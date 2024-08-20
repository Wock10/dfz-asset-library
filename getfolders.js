const fs = require('fs');
const path = require('path');

const targetDirectory = 'C:\\Users\\twj00\\OneDrive\\Desktop\\DFZ\\DeadfellazAssetLibrary\\deadfellaz-asset-library\\src\\assets\\DFZDF10KPROPKIT\\Fresh';
const outputFilePath = 'folderStructure.json';

function generateFolderStructure(dirPath) {
  const structure = {};
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      structure[item] = generateFolderStructure(itemPath);
    } else {
      if (!structure['files']) {
        structure['files'] = [];
      }
      structure['files'].push(item);
    }
  });

  return structure;
}

const folderStructure = generateFolderStructure(targetDirectory);

// Write the JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(folderStructure, null, 2), 'utf-8');
console.log(`Folder structure saved to ${outputFilePath}`);
