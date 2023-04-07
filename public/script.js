const gridContainer = document.getElementById("gridContainer");
const results = [];

async function fetchCompletions(apiKey, promptList) {
  const customPromptList = promptList.split("?").map((prompt) => prompt.trim() + "?");
  const lastIndex = customPromptList.length - 1;
  for (const [index, prompt] of customPromptList.entries()) {
    if (index === lastIndex || prompt.trim() === "") {
      console.warn("Skipping empty or last prompt");
      continue;
    }

    const response = await fetch("/api/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.9,
        max_tokens: 2000,
        top_p: 1,
        frequency_penalty: 0.0,
        presence_penalty: 0.6,
        stop: ["Human:", "AI:"],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.choices.length > 0) {
        const completionText = data.choices[0].text;
        results.push({ prompt: prompt, answer: completionText }); // Save the prompt and answer
        const gridItem = createGridItem(prompt, completionText);
        gridContainer.appendChild(gridItem);
      } else {
        console.error("No completion found for " + prompt);
      }
    } else {
      console.error("Error fetching completion for " + prompt);
    }

    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

function createGridItem(title, body) {
  const gridItem = document.createElement("div");
  gridItem.classList.add("grid-item");

  const iframe = document.createElement("iframe");
  iframe.src = `https://unitydatahub.site/save-blirb/?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
  iframe.width = "100%";
  iframe.height = "300";
  iframe.style.border = "none";
  gridItem.appendChild(iframe);

  return gridItem;
}

function saveToCsv() {
  const csvContent = "data:text/csv;charset=utf-8," + results.map(e => `${e.prompt.replace(/,/g, '')},${e.answer.replace(/,/g, '')}`).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "results.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const apiForm = document.getElementById("apiForm");
apiForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const apiKeyInput = document.getElementById("apiKey");
  const promptListTextarea = document.getElementById("promptList");
  const apiKey = apiKeyInput.value.trim();
  const promptList = promptListTextarea.value.trim();

  if (!apiKey || !promptList) {
    alert("Please enter an API key and a list of prompts.");
    return;
  }

  fetchCompletions(apiKey, promptList);
});

const saveButton = document.getElementById("saveButton");
saveButton.addEventListener("click", saveToCsv);
