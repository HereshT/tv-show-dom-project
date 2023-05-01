function createShowSelect(shows) {
  const select = document.createElement("select");
  select.id = "show-select";
  select.innerHTML = '<option value="">Select a show</option>';

  shows.forEach((show, index) => {
    const option = document.createElement("option");
    option.value = show.id;
    option.textContent = show.name;
    if (index === 0) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}
function createEpisodeSelect(episodes) {
  const select = document.createElement("select");
  select.id = "episode-select";
  select.innerHTML = '<option value="">All episodes</option>';

  episodes.forEach((episode, index) => {
    const option = document.createElement("option");
    option.value = episode.id;
    option.textContent = `S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")} - ${episode.name}`;
    if (index === 0) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  return select;
}

function setup() {
  const searchInput = document.createElement("input");
  searchInput.id = "search-input";
  searchInput.type = "text";
  searchInput.placeholder = "Search episodes...";
  const searchResults = document.createElement("p");
  searchResults.id = "search-results";

  const rootElem = document.getElementById("root");
  rootElem.appendChild(searchInput);
  rootElem.appendChild(searchResults);

  const allShows = getAllShows().sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
  );
  const showSelect = createShowSelect(allShows);
  rootElem.insertBefore(showSelect, searchInput);

  showSelect.addEventListener("change", (event) => {
    const selectedShowId = parseInt(event.target.value);
    if (selectedShowId) {
      // Remove the existing episode select element
      const episodeSelect = document.getElementById("episode-select");
      if (episodeSelect) {
        rootElem.removeChild(episodeSelect);
      }

      fetchAndDisplayEpisodes(selectedShowId, searchInput);
    }
  });

  if (allShows.length > 0) {
    showSelect.value = allShows[0].id;
    fetchAndDisplayEpisodes(allShows[0].id, searchInput);
  }
}

function fetchAndDisplayEpisodes(showId, searchInput) {
  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => response.json())
    .then((allEpisodes) => {
      const rootElem = document.getElementById("root");
      const episodeSelect = createEpisodeSelect(allEpisodes);

      rootElem.insertBefore(
        episodeSelect,
        document.getElementById("search-results")
      );

      searchInput.addEventListener("input", (event) => {
        searchEpisodes(event.target.value, allEpisodes);
      });

      episodeSelect.addEventListener("change", (event) => {
        const selectedEpisodeId = parseInt(event.target.value);
        if (selectedEpisodeId) {
          const selectedEpisode = allEpisodes.find(
            (ep) => ep.id === selectedEpisodeId
          );
          makePageForEpisodes([selectedEpisode]);
        } else {
          makePageForEpisodes(allEpisodes);
        }
      });

      makePageForEpisodes(allEpisodes);
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
    });
}

function makePageForEpisodes(episodeList) {
  const rootElem = document.getElementById("root");

  const oldContainer = document.querySelector(".episodes-container");
  if (oldContainer) {
    rootElem.removeChild(oldContainer);
  }

  const newContainer = document.createElement("div");
  newContainer.className = "episodes-container";
  displayEpisodes(episodeList, newContainer);
  rootElem.appendChild(newContainer);
}

function displayEpisodes(episodes, rootElem, searchTerm = "") {
  const container = document.createElement("div");
  container.className = "episodes-container";

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";

    const title = document.createElement("h2");
    title.innerHTML = highlightSearchTerm(
      `${episode.name} - S${String(episode.season).padStart(2, "0")}E${String(
        episode.number
      ).padStart(2, "0")}`,
      searchTerm
    );
    episodeCard.appendChild(title);

    const image = document.createElement("img");
    image.src = episode.image.medium;
    episodeCard.appendChild(image);

    const summary = document.createElement("p");
    summary.innerHTML = highlightSearchTerm(episode.summary, searchTerm);
    episodeCard.appendChild(summary);

    container.appendChild(episodeCard);
  });

  rootElem.appendChild(container);
}

function highlightSearchTerm(text, searchTerm) {
  if (!searchTerm) return text;

  const searchTermLower = searchTerm.toLowerCase();
  const textLower = text.toLowerCase();
  const regex = new RegExp("(" + escapeRegExp(searchTermLower) + ")", "gi");

  return text.replace(regex, (match) => {
    return "<mark>" + match + "</mark>";
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&");
}

function searchEpisodes(searchTerm, allEpisodes) {
  const rootElem = document.getElementById("root");
  const searchResults = document.getElementById("search-results");

  const filteredEpisodes = allEpisodes.filter((episode) => {
    const searchTermLowerCase = searchTerm.toLowerCase();
    return (
      episode.name.toLowerCase().includes(searchTermLowerCase) ||
      episode.summary.toLowerCase().includes(searchTermLowerCase)
    );
  });

  searchResults.textContent = `Displaying ${filteredEpisodes.length} episode(s)`;
  const oldContainer = document.querySelector(".episodes-container");
  const newContainer = document.createElement("div");
  newContainer.className = "episodes-container";
  rootElem.replaceChild(newContainer, oldContainer);
  displayEpisodes(filteredEpisodes, newContainer);
}

window.onload = setup;
