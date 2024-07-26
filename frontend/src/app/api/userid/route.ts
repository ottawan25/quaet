import { ResponseData } from "../interfaces";

export async function GET(request: Request) {
  //console.log("Route Handlers called");
  //console.log(request.headers.get("x-forwarded-for"));
  const userAddress = request.headers.get("x-forwarded-for") || "unknown";
  const response: ResponseData = { response: { "user-address": userAddress } };
  return Response.json(response);
}
