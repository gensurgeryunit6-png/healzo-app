// Built-in content: screen-free activities, gardening guides, expert tips, badges.
// Edit freely — no database change needed.

export type Category = 'Gardening' | 'Outdoor' | 'Creative' | 'Reading' | 'Family' | 'Science' | 'Calm' | 'Helping';

export const CATEGORIES: { key: Category; emoji: string; color: string; bg: string }[] = [
  { key: 'Gardening', emoji: '🌱', color: '#2F8F4E', bg: '#E6F6EA' },
  { key: 'Outdoor', emoji: '⚽', color: '#3E8EDE', bg: '#E7F1FC' },
  { key: 'Creative', emoji: '🎨', color: '#D9663F', bg: '#FDEDE8' },
  { key: 'Reading', emoji: '📚', color: '#7C5CD6', bg: '#F0EBFC' },
  { key: 'Family', emoji: '👨‍👩‍👧', color: '#C2408A', bg: '#FCE9F3' },
  { key: 'Science', emoji: '🔬', color: '#0E8F88', bg: '#E4F6F3' },
  { key: 'Calm', emoji: '🧘', color: '#5B6BD6', bg: '#ECEEFC' },
  { key: 'Helping', emoji: '🧺', color: '#B98A12', bg: '#FBF3DD' },
];

export function catInfo(c: string) {
  return CATEGORIES.find(x => x.key === c) ?? CATEGORIES[0];
}

export type Activity = {
  id: string;
  title: string;
  category: Category;
  emoji: string;
  minAge: number;
  maxAge: number;
  minutes: number;
  points: number;
  summary: string;
  steps: string[];
};

export const ACTIVITIES: Activity[] = [
  // Gardening
  { id: 'g-seeds', title: 'Plant seeds in a cup', category: 'Gardening', emoji: '🌱', minAge: 3, maxAge: 14, minutes: 20, points: 20,
    summary: 'Sow a few seeds and watch them sprout this week.',
    steps: ['Poke 3 holes in the bottom of a paper cup.', 'Fill it with soil or coco-peat.', 'Push 2–3 seeds (beans, methi or mustard) 1 cm deep.', 'Water gently and keep near a sunny window.', 'Check every morning and draw what you see!'] },
  { id: 'g-water', title: 'Water the plants', category: 'Gardening', emoji: '💧', minAge: 3, maxAge: 14, minutes: 10, points: 10,
    summary: 'Be the family plant-care hero today.',
    steps: ['Feel the soil — water only if the top is dry.', 'Pour slowly at the base, not on the leaves.', 'Pick off any dry leaves.', 'Tell someone which plant looks happiest.'] },
  { id: 'g-microgreens', title: 'Grow microgreens', category: 'Gardening', emoji: '🥬', minAge: 4, maxAge: 14, minutes: 25, points: 25,
    summary: 'Tiny greens you can eat in about a week.',
    steps: ['Spread 2 cm of soil in a shallow tray.', 'Sprinkle mustard, methi or radish seeds thickly.', 'Press down lightly and mist with water.', 'Cover for 2 days, then move to light.', 'Snip with scissors when 5–7 cm tall and add to a sandwich.'] },
  { id: 'g-compost', title: 'Start a compost jar', category: 'Gardening', emoji: '🪱', minAge: 6, maxAge: 14, minutes: 30, points: 30,
    summary: 'Turn kitchen scraps into plant food.',
    steps: ['Take a clear jar or bottle.', 'Layer soil, dry leaves and vegetable peels.', 'Spray with a little water.', 'Close loosely and keep in the shade.', 'Shake once a week and watch it change.'] },
  { id: 'g-journal', title: 'Plant diary', category: 'Gardening', emoji: '📏', minAge: 5, maxAge: 14, minutes: 15, points: 15,
    summary: 'Measure and draw your plant’s growth.',
    steps: ['Measure your plant with a ruler or string.', 'Count the leaves.', 'Draw it and write the date.', 'Compare with last week.'] },
  { id: 'g-bean-jar', title: 'Bean in a jar', category: 'Gardening', emoji: '🫘', minAge: 3, maxAge: 10, minutes: 15, points: 15,
    summary: 'See roots grow through glass.',
    steps: ['Line a glass jar with wet tissue paper.', 'Slide 2 rajma or moong beans between glass and tissue.', 'Keep the tissue damp.', 'Watch roots go down and shoots go up in 3–5 days.'] },
  // Outdoor
  { id: 'o-walk', title: 'Nature walk & spot 10 things', category: 'Outdoor', emoji: '🚶', minAge: 3, maxAge: 14, minutes: 30, points: 25,
    summary: 'Find a bird, a red flower, an ant, a round leaf…',
    steps: ['Walk with a grown-up in a park or lane.', 'Spot 10 different things in nature.', 'Collect 3 fallen leaves.', 'At home, sort them by size or colour.'] },
  { id: 'o-cycle', title: 'Cycle or skate', category: 'Outdoor', emoji: '🚲', minAge: 5, maxAge: 14, minutes: 30, points: 25,
    summary: 'Get moving for half an hour.',
    steps: ['Wear a helmet.', 'Ride in a safe space with an adult nearby.', 'Try a new route or a little race.'] },
  { id: 'o-games', title: 'Play a traditional game', category: 'Outdoor', emoji: '🪀', minAge: 4, maxAge: 14, minutes: 30, points: 25,
    summary: 'Hopscotch, kho-kho, lagori or hide and seek.',
    steps: ['Gather friends or family.', 'Agree on the rules.', 'Play for at least 20 minutes.', 'Teach someone a new game.'] },
  { id: 'o-ball', title: 'Ball practice', category: 'Outdoor', emoji: '⚽', minAge: 3, maxAge: 14, minutes: 20, points: 20,
    summary: 'Catch, kick or bounce — beat your own record.',
    steps: ['Count how many catches in a row you can do.', 'Try with the other hand.', 'Set a new record!'] },
  // Creative
  { id: 'c-draw', title: 'Draw your dream garden', category: 'Creative', emoji: '🖍️', minAge: 3, maxAge: 14, minutes: 20, points: 15,
    summary: 'What would you grow if you had a magic garden?',
    steps: ['Take a sheet of paper and colours.', 'Draw the plants, animals and paths.', 'Give your garden a name.', 'Show it to your family.'] },
  { id: 'c-clay', title: 'Clay animals', category: 'Creative', emoji: '🧸', minAge: 4, maxAge: 14, minutes: 30, points: 20,
    summary: 'Make three animals from clay or dough.',
    steps: ['Use clay or atta dough.', 'Roll balls and snakes as building blocks.', 'Make 3 animals.', 'Put on a little zoo show.'] },
  { id: 'c-leaf-art', title: 'Leaf print art', category: 'Creative', emoji: '🍁', minAge: 3, maxAge: 12, minutes: 25, points: 20,
    summary: 'Paint leaves and press them on paper.',
    steps: ['Collect leaves of different shapes.', 'Brush paint on the veiny side.', 'Press onto paper and lift.', 'Turn the prints into a picture.'] },
  { id: 'c-origami', title: 'Origami boat or frog', category: 'Creative', emoji: '🐸', minAge: 6, maxAge: 14, minutes: 20, points: 15,
    summary: 'Fold a square of paper into something that floats or hops.',
    steps: ['Cut a square of paper.', 'Ask a grown-up for folding steps from a book.', 'Test your boat in a bucket or race your frog.'] },
  { id: 'c-music', title: 'Make music', category: 'Creative', emoji: '🥁', minAge: 3, maxAge: 14, minutes: 20, points: 15,
    summary: 'Sing, drum on pots, or practise an instrument.',
    steps: ['Pick an instrument or make one (rice in a bottle!).', 'Play a song you know.', 'Make up your own tune.'] },
  // Reading
  { id: 'r-read', title: 'Read for 20 minutes', category: 'Reading', emoji: '📖', minAge: 5, maxAge: 14, minutes: 20, points: 20,
    summary: 'Any book you like — comics count!',
    steps: ['Find a comfy spot.', 'Read for 20 minutes.', 'Tell someone the best part.'] },
  { id: 'r-story', title: 'Story time with family', category: 'Reading', emoji: '📚', minAge: 2, maxAge: 8, minutes: 15, points: 15,
    summary: 'Read or tell a story together.',
    steps: ['Choose a picture book or a family story.', 'Read together, taking turns.', 'Ask: what might happen next?'] },
  { id: 'r-write', title: 'Write a mini story', category: 'Reading', emoji: '✏️', minAge: 7, maxAge: 14, minutes: 25, points: 25,
    summary: 'Five sentences about a talking plant.',
    steps: ['Think of a hero — maybe a tomato who wants to fly.', 'Write 5 sentences: start, problem, ending.', 'Draw a cover.'] },
  // Family
  { id: 'f-cook', title: 'Cook together', category: 'Family', emoji: '🥪', minAge: 4, maxAge: 14, minutes: 30, points: 25,
    summary: 'Make a simple snack with a grown-up.',
    steps: ['Wash your hands.', 'Choose a no-fire recipe like a sandwich or chaat.', 'Measure, mix and serve.', 'Clean up together.'] },
  { id: 'f-boardgame', title: 'Board game night', category: 'Family', emoji: '🎲', minAge: 4, maxAge: 14, minutes: 30, points: 20,
    summary: 'Ludo, carrom, snakes & ladders or chess.',
    steps: ['Pick a game everyone can play.', 'Phones away from the table.', 'Play at least one full game.'] },
  { id: 'f-talk', title: 'Dinner without screens', category: 'Family', emoji: '🍽️', minAge: 2, maxAge: 14, minutes: 30, points: 15,
    summary: 'Share the best and hardest part of your day.',
    steps: ['Put all phones in a basket.', 'Everyone shares one good thing and one hard thing.', 'Plan something fun for the weekend.'] },
  { id: 'f-photos', title: 'Family album stories', category: 'Family', emoji: '📷', minAge: 4, maxAge: 14, minutes: 20, points: 15,
    summary: 'Look at old printed photos and hear the stories.',
    steps: ['Ask grandparents or parents for an old album.', 'Pick 3 photos.', 'Ask who, where and what happened.'] },
  // Science
  { id: 's-volcano', title: 'Baking soda volcano', category: 'Science', emoji: '🌋', minAge: 5, maxAge: 12, minutes: 20, points: 20,
    summary: 'Fizzing eruption with kitchen ingredients.',
    steps: ['Put 2 spoons of baking soda in a cup on a tray.', 'Add a drop of food colour.', 'Pour in vinegar and watch it erupt.', 'Why does it fizz? Talk about gas bubbles.'] },
  { id: 's-float', title: 'Sink or float?', category: 'Science', emoji: '🛁', minAge: 3, maxAge: 8, minutes: 15, points: 15,
    summary: 'Guess, then test 10 objects in water.',
    steps: ['Fill a bucket with water.', 'Pick 10 safe objects.', 'Guess first, then test.', 'How many guesses were right?'] },
  { id: 's-sky', title: 'Cloud & sky watch', category: 'Science', emoji: '☁️', minAge: 4, maxAge: 14, minutes: 15, points: 10,
    summary: 'Find shapes in clouds or spot the moon.',
    steps: ['Lie down outside or look out a window.', 'Find 3 cloud shapes.', 'Check where the sun or moon is.'] },
  // Calm
  { id: 'm-breathe', title: 'Balloon breathing', category: 'Calm', emoji: '🎈', minAge: 3, maxAge: 14, minutes: 5, points: 5,
    summary: 'Five slow belly breaths.',
    steps: ['Sit comfortably.', 'Breathe in slowly, filling your belly like a balloon.', 'Breathe out slowly.', 'Repeat 5 times.'] },
  { id: 'm-yoga', title: 'Animal yoga', category: 'Calm', emoji: '🐍', minAge: 3, maxAge: 12, minutes: 15, points: 15,
    summary: 'Cobra, cat, tree and butterfly poses.',
    steps: ['Try cobra, cat, tree and butterfly poses.', 'Hold each for 5 breaths.', 'Make up a new animal pose.'] },
  { id: 'm-puzzle', title: 'Jigsaw or puzzle', category: 'Calm', emoji: '🧩', minAge: 4, maxAge: 14, minutes: 30, points: 20,
    summary: 'Finish a jigsaw, sudoku or crossword.',
    steps: ['Pick a puzzle for your age.', 'Start with the edges.', 'Take a break if stuck, then try again.'] },
  // Helping
  { id: 'h-tidy', title: 'Tidy your room', category: 'Helping', emoji: '🧹', minAge: 4, maxAge: 14, minutes: 15, points: 15,
    summary: 'Toys away, bed made, clothes folded.',
    steps: ['Set a 15-minute timer.', 'Put toys and books away.', 'Fold clothes.', 'Take a proud photo for your parent.'] },
  { id: 'h-help', title: 'Help in the kitchen', category: 'Helping', emoji: '🥕', minAge: 4, maxAge: 14, minutes: 15, points: 15,
    summary: 'Wash vegetables, set the table or sort groceries.',
    steps: ['Ask what help is needed.', 'Do one job from start to finish.', 'Ask what’s next!'] },
];

export function activityById(id: string) {
  return ACTIVITIES.find(a => a.id === id);
}

export function activitiesForAge(age: number | null) {
  if (age == null) return ACTIVITIES;
  return ACTIVITIES.filter(a => age >= a.minAge && age <= a.maxAge);
}

// Gardening guides
export type Guide = { id: string; title: string; emoji: string; time: string; level: 'Easy' | 'Medium'; intro: string; youNeed: string[]; steps: string[]; tip: string };

export const GARDEN_GUIDES: Guide[] = [
  { id: 'microgreens', title: 'Microgreens on a windowsill', emoji: '🥬', time: '7–10 days', level: 'Easy',
    intro: 'The fastest way for kids to see results — and eat what they grow.',
    youNeed: ['Shallow tray or takeaway box', 'Soil or coco-peat', 'Mustard, methi or radish seeds', 'Spray bottle'],
    steps: ['Fill the tray with 2–3 cm of moist soil.', 'Scatter seeds thickly so they almost touch.', 'Press lightly, mist, and cover with another tray for 2 days.', 'Uncover and place in bright light; mist daily.', 'Harvest with scissors at 5–7 cm.'],
    tip: 'Let your child be the official “mister” — a spray bottle makes watering fun and stops overwatering.' },
  { id: 'tomato', title: 'Cherry tomatoes in a pot', emoji: '🍅', time: '10–12 weeks', level: 'Medium',
    intro: 'A long-term project that teaches patience and care.',
    youNeed: ['Pot at least 30 cm deep with holes', 'Potting mix with compost', 'Tomato seedling or seeds', 'A stick for support'],
    steps: ['Plant the seedling deep, burying part of the stem.', 'Place where it gets 6+ hours of sun.', 'Water when the top 2 cm of soil is dry.', 'Tie the stem loosely to a stick as it grows.', 'Pick tomatoes when fully red.'],
    tip: 'Keep a growth chart on the fridge — measure every Sunday.' },
  { id: 'coriander', title: 'Coriander (dhania) from seeds', emoji: '🌿', time: '3–4 weeks', level: 'Easy',
    intro: 'Grow a kitchen herb your family uses every day.',
    youNeed: ['Whole coriander seeds from the kitchen', 'Pot or box', 'Soil'],
    steps: ['Gently crush the seeds into halves.', 'Soak overnight.', 'Sprinkle on soil and cover with a thin layer.', 'Keep moist; sprouts appear in 7–10 days.', 'Snip leaves for cooking after 3–4 weeks.'],
    tip: 'Let your child add their own coriander to dinner — kids eat more of what they grow.' },
  { id: 'marigold', title: 'Marigolds for butterflies', emoji: '🌼', time: '6–8 weeks to flower', level: 'Easy',
    intro: 'Bright, hardy flowers that bring bees and butterflies.',
    youNeed: ['Marigold seeds (or dried flower heads)', 'Pot or garden patch', 'Sunny spot'],
    steps: ['Pull petals off a dried marigold — the thin dark bits are seeds.', 'Sow 1 cm deep, 10 cm apart.', 'Water every other day.', 'Pinch off the top when 15 cm tall for bushier plants.', 'Count visiting butterflies!'],
    tip: 'Start an insect-spotting list next to your plant diary.' },
  { id: 'compost', title: 'Kitchen-scrap compost', emoji: '🪱', time: '6–8 weeks', level: 'Medium',
    intro: 'Turn peels into rich soil and learn about recycling.',
    youNeed: ['Bucket or pot with holes', 'Dry leaves or newspaper', 'Vegetable and fruit peels', 'Soil'],
    steps: ['Add a layer of dry leaves, then peels, then a little soil.', 'Repeat layers; keep it as damp as a squeezed sponge.', 'Mix once a week.', 'Ready when dark and earthy-smelling.'],
    tip: 'No meat, dairy or oil — keep it plant-only so it doesn’t smell.' },
  { id: 'regrow', title: 'Regrow from scraps', emoji: '🧅', time: '1–2 weeks', level: 'Easy',
    intro: 'Spring onion, lettuce or celery bottoms grow back in water.',
    youNeed: ['Spring onion roots or lettuce base', 'Small glass of water', 'Windowsill'],
    steps: ['Keep 3–5 cm of the root end.', 'Stand it in 2 cm of water.', 'Change water every 2 days.', 'Watch new green shoots appear.'],
    tip: 'Mark the height on the glass each day with a sticky note.' },
];

// Expert guidance (Indian Academy of Pediatrics, 2022) + practical tips
export type AgeBand = { label: string; range: [number, number]; limit: string; detail: string };

export const IAP_BANDS: AgeBand[] = [
  { label: 'Under 2 years', range: [0, 1], limit: 'No screen time', detail: 'No screens of any type, apart from occasional video calls with family.' },
  { label: '2 – 4 years', range: [2, 4], limit: 'Max 1 hour a day', detail: 'Supervised only — the less the better, in short sessions.' },
  { label: '5 – 10 years', range: [5, 10], limit: 'Less than 2 hours a day', detail: 'Includes recreational and homework screen time — the less the better.' },
  { label: '11+ years', range: [11, 19], limit: 'Balance first', detail: 'Screens should not replace sleep, an hour of physical activity, meals, school work, hobbies and family time.' },
];

export function ageFromBirthYear(y: number) {
  return Math.max(0, new Date().getFullYear() - y);
}

/** Suggested daily limit (minutes). Under-11 values follow IAP; 11+ is a Healzo default. */
export function suggestedLimit(age: number) {
  if (age < 2) return 0;
  if (age <= 4) return 60;
  if (age <= 10) return 90;
  return 120;
}

export function bandFor(age: number) {
  return IAP_BANDS.find(b => age >= b.range[0] && age <= b.range[1]) ?? IAP_BANDS[3];
}

export type Tip = { id: string; title: string; emoji: string; body: string };

export const TIPS: Tip[] = [
  { id: 't1', title: 'Make a family media plan', emoji: '📝', body: 'Agree together on when, where and how long screens are used. Write it down and stick it on the fridge — kids follow rules they helped make.' },
  { id: 't2', title: 'Screen-free zones', emoji: '🚫', body: 'Keep bedrooms and the dining table screen-free. Charge phones and tablets outside bedrooms at night.' },
  { id: 't3', title: 'No screens before bed', emoji: '🌙', body: 'Switch off screens at least an hour before sleep. Replace with a story, a bath or a chat about the day.' },
  { id: 't4', title: 'Watch together', emoji: '👀', body: 'Co-view and talk about what your child watches. Choose good-quality, age-appropriate content and avoid autoplay.' },
  { id: 't5', title: 'Swap, don’t just stop', emoji: '🔄', body: 'Taking screens away works better when you offer something fun instead — a game, a garden job or an outing.' },
  { id: 't6', title: 'Be the role model', emoji: '🙋', body: 'Children copy what they see. Put your own phone away during meals, play and conversations.' },
  { id: 't7', title: 'Use timers kindly', emoji: '⏳', body: 'Give a 5-minute warning before screen time ends. Let your child press “stop” themselves — it builds self-control.' },
  { id: 't8', title: 'Praise the effort', emoji: '🌟', body: 'Notice and praise screen-free choices. Rewards work best for effort and consistency, not perfection.' },
  { id: 't9', title: 'Watch for warning signs', emoji: '⚠️', body: 'Irritability when screens stop, poor sleep, dropping grades or loss of interest in play can mean screen use is too high. Talk to your paediatrician if worried.' },
];

// Badges
export type Badge = { id: string; title: string; emoji: string; desc: string };
export const BADGES: Badge[] = [
  { id: 'first', title: 'First step', emoji: '👣', desc: 'Complete your first screen-free activity' },
  { id: 'streak3', title: '3-day streak', emoji: '🔥', desc: 'Stay within your limit 3 days in a row' },
  { id: 'streak7', title: 'Week warrior', emoji: '🏆', desc: 'Stay within your limit 7 days in a row' },
  { id: 'green', title: 'Green thumb', emoji: '🪴', desc: 'Complete 3 gardening activities' },
  { id: 'ten', title: 'Activity star', emoji: '⭐', desc: 'Complete 10 activities' },
  { id: 'reader', title: 'Bookworm', emoji: '🐛', desc: 'Complete 3 reading activities' },
];

// Garden stages grow with the streak
export const GARDEN_STAGES = [
  { min: 0, emoji: '🟫', label: 'Bare soil', next: 'Stay within your limit today to plant a seed!' },
  { min: 1, emoji: '🌱', label: 'Sprout', next: '2 more days to grow leaves.' },
  { min: 3, emoji: '🌿', label: 'Leafy plant', next: '2 more days to get a bud.' },
  { min: 5, emoji: '🪴', label: 'Strong plant', next: '2 more days to bloom!' },
  { min: 7, emoji: '🌻', label: 'Blooming', next: 'Keep going to grow a tree!' },
  { min: 14, emoji: '🌳', label: 'Mighty tree', next: 'You are a screen-time champion!' },
];

export function gardenStage(streak: number) {
  let s = GARDEN_STAGES[0];
  for (const g of GARDEN_STAGES) if (streak >= g.min) s = g;
  return s;
}
