const fs = require('fs');
const path = require('path');

const targetDirectory = 'C:\\Users\\twj00\\OneDrive\\Desktop\\DFZ\\DeadfellazAssetLibrary\\deadfellaz-asset-library\\src\\assets\\DFZDF10KPROPKIT';
const outputFilePath = 'folderStructure.json';

function generateFolderStructure(dirPath) {
  let structure = [];
  const items = fs.readdirSync(dirPath);

  items.forEach((item) => {
    const itemPath = path.join(dirPath, item);
    const stats = fs.statSync(itemPath);

    if (stats.isDirectory()) {
      structure.push(item);
      const subStructure = generateFolderStructure(itemPath);
      structure = structure.concat(subStructure.map(subItem => `${item}/${subItem}`));
    }
  });

  return structure;
}

const folderStructure = generateFolderStructure(targetDirectory);

// Write the JSON file
fs.writeFileSync(outputFilePath, JSON.stringify(folderStructure, null, 2), 'utf-8');
console.log(`Folder structure saved to ${outputFilePath}`);
