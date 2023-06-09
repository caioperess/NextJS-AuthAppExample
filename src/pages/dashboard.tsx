import { Can } from "@/components/Can";
import { AuthContext } from "@/contexts/AuthContext";
import { setupApiClient } from "@/services/api";
import { withSSRAuth } from "@/utils/withSSRAuth";
import { GetServerSideProps } from "next";
import { useContext } from "react";

export default function Dashboard() {
  const { isAuthenticated, user, signOut } = useContext(AuthContext);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button type="button" onClick={signOut}>
        Sign out
      </button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
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
