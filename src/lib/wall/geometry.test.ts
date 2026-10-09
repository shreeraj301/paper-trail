import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MOODS, poems } from "../../data/poems.ts";
import {
  boundsOf,
  curatedPositions,
  frameCamera,
  maxOverlap,
  paperRect,
  searchPoems,
  shufflePositions,
  WORLD,
  ZOOM_MAX,
  ZOOM_MIN,
} from "./geometry.ts";

describe("poem data", () => {
  it("keeps the author's poems intact", () => {
    assert.ok(poems.length >= 30);
    const slugs = new Set(poems.map((poem) => poem.slug));
    assert.equal(slugs.size, poems.length);
    for (const poem of poems) {
      assert.ok(MOODS.includes(poem.mood), poem.id);
      assert.ok(poem.body.length > 0, poem.id);
    }
    const moon = poems.find((poem) => poem.id === "allow-me");
    assert.ok(moon?.body.includes("billions of face in this world"));
    const floor = poems.find((poem) => poem.id === "floor");
    assert.ok(floor?.body.includes("served it's toll"));
    const bones = poems.find((poem) => poem.id === "bones");
    assert.ok(bones?.body.includes("ill pull off each of our anchors"));
  });
});

describe("layout", () => {
  it("keeps the curated wall almost free of overlap", () => {
    const positions = curatedPositions();
    assert.ok(maxOverlap(poems, positions) < 0.08);
    for (const poem of poems) {
      const rect = paperRect(poem, positions[poem.id]!);
      assert.ok(rect.x >= WORLD.minX && rect.y >= WORLD.minY);
      assert.ok(rect.x + rect.w <= WORLD.maxX && rect.y + rect.h <= WORLD.maxY);
    }
  });

  it("shuffles inside the useful wall without unusable overlap", () => {
    for (const seed of [3, 19, 88, 2401]) {
      const positions = shufflePositions(poems, seed);
      assert.equal(Object.keys(positions).length, poems.length);
      assert.ok(maxOverlap(poems, positions) < 0.2, `seed ${seed}`);
      const bounds = boundsOf(poems, positions);
      assert.ok(bounds);
      assert.ok(bounds.x >= 0);
      assert.ok(bounds.y >= 0);
      assert.ok(bounds.x + bounds.w < WORLD.maxX);
      assert.ok(bounds.y + bounds.h < WORLD.maxY);
    }
  });

  it("clamps zoom while framing", () => {
    const camera = frameCamera({ x: 0, y: 0, w: 4000, h: 3000 }, { w: 390, h: 800 });
    assert.ok(camera.zoom >= ZOOM_MIN && camera.zoom <= ZOOM_MAX);
    assert.equal(camera.zoom, ZOOM_MIN);
  });
});

describe("search", () => {
  it("matches title, body, mood, and tags without case sensitivity", () => {
    assert.ok(searchPoems(poems, "SEVENTEEN").some((poem) => poem.id === "remember"));
    assert.ok(searchPoems(poems, "laapata").some((poem) => poem.id === "laapata"));
    assert.ok(searchPoems(poems, "wonder").some((poem) => poem.mood === "Wonder"));
    assert.ok(searchPoems(poems, "garden").some((poem) => poem.id === "garden"));
    assert.equal(searchPoems(poems, "   ").length, 0);
    assert.equal(searchPoems(poems, "zzzz-not-a-poem").length, 0);
  });
});
