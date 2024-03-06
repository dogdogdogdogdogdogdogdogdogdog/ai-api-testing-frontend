"use server";
import Image from "next/image";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import "./page.css";

async function Images({ id }: { id: string }) {
  const res = await fetch(process.env.BACKEND_API + "/image/query", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requestId: id }),
    next: {
      tags: ["get-batch-result" + id],
    },
  });

  const {
    images,
  }: {
    images:
      | Array<{
          image: string;
          traits: Array<{
            name: string;
            value: string;
          }>;
          extraData: string;
        }>
      | undefined;
  } = await res.json();

  if (!images) {
    await revalidateTag("get-batch-result" + id);
    return (
      <p>Generation in progress (1 min per prompt). Refresh the page later.</p>
    );
  }

  return (
    <>
      {images.map(({ image, traits }) => (
        <>
          <Image src={image} width={270} height={270} alt="image" />
          <pre>{JSON.stringify(traits, undefined, 2)}</pre>
        </>
      ))}
    </>
  );
}

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <div>
      <Images id={params.id} />
      <Link href="/">Back to home</Link>
    </div>
  );
}
