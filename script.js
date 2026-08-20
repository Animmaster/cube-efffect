import gsap from "gsap";

const TILES_X = 12;
const TILES_Y = 9;
const TILE_SIZE = 60;
const PREVIEW_WIDTH = TILES_X * TILE_SIZE;
const PREVIEW_HEIGHT = TILES_Y * TILE_SIZE;

const TILE_FACES = [
  "face-front",
  "face-rear",
  "face-right",
  "face-left",
  "face-top",
  "face-bottom",
];

const PROJECT_IMAGES = [
  "/default.jpg",
  "/img1.jpg",
  "/img2.jpg",
  "/img3.jpg",
  "/img4.jpg",
  "/img5.jpg",
  "/img6.jpg",
];

const previewEl = document.querySelector(".project-preview");
const tiles = [];

for (let row = 0; row < TILES_Y; row++) {
  for (let col = 0; col < TILES_X; col++) {
    const tile = document.createElement("div");
    tile.className = "tile";

    const faces = {};

    TILE_FACES.forEach((side) => {
      const face = document.createElement("div");
      face.className = `tile-face ${side}`;
      tile.appendChild(face);
      faces[side] = face;
    });

    previewEl.appendChild(tile);
    tiles.push({ element: tile, faces, row, col });
  }
}

function setTileImage(tile, side, imagePath) {
  const face = tile.faces[side];
  const offsetX = -(tile.col * TILE_SIZE);
  const offsetY = -(tile.row * TILE_SIZE);

  face.style.backgroundImage = `url(${imagePath})`;
  face.style.backgroundSize = `${PREVIEW_WIDTH}px ${PREVIEW_HEIGHT}px`;
  face.style.backgroundPosition = `${offsetX}px ${offsetY}px`;
}

tiles.forEach((tile) => {
  setTileImage(tile, "face-front", PROJECT_IMAGES[0]);
  setTileImage(tile, "face-rear", PROJECT_IMAGES[0]);
  setTileImage(tile, "face-right", PROJECT_IMAGES[0]);
  setTileImage(tile, "face-left", PROJECT_IMAGES[0]);

  tile.faces["face-top"].style.background = "#222";
  tile.faces["face-bottom"].style.background = "#222";
});

function breathe(tileElement) {
  gsap.to(tileElement, {
    z: gsap.utils.random(-40, 40),
    duration: gsap.utils.random(0.6, 1.4),
    ease: "sine.inOut",
    onComplete: () => breathe(tileElement),
  });
}

tiles.forEach((tile, i) => {
  gsap.delayedCall(i * 0.015, () => breathe(tile.element));
});

let activeProject = 0;
let revealCount = 0;
let isRevealing = false;
let nextProject = null;
let hoverDelay = null;

function getHiddenFace() {
  return revealCount % 2 === 0 ? "face-rear" : "face-front";
}

function revealProject(projectIndex) {
  if (projectIndex === activeProject && !isRevealing) return;

  if (isRevealing) {
    nextProject = projectIndex;
    return;
  }

  if (projectIndex === activeProject) return;

  isRevealing = true;
  nextProject = null;

  const hiddenFace = getHiddenFace();

  tiles.forEach((tile) => {
    setTileImage(tile, hiddenFace, PROJECT_IMAGES[projectIndex]);
  });

  tiles.forEach((tile) => {
    setTileImage(tile, "face-right", PROJECT_IMAGES[0]);
    setTileImage(tile, "face-left", PROJECT_IMAGES[0]);
  });

  revealCount++;
  activeProject = projectIndex;

  gsap.to(".tile", {
    rotateY: revealCount * 180,
    duration: 0.5,
    ease: "power3.inOut",
    stagger: {
      each: 0.05,
      from: "center",
      grid: [TILES_Y, TILES_X],
    },
    onComplete: () => {
      isRevealing = false;

      if (nextProject !== null && nextProject !== activeProject) {
        revealProject(nextProject);
      }
    },
  });
}

const projectLinks = document.querySelectorAll(".project-list a");

projectLinks.forEach((link) => {
  link.addEventListener("mouseenter", () => {
    projectLinks.forEach((l) => l.classList.remove("active"));
    link.classList.add("active");

    const projectIndex = parseInt(link.dataset.index);

    clearTimeout(hoverDelay);
    hoverDelay = setTimeout(() => revealProject(projectIndex), 50);
  });
});

document.querySelector(".project-list").addEventListener("mouseleave", () => {
  projectLinks.forEach((link) => link.classList.remove("active"));

  clearTimeout(hoverDelay);
  hoverDelay = setTimeout(() => revealProject(0), 50);
});
