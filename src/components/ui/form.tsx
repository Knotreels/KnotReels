"use client";

import { Controller, useFormContext, FormProvider, SubmitHandler } from "react-hook-form";
import React from "react";

export function Form({ children, ...props }: React.HTMLAttributes<HTMLFormElement>) {
  const methods = useFormContext();
  return (
    <form
      {...props}
      onSubmit={methods.handleSubmit(props.onSubmit as SubmitHandler<any> || (() => {}))}
    >
      {children}
    </form>
  );
}

export function FormProviderWrapper({ children, methods }: { children: React.ReactNode; methods: any }) {
  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function FormField({
  name,
  children,
}: {
  name: string;
  children: (field: {
    value: any;
    onChange: (val: any) => void;
    onBlur: () => void;
    ref: React.Ref<any>;
  }) => React.ReactNode;
}) {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const content = children(field);
        return React.isValidElement(content) ? content : <></>;
      }}
    />
  );
}

export function FormItem({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>;
}

export function FormLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium">{children}</label>;
}

export function FormMessage({ message }: { message?: string }) {
  return message ? <p className="text-xs text-red-500 mt-1">{message}</p> : null;
}
