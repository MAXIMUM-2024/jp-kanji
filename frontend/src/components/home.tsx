import React, { useEffect, useState } from "react";
import debounce from "lodash.debounce";

const fetchKanjiData = async (kanjiList: string[]) => {
    try {
        const response = await fetch('http://localhost:5000/api/kanji/batch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ kanjiList }),
        });

        if (response.ok) {
            const kanjiLevels = await response.json();
            return kanjiLevels;
        } else {
            console.error('Failed to fetch Kanji data');
            return null;
        }
    } catch (error) {
        console.error('Error fetching Kanji data:', error);
        return null;
    }
};

const handleKanjiDataFetch = debounce(async (inputText: string, setKanjiData: React.Dispatch<React.SetStateAction<Map<string, { wk_level: number; count: number }>>>) => {
    const kanjiRegex = /[一-龯々〆〤]/g;
    const kanjiMatches = inputText.match(kanjiRegex);

    if (!kanjiMatches) { //Possible null value error on kanjiMatches
        setKanjiData(new Map());
        return;
    }

    const kanjiList = Array.from( new Set(kanjiMatches) );  

    const kanjiLevels = await fetchKanjiData(kanjiList);
    if (kanjiLevels) {
        const newKanjiData: Map<string, { wk_level: number; count: number }> = new Map();

        kanjiMatches.forEach((kanji) => {
            if (newKanjiData.has(kanji)) {
                newKanjiData.get(kanji)!.count += 1;
            } else {
                newKanjiData.set(kanji, { wk_level: kanjiLevels[kanji] || -1, count: 1 });
            }
        });

        const sortedKanjiData = Array.from(newKanjiData.entries()).sort(
            ([, a], [, b]) => b.count - a.count
        );

        setKanjiData(new Map(sortedKanjiData));
    }
}, 200); // 200 ms debounce delay

const Home = () => {
    const [inputText, setInputText] = useState("");
    const [kanjiData, setKanjiData] = useState<Map<string, { wk_level: number; count: number }>>(new Map());

    /* Session Storage when you click the about page */
    useEffect(() => {
        const savedText = sessionStorage.getItem("inputText");
        if (savedText) {
            setInputText(savedText);
        }
    }, []);

    useEffect(() => {
        if (inputText) {
            sessionStorage.setItem("inputText", inputText);
        }
    }, [inputText]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInputText = event.target.value;
        setInputText(newInputText);

        handleKanjiDataFetch(newInputText, setKanjiData);
    };

    return (
        <div className="min-h-screen mx-auto py-5 px-5 bg-gray-100">
            <div className="flex h-[94vh]">
                <div className="w-1/2 p-3 bg-gray-300 flex flex-col rounded-md">
                    <p className="text-center text-2xl">Input text</p>
                    <div className="flex flex-col flex-grow">
                        <textarea
                            className="mt-2 p-3 border rounded-md resize-none h-[88vh] text-xl"
                            placeholder="Type something here..."
                            value={inputText}
                            onChange={handleInputChange}
                        ></textarea>
                    </div>
                </div>

                <div className="w-1/2 p-3 bg-gray-200 flex flex-col rounded-md">
                    <p className="text-center text-2xl">Output</p>
                    <div className="flex flex-col flex-grow">
                        <textarea
                            className="mt-2 p-3 border rounded-md resize-none h-[88vh] text-2xl"
                            value={Array.from(kanjiData.entries()).map(([kanji, data]) => `${kanji}: Level ${data.wk_level}, Count: ${data.count}`).join('\n')}
                            readOnly
                        ></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

//npm run dev