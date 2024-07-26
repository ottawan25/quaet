import axios, { AxiosResponse } from "axios";

export async function sendPostRequest<T, U>(
  url: string,
  data: T,
): Promise<AxiosResponse<U>> {
  try {
    console.log("sendPostRequest called");
    console.log(`url: ${url}`);
    const response: AxiosResponse<U> = await axios.post(url, data);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      throw new Error(error.message);
    } else {
      throw new Error("post request failed (No AxiosError)");
    }
  }
}

export async function sendGetRequest<U>(
  url: string,
): Promise<AxiosResponse<U>> {
  try {
    console.log("sendGetRequest called");
    console.log(`url: ${url}`);
    const response: AxiosResponse<U> = await axios.get(url);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log(error);
      throw new Error(error.message);
    } else {
      throw new Error("get request failed (No AxiosError)");
    }
  }
}
