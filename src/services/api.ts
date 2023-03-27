import { signOut } from "@/contexts/AuthContext";
import { AuthTokenError } from "@/errors/AuthTokenError";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { GetServerSidePropsContext } from "next";
import { parseCookies, setCookie } from "nookies";

type FailedRequests = {
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
};

let isRefreshing = false;
let failedRequestsQueue: FailedRequests[] = [];
let isServerSide = typeof window === "undefined";

export function setupApiClient(ctx?: GetServerSidePropsContext) {
  let cookies = parseCookies(ctx);

  const api = axios.create({
    headers: {
      Authorization: `Bearer ${cookies["nextauth.token"]}`,
    },
    baseURL: "http://localhost:3333",
  });

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError<any>) => {
      if (error.response?.status === 401) {
        if (error.response.data?.code === "token.expired") {
          cookies = parseCookies(ctx);

          const { "nextauth.refreshToken": refreshToken } = cookies;
          const originalConfig =
            error.config ?? ({} as InternalAxiosRequestConfig<any>);

          if (!isRefreshing) {
            isRefreshing = true;

            api
              .post("/refresh", { refreshToken })
              .then((response) => {
                const { token, refreshToken: rToken } = response.data;

                setCookie(ctx, "nextauth.token", token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });

                setCookie(ctx, "nextauth.refreshToken", rToken, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: "/",
                });

                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestsQueue.forEach((req) => req.resolve(token));
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((req) => req.reject(err));
                failedRequestsQueue = [];

                if (!isServerSide) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }

          return new Promise((resolve, reject) => {
            const obj = {
              resolve: (token: string) => {
                originalConfig.headers["Authorization"] = `Bearer ${token}`;

                resolve(api(originalConfig));
              },
              reject: (err: AxiosError) => {
                reject(err);
              },
            };

            failedRequestsQueue.push(obj);
          });
        } else {
          if (!isServerSide) {
            signOut();
          } else {
            return Promise.reject(new AuthTokenError());
          }
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}
