
const About = () => {
    return (
        <div className="mx-auto py-5 px-5">
            <p>A simple web application to count Japanese Kanji characters in a given text.</p>
            <p>Level data is from WaniKani, an excellent site for learning Kanji.</p>
            <p>This application uses data from https://github.com/davidluzgouveia/kanji-data/ to function. Thank you. Specifically, kanji-wanikani.json</p>
            <p>Notice: Level -1 on WaniKani (WK) means that it is not in WaniKani.</p>
        </div>
    )
};

export default About;