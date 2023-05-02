const rootElem = document.getElementById("root");

function createShowSelect(shows) {
  const showSelect = document.createElement("select");
  showSelect.id = "show-select";
  showSelect.innerHTML = `<option value="">Select a show</option>`;
  shows.forEach((show) => {
    showSelect.innerHTML += `<option value="${show.id}">${show.name}</option>`;
  });

  return showSelect;
}

function createEpisodeSelect(episodes) {
  const episodeSelect = document.createElement("select");
  episodeSelect.id = "episode-select";
  episodeSelect.innerHTML = `<option value="">Select an episode</option>`;
  episodes.forEach((episode) => {
    episodeSelect.innerHTML += `<option value="${episode.id}">${
      episode.name
    } - S${String(episode.season).padStart(2, "0")}E${String(
      episode.number
    ).padStart(2, "0")}</option>`;
  });

  return episodeSelect;
}

function createBackButton() {
  const backButton = document.createElement("button");
  backButton.className = "back-button";
  backButton.textContent = "Back to all shows";
  backButton.addEventListener("click", () => {
    displayShowsListing(allShows, showSelect);
  });
  return backButton;
}

const allShows = getAllShows().sort((a, b) =>
  a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
);

const searchInput = document.createElement("input");
searchInput.id = "search-input";
searchInput.type = "text";
searchInput.placeholder = "Search...";

const showSelect = createShowSelect(allShows);

const navigation = document.createElement("div");
navigation.className = "navigation";

navigation.appendChild(searchInput);
navigation.appendChild(showSelect);
rootElem.appendChild(navigation);

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value;
  const filteredShows = searchShows(searchTerm, allShows);
  displayShowsListing(filteredShows, showSelect);
});

showSelect.addEventListener("change", (event) => {
  const selectedShowId = parseInt(event.target.value);
  if (selectedShowId) {
    fetchAndDisplayEpisodes(selectedShowId);
  }
});

if (allShows.length > 0) {
  displayShowsListing(allShows, showSelect);
}

function fetchAndDisplayEpisodes(showId) {
  const showsListing = document.getElementById("shows-listing");
  showsListing.style.display = "none";

  fetch(`https://api.tvmaze.com/shows/${showId}/episodes`)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Error fetching episodes");
      }
    })
    .then((episodes) => {
      const episodeSelect = createEpisodeSelect(episodes);
      const backButton = createBackButton();
      rootElem.insertBefore(backButton, navigation.nextSibling);
      rootElem.insertBefore(episodeSelect, backButton.nextSibling);

      episodeSelect.addEventListener("change", (event) => {
        const selectedEpisodeId = parseInt(event.target.value);
        if (selectedEpisodeId) {
          displayEpisodes(
            episodes.filter((episode) => episode.id === selectedEpisodeId)
          );
        } else {
          displayEpisodes(episodes);
        }
      });

      displayEpisodes(episodes);
    })
    .catch((error) => {
      console.error("Error fetching episodes:", error);
    });
}

function searchShows(searchTerm, shows) {
  return shows.filter((show) =>
    show.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
function displayShowsListing(shows, showSelect) {
  const showsListing = document.getElementById("shows-listing");
  if (!showsListing) {
    const newShowsListing = document.createElement("div");
    newShowsListing.id = "shows-listing";
    rootElem.appendChild(newShowsListing);
  } else {
    showsListing.innerHTML = "";
    showsListing.style.display = "block";
  }

  const backButton = document.querySelector(".back-button");
  if (backButton) {
    rootElem.removeChild(backButton);
  }

  const episodeSelect = document.getElementById("episode-select");
  if (episodeSelect) {
    rootElem.removeChild(episodeSelect);
  }

  shows.forEach((show) => {
    const showCard = document.createElement("div");
    showCard.className = "show-card";
    showCard.innerHTML = `
      <h2>${show.name}</h2>
      <img src="${show.image.medium}" alt="${show.name}">
      <p>${show.summary}</p>
      <p>Genres: ${show.genres.join(", ")}</p>
      <p>Status: ${show.status}</p>
      <p>Rating: ${show.rating.average}</p>
      <p>Runtime: ${show.runtime} minutes</p>
    `;
    showCard.addEventListener("click", () => {
      fetchAndDisplayEpisodes(show.id);
    });
    document.getElementById("shows-listing").appendChild(showCard);
  });

  showSelect.value = "";
}

function displayEpisodes(episodes) {
  const episodesListing = document.getElementById("episodes-listing");
  if (!episodesListing) {
    const newEpisodesListing = document.createElement("div");
    newEpisodesListing.id = "episodes-listing";
    rootElem.appendChild(newEpisodesListing);
  } else {
    episodesListing.innerHTML = "";
  }

  episodes.forEach((episode) => {
    const episodeCard = document.createElement("div");
    episodeCard.className = "episode-card";
    episodeCard.innerHTML = `
      <h2>${episode.name} - S${String(episode.season).padStart(
      2,
      "0"
    )}E${String(episode.number).padStart(2, "0")}</h2>
      <img src="${episode.image.medium}" alt="${episode.name}">
      <p>${episode.summary}</p>
    `;
    document.getElementById("episodes-listing").appendChild(episodeCard);
  });
}
window.onload = setup;

//  400
