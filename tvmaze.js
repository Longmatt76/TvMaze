"use strict";

const $showsList = $("#shows-list");
const $episodesArea = $("#episodes-area");
const $searchForm = $("#search-form");
const MISSING_IMAGE_URL = "http://tinyurl.com/missing-tv";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios.get(
    `http://api.tvmaze.com/search/shows?q=${term}`
  );

  let shows = response.data.map(function (result) {
    let show = result.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : MISSING_IMAGE_URL,
    };
  });

  return shows;
}

/** Given list of shows, create markup for each and to DOM */

function populateShows(shows) {
  const $showsList = $("#shows-list");
  $showsList.empty();

  for (let show of shows) {
    const $item = $(
      `<div class="col-md-6 col-lg-3 Show" data-show-id="${show.id}">
        <div class = "card" data-show-id="${show.id}">
        <img class= card-img-top" src="${show.image}">
        <div class="card-body">
        <h5 class = "card-title">${show.name}</h5>
        <p class = "card-text">${show.summary}</p>
        <button class="btn btn-primary get-episodes" id="epiBtn">Episodes</button>
        </div>
        </div>
        </div>
        `
    );

    $showsList.append($item);
  }
}

/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  let query = $("#search-query").val();
  if (!query) return;

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});

async function getEpisodes(id) {
  let response = await axios.get(`https://api.tvmaze.com/shows/${id}/episodes`);
  let episodes = response.data.map((episode) => ({
    id: episode.id,
    name: episode.name,
    season: episode.season,
    number: episode.number,
  }));
  return episodes;
}

function createEpisodes(episodes) {
  const $episodesList = $("#episodes-list");
  $episodesList.empty();

  for (let episode of episodes) {
    let $item = $(
      `<li>
       ${episode.name}( season: ${episode.season}, episode: ${episode.number} )
       </li>
      `
    );
    $episodesList.append($item);
  }
  $episodesArea.show();
};

$("#shows-list").on("click", ".get-episodes", async function handleClick(e){
let showId = $(e.target).closest(".Show").data("show-id");
let episodes = await getEpisodes(showId);
createEpisodes(episodes);
});
