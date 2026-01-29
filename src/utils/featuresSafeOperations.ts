import { supabase } from "@/integrations/supabase/client";

// Safe insert function that only includes available columns
export const safeInsertFeature = async (featureData: any) => {
  try {
    // First check what columns are available
    const { data: testData } = await supabase
      .from("features")
      .select("*")
      .limit(1);

    let availableColumns: string[] = [];
    if (testData && testData.length > 0) {
      availableColumns = Object.keys(testData[0]);
    } else {
      // Default columns if no data exists
      availableColumns = ['id', 'title', 'description', 'status', 'sort_order', 'link', 'created_at'];
    }

    // Filter the data to only include available columns
    const filteredData: any = {};
    for (const key of Object.keys(featureData)) {
      if (availableColumns.includes(key)) {
        filteredData[key] = featureData[key];
      }
    }

    console.log("Safe insert - Available columns:", availableColumns);
    console.log("Safe insert - Filtered data:", filteredData);

    const { data, error } = await supabase
      .from("features")
      .insert(filteredData);

    return { data, error };
  } catch (error) {
    console.error("Exception in safeInsertFeature:", error);
    return { data: null, error: { message: "Failed to insert feature", code: "INSERT_ERROR" } };
  }
};

// Safe update function that only includes available columns
export const safeUpdateFeature = async (id: string, featureData: any) => {
  try {
    // First check what columns are available
    const { data: testData } = await supabase
      .from("features")
      .select("*")
      .limit(1);

    let availableColumns: string[] = [];
    if (testData && testData.length > 0) {
      availableColumns = Object.keys(testData[0]);
    } else {
      // Default columns if no data exists
      availableColumns = ['id', 'title', 'description', 'status', 'sort_order', 'link', 'created_at'];
    }

    // Filter the data to only include available columns
    const filteredData: any = {};
    for (const key of Object.keys(featureData)) {
      if (availableColumns.includes(key)) {
        filteredData[key] = featureData[key];
      }
    }

    console.log("Safe update - Available columns:", availableColumns);
    console.log("Safe update - Filtered data:", filteredData);

    const { data, error } = await supabase
      .from("features")
      .update(filteredData)
      .eq("id", id);

    return { data, error };
  } catch (error) {
    console.error("Exception in safeUpdateFeature:", error);
    return { data: null, error: { message: "Failed to update feature", code: "UPDATE_ERROR" } };
  }
};