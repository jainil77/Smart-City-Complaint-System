const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

console.log('Setting up NLP model training data...');

// --- 1. Hygiene Category ---
manager.addDocument('en', 'garbage on the street', 'category.hygiene');
manager.addDocument('en', 'waste bin overflowing', 'category.hygiene');
manager.addDocument('en', 'trash not collected', 'category.hygiene');
manager.addDocument('en', 'public bathroom is dirty', 'category.hygiene');
manager.addDocument('en', 'smell of rotten food', 'category.hygiene');
manager.addDocument('en', 'dumpster is full', 'category.hygiene');
manager.addDocument('en', 'need street sweeping', 'category.hygiene');
manager.addDocument('en', 'litter everywhere', 'category.hygiene');

// --- 2. Roads Category ---
manager.addDocument('en', 'pothole on the road', 'category.roads');
manager.addDocument('en', 'broken streetlight', 'category.roads');
manager.addDocument('en', 'street light is out', 'category.roads');
manager.addDocument('en', 'crack in the pavement', 'category.roads');
manager.addDocument('en', 'road is damaged', 'category.roads');
manager.addDocument('en', 'traffic light is not working', 'category.roads');
manager.addDocument('en', 'broken sign', 'category.roads');
manager.addDocument('en', 'roadblock needs to be removed', 'category.roads');

// --- 3. Electricity Category ---
manager.addDocument('en', 'power outage in my area', 'category.electricity');
manager.addDocument('en', 'no electricity', 'category.electricity');
manager.addDocument('en', 'power cut', 'category.electricity');
manager.addDocument('en', 'transformer sparked', 'category.electricity');
manager.addDocument('en', 'frequent power cuts', 'category.electricity');
manager.addDocument('en', 'exposed electrical wire', 'category.electricity');
manager.addDocument('en', 'voltage is too low', 'category.electricity');

// --- 4. Water Category ---
manager.addDocument('en', 'broken pipe leaking', 'category.water');
manager.addDocument('en', 'no water supply', 'category.water');
manager.addDocument('en', 'sewage problem', 'category.water');
manager.addDocument('en', 'drainage is blocked', 'category.water');
manager.addDocument('en', 'dirty water coming from tap', 'category.water');
manager.addDocument('en', 'manhole is open', 'category.water');
manager.addDocument('en', 'water logging on the street', 'category.water');

// --- 5. Other / General ---
// It's also good to train an 'Other' category
manager.addDocument('en', 'loud noise at night', 'category.other');
manager.addDocument('en', 'stray dogs are a menace', 'category.other');
manager.addDocument('en', 'park is not maintained', 'category.other');
manager.addDocument('en', 'public disturbance', 'category.other');


// Export the manager so app.js can use it
module.exports = manager;