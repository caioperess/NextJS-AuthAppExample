import { AuthContext } from "@/contexts/AuthContext";
import { setupApiClient } from "@/services/api";
import { withSSRAuth } from "@/utils/withSSRAuth";
import { GetServerSideProps } from "next";
import { useContext } from "react";

export default function Dashboard() {
  const { isAuthenticated, user } = useContext(AuthContext);

  return <h1>Dashboard: {user?.email}</h1>;
}

export const getServerSideProps: GetServerSideProps = withSSRAuth(
  async (ctx) => {
    const apiClient = setupApiClient(ctx);
    const response = await apiClient.get("/me");

    return {
      props: {},
    };
  }
);
