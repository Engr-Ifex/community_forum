import { Link } from "react-router-dom";

import BackendStatus from "../common/BackendStatus";

const Home = () => {
  return (
    <section className="mx-auto max-w-2xl py-10 ">
      <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Community Forum
      </h1>

      <p className="mt-5 text-lg text-slate-600">
        A place for users to create discussions, share knowledge, ask questions and participate in
        conversations.
      </p>

      <Link
        to="/discussions"
        className="mt-8 inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
      >
        Explore Discussions
      </Link>

      <div className="mt-10">
        <BackendStatus />
      </div>
    </section>
  );
};

export default Home;
