const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) env[key.trim()] = value.trim();
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const mountains = [
    { name: '북한산', height: 836, region: '서울/경기', lat: 37.6617, lng: 126.9782, difficulty: 'medium' },
    { name: '설악산', height: 1708, region: '강원', lat: 38.1189, lng: 128.4658, difficulty: 'hard' },
    { name: '한라산', height: 1947, region: '제주', lat: 33.3617, lng: 126.5292, difficulty: 'hard' },
    { name: '지리산', height: 1915, region: '경남/전남/전북', lat: 35.3369, lng: 127.7306, difficulty: 'hard' },
    { name: '속리산', height: 1058, region: '충북/경북', lat: 36.5333, lng: 127.8333, difficulty: 'hard' },
    { name: '인왕산', height: 338, region: '서울', lat: 37.582, lng: 126.953, difficulty: 'easy' },
    { name: '도봉산', height: 740, region: '서울/경기', lat: 37.698, lng: 127.032, difficulty: 'medium' }
];

async function seed() {
    console.log('Seeding mountains...');
    const { data, error } = await supabase
        .from('mountains')
        .upsert(mountains, { onConflict: 'name' });

    if (error) {
        console.error('Error seeding:', error);
    } else {
        console.log('Successfully seeded 7 sample mountains.');
    }
}

seed();
