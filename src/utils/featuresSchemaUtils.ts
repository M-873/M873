import { supabase } from "@/integrations/supabase/client";

// Utility function to check if a column exists in the features table
export const checkFeaturesColumnExists = async (columnName: string): Promise<boolean> => {
  try {
    // Try to select just that column
    const { data, error } = await supabase
      .from('features')
      .select(columnName)
      .limit(1);

    if (error) {
      // If it's a column not found error, return false
      if (error.code === 'PGRST204' && error.message?.includes(columnName)) {
        return false;
      }
      // For other errors, assume column exists (safer)
      return true;
    }
    
    return true;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      const err = error as { code?: string; message?: string };
      if (err.code === 'PGRST204' && err.message?.includes(columnName)) {
        return false;
      }
    }
    return true;
  }
};

// Utility function to get available columns
export const getAvailableFeaturesColumns = async (): Promise<string[]> => {
  try {
    // Try to select all columns
    const { data, error } = await supabase
      .from('features')
      .select('*')
      .limit(1);

    if (data && data.length > 0) {
      return Object.keys(data[0]);
    }
    
    // Fallback: try common columns individually
    const commonColumns = ['id', 'title', 'description', 'status', 'sort_order', 'created_at', 'link'];
    const availableColumns = [];
    
    for (const column of commonColumns) {
      if (await checkFeaturesColumnExists(column)) {
        availableColumns.push(column);
      }
    }
    
    return availableColumns;
  } catch (error) {
    // Return most common columns as fallback
    return ['id', 'title', 'description', 'status', 'sort_order', 'created_at'];
  }
};