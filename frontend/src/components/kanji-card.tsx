interface KanjiCardProps {
  kanji: string;
  wk_level: number;
  count: number;
}

const KanjiCard: React.FC<KanjiCardProps> = ({ kanji, wk_level, count }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-4 m-2 rounded-md shadow-md w-40">
      <div className="text-4xl">{kanji}</div>
      <div className="text-lg text-gray-600">WK Level: {wk_level}</div>
      {<div className="text-lg text-gray-600">Count: {count}</div>}
    </div>
  );
};

export default KanjiCard;