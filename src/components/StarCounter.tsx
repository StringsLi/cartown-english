type StarCounterProps = {
  stars: number;
};

export function StarCounter({ stars }: StarCounterProps) {
  return (
    <div className="rounded-full border-4 border-white bg-[#fff7bd] px-4 py-2 text-lg font-black shadow-button">
      <span className="text-[#ffb703]">★</span> {stars}
    </div>
  );
}
