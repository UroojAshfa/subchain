import React from "react";
import Head from "next/head";
import SubscriptionApp from "../src/SubscriptionApp";

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Dreamster Subscriptions</title>
      </Head>

      <main className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <SubscriptionApp />
      </main>
    </>
  );
}
