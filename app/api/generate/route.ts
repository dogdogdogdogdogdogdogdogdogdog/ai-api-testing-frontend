export async function POST(req: Request) {
  const _data = await req.json();
  const res = await fetch(process.env.BACKEND_API + "/image/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(_data),
  });

  const data = await res.json();

  return Response.json(data);
}
