import Game from "@/components/Game";
import Nav from "@/components/Nav";

export default function Home() {
  return (
    <div className="mx-auto min-h-screen max-w-2xl px-4 py-10">
      <div className="mb-8 flex justify-center">
        <Nav />
      </div>
      <Game />
    </div>
  );
}
