import { Can } from "@/components/Can";
import { AuthContext } from "@/contexts/AuthContext";
import { setupApiClient } from "@/services/api";
import { withSSRAuth } from "@/utils/withSSRAuth";
import { GetServerSideProps } from "next";

export default function Metrics() {
  return (
    <>
      <h1>Metrics</h1>
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
  },
  {
    permissions: ["metrics.list"],
    roles: ["administrator"],
  }
);
