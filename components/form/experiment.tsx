"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  useFieldArray,
  Control,
  useWatch,
  Controller,
} from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useLocalStorage } from "usehooks-ts";
import Link from "next/link";

const formSchema = z.object({
  seed: z.string(),
  newTraits: z.array(
    z.object({
      name: z.string(),
      value: z.string(),
    })
  ),
  baseImage: z.object({
    image: z.string(),
    traits: z.array(
      z.object({
        name: z.string(),
        value: z.string(),
      })
    ),
  }),
});

function NewTraits({
  control,
}: {
  control: Control<z.infer<typeof formSchema>>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "newTraits",
  });

  return (
    <>
      <ul>
        {fields.map((item, index) => (
          <li key={item.id} className="flex">
            <FormField
              control={control}
              name={`newTraits.${index}.name`}
              render={({ field }) => (
                <FormItem className="mr-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="name" {...field} />
                  </FormControl>
                  <FormDescription>Name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`newTraits.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="value" {...field} />
                  </FormControl>
                  <FormDescription>Value</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-8 ml-2"
              type="button"
              onClick={() => remove(index)}
              variant={"destructive"}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" onClick={() => append({ name: "", value: "" })}>
        Add new trait
      </Button>
    </>
  );
}

function BaseImageNewTraits({
  control,
}: {
  control: Control<z.infer<typeof formSchema>>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "baseImage.traits",
  });

  return (
    <>
      <ul>
        {fields.map((item, index) => (
          <li key={item.id} className="flex">
            <FormField
              control={control}
              name={`baseImage.traits.${index}.name`}
              render={({ field }) => (
                <FormItem className="mr-2">
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="name" {...field} />
                  </FormControl>
                  <FormDescription>Name</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`baseImage.traits.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Value</FormLabel>
                  <FormControl>
                    <Input placeholder="value" {...field} />
                  </FormControl>
                  <FormDescription>Value</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              className="mt-8 ml-2"
              type="button"
              onClick={() => remove(index)}
              variant={"destructive"}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
      <Button
        type="button"
        onClick={() => append({ name: "", value: "" })}
        className="mr-2"
      >
        Add base image trait
      </Button>
    </>
  );
}

export function ExperimentForm() {
  const [ids, setIds] = useLocalStorage(
    "requestIds",
    {},
    {
      initializeWithValue: true,
    }
  );

  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      seed: "",
      newTraits: [],
      baseImage: {
        image: "",
        traits: [],
      },
    },
  });

  const { control } = form;

  const values = useWatch({ control });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);

    const { requestId } = await (
      await fetch("/api/generate", {
        body: JSON.stringify(values),
      })
    ).json();

    setIds((prev) => ({ ...prev, [requestId]: requestId }));
  }

  return (
    <Form {...form}>
      <div className="flex">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 mr-2">
          <FormField
            control={form.control}
            name="seed"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Seed</FormLabel>
                <FormControl>
                  <Input placeholder="seed" {...field} />
                </FormControl>
                <FormDescription>This is your seed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <NewTraits control={control} />
          <Controller
            control={control}
            name={"baseImage.image"}
            render={({ field: { value, onChange, ...field } }) => {
              return (
                <Input
                  {...field}
                  onChange={(event) => {
                    const files = event.target.files;
                    if (!files || !files[0]) return;

                    const FR = new FileReader();

                    FR.addEventListener("load", function (evt) {
                      onChange(evt.target!.result);
                    });

                    FR.readAsDataURL(files[0]);
                  }}
                  type="file"
                />
              );
            }}
          />
          <img src={values.baseImage?.image} />
          <BaseImageNewTraits control={control} />

          <Button type="submit">Submit</Button>
        </form>
        <pre className="w-96 break-all overflow-hidden">
          {JSON.stringify(values, undefined, 2)}
        </pre>
        <pre>
          <h1>Results</h1>
          <ul>
            {Object.keys(ids).map((key) => (
              <Link href={`/results/${key}`}>{key}</Link>
            ))}
          </ul>
        </pre>
      </div>
    </Form>
  );
}
