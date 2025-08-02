import { supabase } from '@/lib/supabase';
import type { Profile, UserAddress, UserPreferences, InsertUserAddress, InsertUserPreferences, UpdateProfile, UpdateUserAddress, UpdateUserPreferences } from '../types/database.types';

export interface ProfileResponse {
  data: Profile | null;
  error: Error | null;
}

export interface AddressesResponse {
  data: UserAddress[] | null;
  error: Error | null;
}

export interface PreferencesResponse {
  data: UserPreferences | null;
  error: Error | null;
}

// Get user profile
export const getUserProfile = async (userId: string): Promise<ProfileResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Update user profile
export const updateUserProfile = async (userId: string, updates: UpdateProfile): Promise<ProfileResponse> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Get user addresses
export const getUserAddresses = async (userId: string): Promise<AddressesResponse> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Add user address
export const addUserAddress = async (addressData: InsertUserAddress): Promise<{ data: UserAddress | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .insert(addressData)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Update user address
export const updateUserAddress = async (addressId: string, updates: UpdateUserAddress): Promise<{ data: UserAddress | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_addresses')
      .update(updates)
      .eq('id', addressId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Delete user address
export const deleteUserAddress = async (addressId: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('user_addresses')
      .delete()
      .eq('id', addressId);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Get user preferences
export const getUserPreferences = async (userId: string): Promise<PreferencesResponse> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    // If no preferences exist, create default ones
    if (!data) {
      const defaultPreferences: InsertUserPreferences = {
        user_id: userId,
        email_quotes: true,
        email_updates: true,
        email_marketing: false,
        sms_quotes: false,
        sms_updates: false,
        push_notifications: true,
        profile_visibility: 'private',
        data_sharing: false,
        analytics_opt_out: false,
        two_factor_enabled: false
      };

      const { data: newData, error: insertError } = await supabase
        .from('user_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (insertError) throw insertError;

      return { data: newData, error: null };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Update user preferences
export const updateUserPreferences = async (userId: string, updates: UpdateUserPreferences): Promise<PreferencesResponse> => {
  try {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (userId: string, file: File): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/avatar.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    // Update profile with new picture URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture_url: urlData.publicUrl })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { url: urlData.publicUrl, error: null };
  } catch (error) {
    return { url: null, error: error as Error };
  }
};

// Delete profile picture
export const deleteProfilePicture = async (userId: string): Promise<{ error: Error | null }> => {
  try {
    // Remove from storage
    const { error: deleteError } = await supabase.storage
      .from('avatars')
      .remove([`${userId}/avatar.jpg`, `${userId}/avatar.png`, `${userId}/avatar.jpeg`]);

    // Update profile to remove picture URL
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ profile_picture_url: null })
      .eq('id', userId);

    if (updateError) throw updateError;

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
};

// Real-time subscription for profile updates
export const subscribeToProfileUpdates = (
  userId: string,
  callback: (payload: any) => void
) => {
  return supabase
    .channel('profile_updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};