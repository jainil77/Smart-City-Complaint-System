const { NlpManager } = require('node-nlp');

const manager = new NlpManager({ languages: ['en'], forceNER: true });

console.log('Setting up NLP model training data...');

// --- 1. Hygiene Category (Garbage & Sanitation) ---
manager.addDocument('en', 'garbage', 'category.hygiene');
manager.addDocument('en', 'trash', 'category.hygiene');
manager.addDocument('en', 'waste', 'category.hygiene');
manager.addDocument('en', 'litter', 'category.hygiene');
manager.addDocument('en', 'dumpster', 'category.hygiene');
manager.addDocument('en', 'rubbish', 'category.hygiene');
manager.addDocument('en', 'garbage on the street', 'category.hygiene');
manager.addDocument('en', 'waste bin overflowing', 'category.hygiene');
manager.addDocument('en', 'trash not collected', 'category.hygiene');
manager.addDocument('en', 'public bathroom is dirty', 'category.hygiene');
manager.addDocument('en', 'smell of rotten food', 'category.hygiene');
manager.addDocument('en', 'dumpster is full', 'category.hygiene');
manager.addDocument('en', 'need street sweeping', 'category.hygiene');
manager.addDocument('en', 'litter everywhere', 'category.hygiene');
manager.addDocument('en', 'overflowing drain', 'category.hygiene');
manager.addDocument('en', 'dirty public toilet', 'category.hygiene');
manager.addDocument('en', 'rats and pests due to trash', 'category.hygiene');
manager.addDocument('en', 'uncollected garbage bags', 'category.hygiene');
manager.addDocument('en', 'bad smell from sewage', 'category.hygiene');
manager.addDocument('en', 'public urination spot', 'category.hygiene');
manager.addDocument('en', 'waste disposal issue', 'category.hygiene');
manager.addDocument('en', 'collection failed', 'category.hygiene');
manager.addDocument('en', 'bins are full', 'category.hygiene');
manager.addDocument('en', 'filthy sidewalk', 'category.hygiene');
manager.addDocument('en', 'sanitation problem', 'category.hygiene');
manager.addDocument('en', 'dead animal on road', 'category.hygiene');
manager.addDocument('en', 'public sanitation', 'category.hygiene');

// --- 2. Roads Category (Potholes, Lights, Signals) ---
manager.addDocument('en', 'pothole', 'category.roads');
manager.addDocument('en', 'potholes', 'category.roads');
manager.addDocument('en', 'streetlight', 'category.roads');
manager.addDocument('en', 'street light', 'category.roads');
manager.addDocument('en', 'traffic light', 'category.roads');
manager.addDocument('en', 'broken streetlight', 'category.roads');
manager.addDocument('en', 'street light is out', 'category.roads');
manager.addDocument('en', 'pothole on the road', 'category.roads');
manager.addDocument('en', 'crack in the pavement', 'category.roads');
manager.addDocument('en', 'road is damaged', 'category.roads');
manager.addDocument('en', 'traffic light is not working', 'category.roads');
manager.addDocument('en', 'broken sign', 'category.roads');
manager.addDocument('en', 'roadblock needs to be removed', 'category.roads');
manager.addDocument('en', 'deep pothole', 'category.roads');
manager.addDocument('en', 'traffic signal is stuck on red', 'category.roads');
manager.addDocument('en', 'faded road markings', 'category.roads');
manager.addDocument('en', 'street sign is missing', 'category.roads');
manager.addDocument('en', 'uneven road surface', 'category.roads');
manager.addDocument('en', 'damaged guardrail', 'category.roads');
manager.addDocument('en', 'sidewalk is broken', 'category.roads');
manager.addDocument('en', 'road needs repair', 'category.roads');
manager.addDocument('en', 'light is out', 'category.roads');
manager.addDocument('en', 'road construction left debris', 'category.roads');
manager.addDocument('en', 'manhole cover is loose', 'category.roads');
manager.addDocument('en', 'broken curb', 'category.roads');
manager.addDocument('en', 'dangerous intersection', 'category.roads');
manager.addDocument('en', 'crosswalk light is broken', 'category.roads');
manager.addDocument('en', 'pothole', 'category.roads'); // Repetition is okay

// --- 3. Electricity Category (Power Supply) ---
manager.addDocument('en', 'power outage', 'category.electricity');
manager.addDocument('en', 'no electricity', 'category.electricity');
manager.addDocument('en', 'power cut', 'category.electricity');
manager.addDocument('en', 'blackout', 'category.electricity');
manager.addDocument('en', 'no power', 'category.electricity');
manager.addDocument('en', 'power is out', 'category.electricity');
manager.addDocument('en', 'transformer sparked', 'category.electricity');
manager.addDocument('en', 'frequent power cuts', 'category.electricity');
manager.addDocument('en', 'exposed electrical wire', 'category.electricity');
manager.addDocument('en', 'voltage is too low', 'category.electricity');
manager.addDocument('en', 'flickering lights', 'category.electricity');
manager.addDocument('en', 'fallen power line', 'category.electricity');
manager.addDocument('en', 'no power in my house', 'category.electricity');
manager.addDocument('en', 'electrical box is open', 'category.electricity');
manager.addDocument('en', 'dangerous wires hanging', 'category.electricity');
manager.addDocument('en', 'the power is off', 'category.electricity');
manager.addDocument('en', 'my lights are out', 'category.electricity');
manager.addDocument('en', 'electricity is down', 'category.electricity');
manager.addDocument('en', 'power surge', 'category.electricity');
manager.addDocument('en', 'high voltage', 'category.electricity');
manager.addDocument('en', 'low voltage', 'category.electricity');

// --- 4. Water Category (Supply & Drainage) ---
manager.addDocument('en', 'no water', 'category.water');
manager.addDocument('en', 'leak', 'category.water');
manager.addDocument('en', 'leaking pipe', 'category.water');
manager.addDocument('en', 'sewage', 'category.water');
manager.addDocument('en', 'drain', 'category.water');
manager.addDocument('en', 'flooding', 'category.water');
manager.addDocument('en', 'broken pipe leaking', 'category.water');
manager.addDocument('en', 'no water supply', 'category.water');
manager.addDocument('en', 'sewage problem', 'category.water');
manager.addDocument('en', 'drainage is blocked', 'category.water');
manager.addDocument('en', 'dirty water coming from tap', 'category.water');
manager.addDocument('en', 'manhole is open', 'category.water');
manager.addDocument('en', 'water logging on the street', 'category.water');
manager.addDocument('en', 'burst water main', 'category.water');
manager.addDocument('en', 'clogged drain', 'category.water');
manager.addDocument('en', 'tap water is brown', 'category.water');
manager.addDocument('en', 'sewer overflow', 'category.water');
manager.addDocument('en', 'low water pressure', 'category.water');
manager.addDocument('en', 'flooding on my road', 'category.water');
manager.addDocument('en', 'no water in my home', 'category.water');
manager.addDocument('en', 'water pipe burst', 'category.water');
manager.addDocument('en', 'clogged sewer', 'category.water');
manager.addDocument('en', 'contaminated water', 'category.water');
manager.addDocument('en', 'water is dirty', 'category.water');
manager.addDocument('en', 'smelly water', 'category.water');

// --- 5. Other / General (Parks, Animals, Noise) ---
manager.addDocument('en', 'noise', 'category.other');
manager.addDocument('en', 'park', 'category.other');
manager.addDocument('en', 'dogs', 'category.other');
manager.addDocument('en', 'loud noise at night', 'category.other');
manager.addDocument('en', 'stray dogs are a menace', 'category.other');
manager.addDocument('en', 'park is not maintained', 'category.other');
manager.addDocument('en', 'public disturbance', 'category.other');
manager.addDocument('en', 'barking dogs all night', 'category.other');
manager.addDocument('en', 'illegal construction', 'category.other');
manager.addDocument('en', 'broken bench in the park', 'category.other');
manager.addDocument('en', 'playground equipment is unsafe', 'category.other');
manager.addDocument('en', 'just testing', 'category.other');
manager.addDocument('en', 'i have a problem', 'category.other');
manager.addDocument('en', 'loud music', 'category.other');
manager.addDocument('en', 'stray animals', 'category.other');
manager.addDocument('en', 'tree has fallen', 'category.other');
manager.addDocument('en', 'broken swing', 'category.other');
manager.addDocument('en', 'graffiti', 'category.other');

// Export the manager so app.js can use it
module.exports = manager;