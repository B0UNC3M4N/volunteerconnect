
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const categories = [
  'Environment',
  'Education',
  'Health',
  'Community',
  'Animals',
  'Arts & Culture',
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const formSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  organization: z.string().min(2, {
    message: "Organization name is required.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  location: z.string().min(3, {
    message: "Location is required.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  urgent: z.boolean().default(false).optional(),
  image: z
    .instanceof(FileList)
    .optional()
    .refine((files) => {
      return !files || files.length === 0 || files[0].size <= MAX_FILE_SIZE;
    }, `Max file size is 5MB.`)
    .refine(
      (files) => {
        return !files || 
          files.length === 0 || 
          ACCEPTED_IMAGE_TYPES.includes(files[0].type);
      },
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    ),
});

type OpportunityFormValues = z.infer<typeof formSchema>;

interface OpportunityFormProps {
  onSuccess: () => void;
}

export function OpportunityForm({ onSuccess }: OpportunityFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<OpportunityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      organization: '',
      description: '',
      date: '',
      location: '',
      category: '',
      urgent: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting || isUploading;

  // Handle image preview
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      // Create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  // Upload image to Supabase Storage
  const uploadImage = async (file: File): Promise<string | null> => {
    if (!file) return null;
    
    setIsUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `opportunity-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('opportunities')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('opportunities')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error uploading image",
        description: error.message || "Failed to upload image.",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  async function onSubmit(values: OpportunityFormValues) {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication error",
        description: "You must be logged in to submit an opportunity.",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Upload image if provided
      let imageUrl = null;
      const files = values.image;
      if (files && files.length > 0) {
        imageUrl = await uploadImage(files[0]);
      }
      
      // Make sure all required fields are present and not undefined
      const opportunityData = {
        title: values.title,
        organization: values.organization,
        description: values.description,
        date: values.date,
        location: values.location,
        category: values.category,
        urgent: values.urgent || false,
        image_url: imageUrl,
        created_by: user.id,
      };

      const { error } = await supabase
        .from('opportunities')
        .insert(opportunityData);

      if (error) throw error;

      toast({
        title: "Opportunity created",
        description: "Your volunteer opportunity has been published successfully.",
      });
      
      onSuccess();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create opportunity.",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title *</FormLabel>
              <FormControl>
                <Input placeholder="E.g., Beach Clean-Up Event" {...field} />
              </FormControl>
              <FormDescription>
                A clear, descriptive title for your volunteer opportunity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="organization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name *</FormLabel>
              <FormControl>
                <Input placeholder="Your organization's name" {...field} />
              </FormControl>
              <FormDescription>
                The name of your nonprofit or organization.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the category that best describes this opportunity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>
                  When will this opportunity take place?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location *</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., City Park, Remote, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Where will this opportunity take place?
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description *</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the opportunity, including details about what volunteers will do, any requirements, and the impact they'll make." 
                  className="min-h-[150px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Provide detailed information about the volunteer opportunity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Cover Image</FormLabel>
              <FormControl>
                <div>
                  <Input 
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    {...fieldProps}
                    onChange={(e) => {
                      onChange(e.target.files);
                      handleImageChange(e);
                    }}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 mb-1">Preview:</p>
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full max-h-40 object-cover rounded-md" 
                      />
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Upload an image that represents your opportunity (max 5MB, JPG, PNG or WebP).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="urgent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Mark as urgent
                </FormLabel>
                <FormDescription>
                  Check this if you need volunteers on short notice.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Publish Opportunity"}
        </Button>
      </form>
    </Form>
  );
}
