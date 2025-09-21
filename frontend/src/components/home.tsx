import React, { useEffect, useState } from "react";
import debounce from "lodash.debounce";
import KanjiCard from "./kanji-card";

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

const Home = () => {
    const [inputText, setInputText] = useState("");
    const [kanjiData, setKanjiData] = useState<Map<string, { wk_level: number; count: number }>>(new Map());
    const [isLoading, setIsLoading] = useState(false);

    /* Session Storage so when you click the about page the text doesn't clear */
    useEffect(() => { 
        //Retrieve text from session storage
        const savedText = sessionStorage.getItem("inputText");
        if (savedText) {
            setInputText(savedText);
        }
        //Set text to session storage
        if (inputText) {
            sessionStorage.setItem("inputText", inputText);
        };
    }, [inputText]);

    const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newInputText = event.target.value;
        setInputText(newInputText);

        handleKanjiDataFetch.cancel(); //Only process the last time the user updates the TextArea

        handleKanjiDataFetch(newInputText, setKanjiData);
        //TODO: Prevent processing text if it's super large
    };

    const handleKanjiDataFetch = debounce(async (inputText: string, setKanjiData: React.Dispatch<React.SetStateAction<Map<string, { wk_level: number; count: number }>>>) => {
        const kanjiRegex = /[一-龯々〆〤]/g;
        const kanjiMatches = inputText.match(kanjiRegex);

        if (!kanjiMatches) { //Possible null value error on kanjiMatches
            setKanjiData(new Map());
            return;
        }

        const kanjiList = Array.from( new Set(kanjiMatches) ); //Set->Remove duplicates

        setIsLoading(true);
        const kanjiLevels = await fetchKanjiData(kanjiList);
        setIsLoading(false);

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
                        {/*<textarea //OLD
                            className="mt-2 p-3 border rounded-md resize-none h-[88vh] text-2xl"
                            value={ isLoading ? ( "Loading..." ) : (
                                Array.from(kanjiData.entries()).map(([kanji, data]) => 
                                    `${kanji}: Level ${data.wk_level}, Count: ${data.count}`).join('\n')
                                )} //TODO: Update the way kanjis are displayed
                            readOnly
                        ></textarea>*/}
                        {isLoading ? ( <p className="text-xl">Loading...</p>
                        ) : (
                        <div className="mt-2 p-3 border rounded-md flex flex-wrap justify-start overflow-y-auto max-h-[88vh] scrollbar-hide">
                            {Array.from(kanjiData.entries()).map(([kanji, data]) => (
                            <KanjiCard key={kanji} kanji={kanji} wk_level={data.wk_level} count={data.count} />
                            ))}
                        </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;

//npm run dev