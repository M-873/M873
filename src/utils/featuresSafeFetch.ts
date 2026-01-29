import { supabase } from "@/integrations/supabase/client";

// Utility function to safely fetch features with error handling for missing columns
export const fetchFeaturesSafe = async () => {
  try {
    console.log("Fetching features with safe column detection...");
    
    // First, try to get the actual available columns
    const { data: testData, error: testError } = await supabase
      .from("features")
      .select("*")
      .limit(1);

    if (testError) {
      console.error("Database error:", testError);
      
      // Check if it's a column-related error
      if (testError.code === '42703' && testError.message?.includes('status')) {
        console.log("Status column missing, fetching without status column...");
        
        // Try without status column
        const { data, error } = await supabase
          .from("features")
          .select("id, title, description, sort_order, created_at, link")
          .order("sort_order", { ascending: true });

        if (error) {
          console.error("Error fetching features without status:", error);
          return { data: [], error };
        }

        // Add default status to features
        const featuresWithStatus = data?.map(feature => ({
          ...feature,
          status: 'upcoming' // Default status
        })) || [];

        return { data: featuresWithStatus, error: null };
      }
      
      return { data: [], error: testError };
    }

    // If test query succeeded, fetch all features with all columns
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .order("sort_order", { ascending: true });

    return { data: data || [], error };
    
  } catch (error) {
    console.error("Exception in fetchFeaturesSafe:", error);
    return { data: [], error: { message: "Failed to fetch features", code: "UNKNOWN_ERROR" } };
  }
};

// Utility function to check if a column exists in the features table
export const checkFeaturesSchema = async () => {
  try {
    const { data, error } = await supabase
      .from("features")
      .select("*")
      .limit(1);

    if (error) {
      console.error("Schema check error:", error);
      return { availableColumns: [], error };
    }

    if (data && data.length > 0) {
      const availableColumns = Object.keys(data[0]);
      console.log("Available columns in features table:", availableColumns);
      return { availableColumns, error: null };
    }

    return { availableColumns: [], error: null };
  } catch (error) {
    console.error("Exception in checkFeaturesSchema:", error);
    return { availableColumns: [], error: { message: "Failed to check schema", code: "UNKNOWN_ERROR" } };
  }
};