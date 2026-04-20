import { Suspense } from "react";
import { BuilderPage } from "./builder-page";

export const metadata = {
  title: "ShipDev — Builder",
};

export default function Page() {
  return (
    <Suspense>
      <BuilderPage />
    </Suspense>
  );
}
