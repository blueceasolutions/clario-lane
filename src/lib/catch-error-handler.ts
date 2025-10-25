import { toast } from "sonner";

export const catchError = (error: unknown) => {
  console.log({ error });
  if (error instanceof Error) {
    toast.error(error.message);
  } else {
    toast.error("An unexpected error occurred");
  }
};

export const logServerError = (error: unknown) => {
  console.error(error);
  return null;
};
