// Handle search button click
document.getElementById("searchBtn").addEventListener("click", () => {
  const word = document.getElementById("wordInput").value.trim().toLowerCase();
  const resultBox = document.getElementById("result");
  const statusMsg = document.getElementById("statusMsg");

  // Reset UI
  resultBox.classList.add("hidden");
  statusMsg.classList.add("hidden");
  statusMsg.textContent = "";

  if (!word) {
    showStatus("Please enter a word.", "error");
    return;
  }

  fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
    .then((res) => {
      if (!res.ok) {
        throw new Error("Word not found");
      }
      return res.json();
    })
    .then((data) => {
      const entry = data[0];
      const meaning = entry.meanings[0].definitions[0].definition;
      const example =
        entry.meanings[0].definitions[0].example || "No example available.";

      document.getElementById("wordTitle").textContent = word;
      document.getElementById("definition").textContent = meaning;
      document.getElementById("example").textContent = example;

      document.getElementById("result").classList.remove("hidden");
    })
    .catch((err) => {
      showStatus("❌ Could not find meaning for that word.", "error");
      console.error(err);
    });
});

// Handle save button click
document.getElementById("saveBtn").addEventListener("click", () => {
  const word = document.getElementById("wordTitle").textContent.trim();
  const meaning = document.getElementById("definition").textContent.trim();
  const example = document.getElementById("example").textContent.trim();
  const note = document.getElementById("noteInput").value.trim();

  if (!word || !meaning) return;

  const vocabEntry = {
    word,
    meaning,
    example,
    note,
  };

  chrome.storage.local.get({ vocabList: [] }, (data) => {
    const updatedList = data.vocabList;

    const exists = updatedList.some((entry) => entry.word === word);
    if (exists) {
      showStatus("❗ Word already saved.", "error");
      return;
    }

    updatedList.push(vocabEntry);

    chrome.storage.local.set({ vocabList: updatedList }, () => {
      showStatus("✅ Word saved!", "success");
      document.getElementById("noteInput").value = "";
    });
  });
});

// Handle download button click
document.getElementById("downloadBtn").addEventListener("click", () => {
  chrome.storage.local.get({ vocabList: [] }, (data) => {
    const vocabList = data.vocabList;

    if (vocabList.length === 0) {
      showStatus("❗ No vocab saved to download.", "error");
      return;
    }

    let textContent = "";
    vocabList.forEach((entry) => {
      textContent += `Word: ${entry.word}\n`;
      textContent += `Meaning: ${entry.meaning}\n`;
      textContent += `Example: ${entry.example}\n`;
      textContent += `Note: ${entry.note || "—"}\n`;
      textContent += `------------------------\n\n`;
    });

    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "my_vocab_list.txt";
    a.click();

    URL.revokeObjectURL(url);
  });
});

// Status message display helper
function showStatus(message, type) {
  const status = document.getElementById("statusMsg");
  status.textContent = message;
  status.className = type;
  status.classList.remove("hidden");

  setTimeout(() => {
    status.classList.add("hidden");
  }, 2500);
}
