## Input Japanese text, get the occurance of a specific Kanji character as well as its WaniKani level back!

This was an idea of an application that I always wished existed. Nothing fancy.
Essentially, when you input text it contacts a backend database to recieve data for each character, and then displays it for the user.

<img width="818" height="888" alt="image" src="https://github.com/user-attachments/assets/fdca41ba-fa09-40db-9d8e-de7193b6c5e3" />

This application runs using MongoDB. For my personal implementation, I used MongoDB Atlas. There is a free tier which is sufficient.
On MongoDB Atlas, create a cluster, then a database and collection. For the collection, insert WK_Data.json as the document.
On the backend, it is a list of many kanji characters and their respective data.
