const axios = require('axios');
const fs = require('fs');

const baseUrl = 'https://ipfs.io/ipfs/bafybeiaad7jp7bsk2fubp4wmks56yxevoz7ywst5fd4gqdschuqonpd2ee/';
const outputFile = './bodyAndGrades.json';
const delay = 100; // 2 seconds

// Initialize the object to store the token ID, Body, and Body Grade values
const bodyData = {};

// Function to extract "Body" and "Body Grade" from attributes
const getBodyAndGrade = (attributes) => {
    const bodyAttr = attributes.find(attr => attr.trait_type === "Body");
    const bodyGradeAttr = attributes.find(attr => attr.trait_type === "Body Grade");

    return {
        body: bodyAttr ? bodyAttr.value : null,
        bodyGrade: bodyGradeAttr ? bodyGradeAttr.value : null
    };
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchAndStoreBodyData = async () => {
    for (let i = 1; i <= 10000; i++) {
        try {
            const jsonResponse = await axios.get(`${baseUrl}${i}`);
            const { body, bodyGrade } = getBodyAndGrade(jsonResponse.data.attributes);

            if (body && bodyGrade) {
                bodyData[i] = { body, bodyGrade };
                console.log(`Stored Body and Body Grade for token ID ${i}: Body = ${body}, Body Grade = ${bodyGrade}`);
            } else {
                console.warn(`"Body" or "Body Grade" missing for token ID ${i}`);
            }
        } catch (error) {
            console.error(`Failed to fetch metadata for token ID ${i}:`, error.message);
        }

        // Wait for the specified delay to avoid rate limiting
        await sleep(delay);
    }

    // Write the bodyData object to a JSON file
    fs.writeFileSync(outputFile, JSON.stringify(bodyData, null, 2));
    console.log(`Body and Body Grades stored in ${outputFile}`);
};

fetchAndStoreBodyData();
