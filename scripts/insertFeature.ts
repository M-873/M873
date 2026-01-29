
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zxbydjiptihzsxucvynp.supabase.co';
const supabaseKey = 'sb_publishable_OfJIxmZ_jiVGS4boYvt2Gg_BMRxUkKc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertFeature() {
    console.log("Logging in...");

    // Attempt login with password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'mahfuzulislam873@gmail.com',
        password: 'mahfugul873'
    });

    if (authError) {
        console.error("Login failed:", authError.message);
        return;
    }

    console.log("Logged in as:", authData.user?.email);

    // Define the feature
    const newFeature = {
        title: 'Hostel Expense Management',
        description: 'The Hostel Expense Management app is still being developed. In about a month, around 80% of the main features will be ready. Later, AI will be added to automate about 60% of tasks using CCTV and mobile devices, so only minimal supervision is needed. The goal is to make daily operations easier with smart automation.',
        link: 'https://frontend-inky-one-43.vercel.app/',
        status: 'upcoming',
        sort_order: 1
    };

    console.log("Inserting feature...");
    const { data, error } = await supabase
        .from('features')
        .insert(newFeature)
        .select();

    if (error) {
        console.error("Insert failed:", error);
    } else {
        console.log("Success! Feature inserted:", data);
    }
}

insertFeature();
