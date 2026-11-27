export const personality = {
  intro: "Away from my projects, I watch a lot of soccer, movies, TV shows, and anime. I’m always up for finding something new to watch.",
  interests: [
    { id: "soccer", title: "Soccer", description: "Live matches, highlights, and replays." },
    { id: "movies", title: "Movies", description: "Anything from a big release to a movie I’ve been meaning to catch up on." },
    { id: "tv", title: "TV shows", description: "A series I can settle into, one episode at a time." },
    { id: "anime", title: "Anime", description: "Long-running series and shorter stories I can finish over a weekend." },
  ],
} as const;

export const favoriteMovies = [
  { title: "Ford v Ferrari", poster: "ford-v-ferrari.jpg", accent: "#a7d7ff", position: "center 28%" },
  { title: "The Batman", poster: "the-batman.jpg", accent: "#ff7166", position: "center 23%" },
  { title: "Rocky", poster: "rocky.jpg", accent: "#e8d196" },
] as const;

export const favoritePlayers = [
  {
    title: "Messi", note: "The GOAT", moment: "Header vs. Manchester United · 2009 Champions League final",
    poster: "messi.jpg", accent: "#95dcff", position: "64% 26%",
    credit: "Reuters via beIN SPORTS",
    source: "https://www.beinsports.com/en-us/soccer/mls/articles-video/-video-lionel-messi-chose-this-goal-as-the-best-of-his-entire-career-2025-05-22",
  },
  {
    title: "Neymar", moment: "The late free kick vs. PSG · La Remontada, 2017",
    poster: "neymar.jpg", accent: "#ffe279", position: "50% 27%",
    credit: "Match photo via GOAL",
    source: "https://www.goal.com/es-cl/noticias/neymar-mi-mejor-recuerdo-en-el-futbol-la-remontada-de-barcelona-ante-psg/1ndyniwupf8dt1ug9ex0jywj2i",
  },
  {
    title: "Modrić", moment: "Outside-of-the-boot assist vs. Chelsea · 2022",
    poster: "modric.jpg", accent: "#ffaca6", position: "65% 35%",
    credit: "Match photo via Người Đưa Tin",
    source: "https://www.nguoiduatin.vn/modric-kien-tao-sieu-pham-khien-chelsea-tro-thanh-cuu-vuong-204549576.htm",
  },
] as const;

export const favoriteTvShows = [
  { title: "Daredevil", poster: "daredevil.jpg", accent: "#ff8279", wallpaper: "daredevil-wide.jpg", position: "31% 32%" },
  { title: "Dark", poster: "dark.jpg", accent: "#f5d17c", wallpaper: "dark-wide.jpg", position: "46% 50%" },
  { title: "My Name", poster: "my-name.jpg", accent: "#ff9b84", wallpaper: "my-name-wide.jpg", position: "47% 42%" },
] as const;

export const favoriteAnime = [
  { title: "Attack on Titan", poster: "attack-on-titan.jpg", accent: "#f2b67d", wallpaper: "attack-on-titan-wide.jpg", position: "50% 56%" },
  { title: "Link Click", poster: "link-click.jpg", accent: "#a8ddff", wallpaper: "link-click-wide.jpg", position: "54% 43%" },
  { title: "Naruto", poster: "naruto.jpg", accent: "#ffbf78", wallpaper: "naruto-wide.jpg", position: "51% 44%" },
] as const;
