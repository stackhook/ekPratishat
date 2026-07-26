import { authenticatedFetch } from "@repo/shared-provider";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface UpdateStatusProps {
  status?: string;
  remarks?: string;
  followUpAt?: Date;
}

interface UpdateLeadBasicInfoProps{
  name?:string;
  email?:string;
  coordinates?:string;
  notes?:Record<string,any>|null|any;
}

interface CompulsoryParameterProps {
  contact:string;
  dealType:string;
  clientType:string;
  source:string;
  categoryId:string;
}

export const useCreateLead = () => {
  return useMutation({
    mutationFn: async ({ formData }: { formData: FormData }) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/add`,
        {
          method: "POST",
          body: formData,
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Couldn't add Lead!!!");
    },
  });
};

export const useUpdateleadStatus = (id: string) => {
  return useMutation({
    mutationFn: async (payload: UpdateStatusProps) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/status/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  });
};

export const useUpdateFollowUpTime = (id: string) => {
  return useMutation({
    mutationFn: async ({ followUpAt }: { followUpAt: Date }) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/follow-up/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ followUpAt }),
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  });
};

export const useLeadBasicInfo = (id: string) => {
  return useMutation({
    mutationFn: async (payload: UpdateLeadBasicInfoProps) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/edit-basic/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  });
};


export const useChangeHander = (id:string) => {
  return useMutation({
    mutationFn: async (handlerId:string) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/change-handler/${id}?handlerId=${handlerId}`,
        {
          method: "PUT",
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  })
}


export const usePokeLead = (id:string) => {
  return useMutation({
    mutationFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/poke/${id}`,
        {
          method: "POST",
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  })
}

export const useUpdateCompulsoryParameter = (id:string) => {
  return useMutation({
    mutationFn: async (payload : CompulsoryParameterProps) => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/update-compulsory-parameter/${id}`,
        {
          method: "PUT",
           headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );
    },
    onError: (error) => {
      toast.error(error.message || "Operation Failed!!!");
    },
  })
}